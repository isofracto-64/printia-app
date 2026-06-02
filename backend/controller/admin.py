from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from model import (
    KioskConfig,
    Person,
    Role,
    SupportTicket,
    UserCredit,
    StudentInfo,
    University,
    Users,
    UsersRole,
)
from repository.users import UsersRepository
from service.config import db
from service.dependencies import require_role
from service.schema import ResponseSchema

router = APIRouter(prefix="/admin", tags=["admin"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AdminUserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None
    balance: Optional[float] = None
    password: Optional[str] = None
    matricula: Optional[str] = None


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    admin_note: Optional[str] = None


class KioskConfigPayload(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    esp32_cam_url: Optional[str] = None


async def get_or_create_kiosk_config(session: AsyncSession) -> KioskConfig:
    config = await session.scalar(select(KioskConfig).limit(1))
    if config:
        return config

    config = KioskConfig(id=str(uuid4()))
    session.add(config)
    await session.commit()
    await session.refresh(config)
    return config


@router.get("/users", response_model=ResponseSchema)
async def list_users(
    search: str = Query("", alias="q"),
    session: AsyncSession = Depends(db.get_session),
    payload: dict = Depends(require_role("ADMIN")),
):
    query = (
        select(Users)
        .join(Person, Users.person_id == Person.id)
        .options(
            selectinload(Users.person),
            selectinload(Users.roles),
            selectinload(Users.credit),
            selectinload(Users.student_info),
        )
        .limit(80)
    )

    if search:
        pattern = f"%{search}%"
        query = query.where(
            or_(
                Users.username.ilike(pattern),
                Users.email.ilike(pattern),
                Person.name.ilike(pattern),
            )
        )

    result = await session.execute(query)
    users = result.scalars().all()

    return ResponseSchema(
        detail="Users loaded",
        result=[
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "name": user.person.name if user.person else "",
                "profile": user.person.profile if user.person else None,
                "role": user.roles[0].role_name if user.roles else "user",
                "balance": user.credit.balance if user.credit else 0,
                "matricula": user.student_info.matricula if user.student_info else None,
                "university_id": user.student_info.university_id if user.student_info else None,
            }
            for user in users
        ],
    )


@router.patch("/users/{user_id}", response_model=ResponseSchema)
async def update_user(
    user_id: str,
    data: AdminUserUpdate,
    session: AsyncSession = Depends(db.get_session),
    payload: dict = Depends(require_role("ADMIN")),
):
    user = await session.scalar(
        select(Users)
        .where(Users.id == user_id)
        .options(selectinload(Users.person), selectinload(Users.credit))
    )
    if not user:
        raise HTTPException(404, "User not found")

    if data.username and data.username != user.username:
        existing = await session.scalar(select(Users).where(Users.username == data.username))
        if existing:
            raise HTTPException(400, "Username already exists")
        user.username = data.username

    if data.email and data.email != user.email:
        existing = await session.scalar(select(Users).where(Users.email == data.email))
        if existing:
            raise HTTPException(400, "Email already exists")
        user.email = data.email

    if data.name and user.person:
        user.person.name = data.name

    if data.balance is not None:
        if not user.credit:
            session.add(UserCredit(user_id=user.id, balance=data.balance))
        else:
            user.credit.balance = data.balance

    if data.password:
        if len(data.password) < 6:
            raise HTTPException(400, "Password must have at least 6 characters")
        user.password = pwd_context.hash(data.password)

    if data.matricula is not None:
        clean_matricula = data.matricula.strip().lower()
        existing = await session.scalar(
            select(StudentInfo).where(
                StudentInfo.matricula == clean_matricula,
                StudentInfo.user_id != user.id,
            )
        )
        if clean_matricula and existing:
            raise HTTPException(400, "Matricula already registered")

        student = await session.scalar(select(StudentInfo).where(StudentInfo.user_id == user.id))
        if clean_matricula:
            if student:
                student.matricula = clean_matricula
            else:
                university = await session.scalar(select(University).limit(1))
                if not university:
                    raise HTTPException(400, "No university configured")
                session.add(
                    StudentInfo(
                        id=str(uuid4()),
                        user_id=user.id,
                        university_id=university.id,
                        matricula=clean_matricula,
                    )
                )
        elif student:
            await session.delete(student)

    if data.role:
        await UsersRepository.update_user_role(session, user.id, data.role.lower())
    else:
        await session.commit()

    return ResponseSchema(detail="User updated", result={"id": user_id})


@router.delete("/users/{username}", response_model=ResponseSchema)
async def delete_user(
    username: str,
    session: AsyncSession = Depends(db.get_session),
    payload: dict = Depends(require_role("ADMIN")),
):
    deleted = await UsersRepository.delete_by_username(session, username)
    if not deleted:
        raise HTTPException(404, "User not found")
    return ResponseSchema(detail="User deleted", result={"username": username})


@router.put("/users/{username}/role")
async def change_user_role(
    username: str,
    role: str = Query(...),
    session: AsyncSession = Depends(db.get_session),
    payload: dict = Depends(require_role("ADMIN")),
):
    user = await UsersRepository.find_by_username(username)

    if not user:
        return ResponseSchema(detail="User not found", result=None)

    await UsersRepository.update_user_role(session, user.id, role)

    return ResponseSchema(
        detail="Role updated successfully",
        result={"username": username, "new_role": role},
    )


@router.get("/tickets", response_model=ResponseSchema)
async def list_tickets(
    session: AsyncSession = Depends(db.get_session),
    payload: dict = Depends(require_role("ADMIN")),
):
    result = await session.execute(
        select(SupportTicket, Users, Person)
        .join(Users, SupportTicket.user_id == Users.id)
        .join(Person, Users.person_id == Person.id)
        .order_by(SupportTicket.created_at.desc())
    )

    return ResponseSchema(
        detail="Tickets loaded",
        result=[
            {
                "id": ticket.id,
                "subject": ticket.subject,
                "message": ticket.message,
                "status": ticket.status,
                "admin_note": ticket.admin_note,
                "created_at": ticket.created_at,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "name": person.name,
                },
            }
            for ticket, user, person in result.all()
        ],
    )


@router.patch("/tickets/{ticket_id}", response_model=ResponseSchema)
async def update_ticket(
    ticket_id: str,
    data: TicketUpdate,
    session: AsyncSession = Depends(db.get_session),
    payload: dict = Depends(require_role("ADMIN")),
):
    ticket = await session.scalar(select(SupportTicket).where(SupportTicket.id == ticket_id))
    if not ticket:
        raise HTTPException(404, "Ticket not found")

    if data.status:
        ticket.status = data.status
    if data.admin_note is not None:
        ticket.admin_note = data.admin_note

    await session.commit()
    return ResponseSchema(detail="Ticket updated", result={"id": ticket_id})


@router.get("/kiosk-config", response_model=ResponseSchema)
async def read_kiosk_config(
    session: AsyncSession = Depends(db.get_session),
    payload: dict = Depends(require_role("USER", "ADMIN", "KIOSK")),
):
    config = await get_or_create_kiosk_config(session)
    return ResponseSchema(detail="Kiosk config loaded", result=config.dict())


@router.put("/kiosk-config", response_model=ResponseSchema)
async def update_kiosk_config(
    data: KioskConfigPayload,
    session: AsyncSession = Depends(db.get_session),
    payload: dict = Depends(require_role("ADMIN")),
):
    config = await get_or_create_kiosk_config(session)
    for key, value in data.dict(exclude_unset=True).items():
        setattr(config, key, value)

    await session.commit()
    await session.refresh(config)
    return ResponseSchema(detail="Kiosk config updated", result=config.dict())
