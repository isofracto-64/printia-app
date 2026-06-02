import json

from fastapi import APIRouter, Depends
from service.dependencies import get_kiosk_user
from service.config import db
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4
from model import FileGroup, PrintJob, File
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select

router = APIRouter(prefix="/print-jobs", tags=["print"])


async def estimate_cost(session: AsyncSession, file_group_id: str, copies: int, color: str) -> float:
    result = await session.execute(select(File).where(File.file_group_id == file_group_id))
    files = result.scalars().all()
    pages = sum((f.pages or 1) for f in files)
    unit_price = 3.0 if color == "color" else 1.5
    return round(pages * max(copies, 1) * unit_price, 2)


@router.post("/")
async def create_print_job(
    file_group_id: str = Query(...), 
    copies: int = Query(1),
    color: str = Query("color"),
    qr_token: str = Query(""),
    context=Depends(get_kiosk_user()),
    session: AsyncSession = Depends(db.get_session)
):
    user = context["user"]
    kiosk_id = context["kiosk_id"]
    estimated_cost = await estimate_cost(session, file_group_id, copies, color)
    file_group = await session.scalar(select(FileGroup).where(FileGroup.id == file_group_id))
    owner_user_id = file_group.user_id if file_group else user.id


    job = PrintJob(
        id=str(uuid4()),
        file_group_id=file_group_id,
        user_id=owner_user_id,
        kiosk_id=kiosk_id,
        status="ready",
        estimated_cost=estimated_cost,
        settings=json.dumps({"copies": copies, "color": color, "qr_token": qr_token})
    )

    session.add(job)
    await session.commit()

    return {
        "message": "Trabajo de impresión configurado",
        "job_id": job.id,
        "estimated_cost": estimated_cost
    }

@router.post("/print/{job_id}/execute")
async def execute_print_job(
    job_id: str,
    context=Depends(get_kiosk_user()),
    session: AsyncSession = Depends(db.get_session)
):
    import os
    from model import QRCode


    job = await session.scalar(
        select(PrintJob).where(PrintJob.id == job_id)
    )

    if not job:
        raise HTTPException(404, "Job not found")

    if job.kiosk_id != context["kiosk_id"]:
        raise HTTPException(403, "This job belongs to another kiosk")

    if job.status != "ready":
        raise HTTPException(400, "Job not ready")


    qr = await session.scalar(
        select(QRCode).where(QRCode.file_group_id == job.file_group_id)
    )

    if not qr:
        raise HTTPException(404, "QR not found")

    result = await session.execute(
        select(File).where(File.file_group_id == job.file_group_id)
    )
    files = result.scalars().all()

    job.status = "printing"
    await session.commit()


    for f in files:
        old_path = f.file_path

        new_path = old_path.replace("/qr/", "/history/")

        os.makedirs(os.path.dirname(new_path), exist_ok=True)

        os.rename(old_path, new_path)

        f.file_path = new_path
        f.status = "PRINTED"

    job.status = "done"
    job.final_cost = job.estimated_cost

    await session.commit()

    return {
        "message": "Printed successfully",
        "files_moved": len(files)
    }
