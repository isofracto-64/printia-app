import os
import qrcode
import base64
from uuid import uuid4
from typing import List
from pathlib import Path
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query, HTTPException, UploadFile, File as FastFile, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from model import University, PrintJob, QRCode, File, SupportTicket, Users, Person
from service.schema import ResponseSchema
from service.users import UserService
from service.config import db
from service.config import BACKEND_PUBLIC_URL
from service.dependencies import (
    require_role, 
    get_current_kiosk, 
    get_current_user, 
    get_kiosk_user
)
from service.file_service import FileService

router = APIRouter(
    prefix="/users",
    tags=['user'],
)


class SupportTicketCreate(BaseModel):
    subject: str
    message: str


class CreditSimulation(BaseModel):
    amount: float


@router.get("/me", response_model=ResponseSchema)
async def get_user_profile(
    context=Depends(require_role("USER", "ADMIN")),
    session: AsyncSession = Depends(db.get_session)
):
    user = context["user"]
    result = await UserService.get_user_profile(user.username, session)
    return ResponseSchema(
        detail="Successfully fetch user profile!",
        result=result
    )

@router.put("/profile/image")
async def update_profile_image(
    file: UploadFile = FastFile(...),
    user=Depends(get_current_user()), 
    session: AsyncSession = Depends(db.get_session)
):
    if file.content_type not in ["image/png", "image/jpeg"]:
        raise HTTPException(400, "Solo se permiten imágenes PNG o JPG")

    contents = await file.read()
    if len(contents) > 2 * 1024 * 1024:
        raise HTTPException(400, "La imagen es demasiado pesada (máximo 2MB)")

    encoded_image = base64.b64encode(contents).decode("utf-8")
    image_data_uri = f"data:{file.content_type};base64,{encoded_image}"

    await UserService.update_profile_image(user.id, image_data_uri, session)

    return {
        "message": "Imagen de perfil actualizada correctamente",
        "profile": image_data_uri
    }


@router.post("/upload")
async def upload_files(
    files: List[UploadFile] = FastFile(...),
    user=Depends(get_current_user()), 
    session: AsyncSession = Depends(db.get_session)
):
    try:
        file_group, saved_files = await FileService.save_files(
            files=files,
            user_id=user.id,
            session=session
        )

        return {
            "message": "Archivos listos en borrador",
            "file_group_id": str(file_group.id), 
            "files": [
                {"name": f.filename, "pages": f.pages}
                for f in saved_files
            ]
        }
    except Exception as e:
        print(f"Error en upload: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/generate-qr/{file_group_id}")
async def generate_qr(
    file_group_id: str,
    user=Depends(get_current_user()), 
    session: AsyncSession = Depends(db.get_session)
):
    result = await session.execute(
        select(File).where(File.file_group_id == file_group_id)
    )
    files = result.scalars().all()

    if not files:
        raise HTTPException(status_code=404, detail="No files found")

    base_dir = Path("uploads") / "users" / str(user.id)
    qr_files_dir = base_dir / "qr" / "files"
    qr_images_dir = base_dir / "qr" / "images"

    qr_files_dir.mkdir(parents=True, exist_ok=True)
    qr_images_dir.mkdir(parents=True, exist_ok=True)

    for f in files:
        old_path = Path(f.file_path)
        if old_path.exists():
            new_path = qr_files_dir / old_path.name
            os.rename(old_path, new_path)
            f.file_path = str(new_path)

    token = str(uuid4())
    

    qr_record = QRCode(
        id=str(uuid4()),
        file_group_id=file_group_id,
        user_id=user.id, 
        token=token,
        expires_at=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(hours=48),
    )
    session.add(qr_record)

    qr_data = f"{BACKEND_PUBLIC_URL.rstrip('/')}/users/qr/{token}"
    qr_img = qrcode.make(qr_data)
    qr_filename = f"{token}.png"
    qr_dest_path = qr_images_dir / qr_filename
    qr_img.save(str(qr_dest_path))

    await session.commit()

    return {
        "qr_token": token,
        "code": token,
        "qr_image": f"/users/qr-image/{token}",
        "expires_at": qr_record.expires_at
    }


@router.get("/history/full", response_model=ResponseSchema)
async def full_history(
    user=Depends(get_current_user()),
    session: AsyncSession = Depends(db.get_session)
):

    qr_result = await session.execute(
        select(QRCode).where(
            QRCode.file_group_id != None,
            QRCode.user_id == user.id
        )
    )
    qrs = qr_result.scalars().all()

    qr_data = []
    for qr in qrs:
        files_result = await session.execute(
            select(File).where(File.file_group_id == qr.file_group_id)
        )
        files = files_result.scalars().all()

        qr_data.append({
            "token": qr.token,
            "expires_at": qr.expires_at,
            "files": [
                {
                    "id": f.id,
                    "name": f.filename,
                    "pages": f.pages,
                    "type": f.file_type
                } for f in files
            ]
        })

    jobs_result = await session.execute(
        select(PrintJob).where(PrintJob.user_id == user.id)
    )
    jobs = jobs_result.scalars().all()

    job_data = [
        {
            "id": j.id,
            "status": j.status,
            "file_group_id": j.file_group_id,
            "estimated_cost": j.estimated_cost,
            "final_cost": j.final_cost,
            "settings": j.settings,
            "created_at": j.created_at if hasattr(j, 'created_at') else None
        }
        for j in jobs
    ]

    return ResponseSchema(
        detail="Historial cargado correctamente",
        result={
            "qrs": qr_data,
            "jobs": job_data
        }
    )


@router.post("/support/tickets", response_model=ResponseSchema)
async def create_support_ticket(
    data: SupportTicketCreate,
    user=Depends(get_current_user()),
    session: AsyncSession = Depends(db.get_session),
):
    ticket = SupportTicket(
        id=str(uuid4()),
        user_id=user.id,
        subject=data.subject.strip(),
        message=data.message.strip(),
    )
    session.add(ticket)
    await session.commit()
    return ResponseSchema(detail="Ticket created", result={"id": ticket.id})


@router.post("/credits/simulate", response_model=ResponseSchema)
async def simulate_credit_recharge(
    data: CreditSimulation,
    user=Depends(get_current_user()),
    session: AsyncSession = Depends(db.get_session),
):
    from model import UserCredit

    if data.amount <= 0:
        raise HTTPException(400, "Amount must be greater than zero")

    credit = await session.scalar(select(UserCredit).where(UserCredit.user_id == user.id))
    if not credit:
        credit = UserCredit(user_id=user.id, balance=0)
        session.add(credit)

    credit.balance = round((credit.balance or 0) + data.amount, 2)
    await session.commit()
    return ResponseSchema(detail="Credits updated", result={"balance": credit.balance})


@router.get("/qr-image/{token}")
async def get_qr_image(token: str, session: AsyncSession = Depends(db.get_session)):
    # Buscamos el QR para saber el user_id
    qr = await session.scalar(select(QRCode).where(QRCode.token == token))
    
    if not qr:
        raise HTTPException(status_code=404, detail="QR no encontrado")


    path = Path("uploads") / "users" / str(qr.user_id) / "qr" / "images" / f"{token}.png"
    
    if not path.exists():
        raise HTTPException(status_code=404, detail="Archivo físico no encontrado")
        
    return FileResponse(path)

@router.get("/qr/{token}")
async def get_files_by_qr(
    token: str,
    context=Depends(get_kiosk_user()),
    session: AsyncSession = Depends(db.get_session)
):
    qr = await session.scalar(select(QRCode).where(QRCode.token == token))
    if not qr:
        raise HTTPException(404, "QR no encontrado")
    
    if qr.expires_at and qr.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(400, "QR expirado")

    result = await session.execute(
        select(File).where(File.file_group_id == qr.file_group_id)
    )
    files = result.scalars().all()
    owner_result = await session.execute(
        select(Users, Person)
        .join(Person, Users.person_id == Person.id)
        .where(Users.id == qr.user_id)
    )
    owner_row = owner_result.first()
    owner, owner_person = owner_row if owner_row else (None, None)

    return {
        "file_group_id": qr.file_group_id,
        "qr_token": qr.token,
        "owner": {
            "id": owner.id if owner else None,
            "username": owner.username if owner else None,
            "email": owner.email if owner else None,
            "name": owner_person.name if owner_person else None,
        },
        "files": [
            {
                "id": f.id,
                "name": f.filename,
                "pages": f.pages,
                "type": f.file_type,
                "path": f.file_path,
            }
            for f in files
        ]
    }

@router.get("/universities/search", response_model=ResponseSchema)
async def search_universities(q: str, session: AsyncSession = Depends(db.get_session)):
    result = await session.execute(select(University).where(University.name.ilike(f"%{q}%")))
    universities = result.scalars().all()
    return ResponseSchema(
        detail="Universities found",
        result=[{"id": u.id, "name": u.name} for u in universities]
    )

@router.get("/kiosk/usb/status")
async def usb_status():
    import os

    USB_PATH = "/media/usb" 

    if not os.path.exists(USB_PATH):
        return {"connected": False, "files": []}

    files = []
    for f in os.listdir(USB_PATH):
        if f.lower().endswith((".pdf", ".png", ".jpg", ".jpeg")):
            files.append({
                "name": f,
                "path": f"{USB_PATH}/{f}"
            })

    return {
        "connected": len(files) > 0,
        "files": files
    }

@router.get("/kiosk/usb/preview")
async def preview_usb(path: str):
    from fastapi.responses import FileResponse
    return FileResponse(path)

@router.post("/kiosk/usb/print")
async def print_usb(data: dict):
    import os

    path = data.get("path")
    copies = data.get("copies", 1)
    color = data.get("color", "color")  # color / bw

    color_flag = "-o ColorModel=Gray" if color == "bw" else ""

    cmd = f"lp -n {copies} {color_flag} '{path}'"
    os.system(cmd)

    return {"message": "Printing started"}
