from fastapi import APIRouter

from service.schema import ResponseSchema, RegisterSchema, LoginSchema, ForgotPasswordSchema
from service.auth_service import AuthService
from sqlalchemy.ext.asyncio import AsyncSession
from service.config import db
from fastapi import Depends
from sqlalchemy.future import select
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from model.users import Users
from service.dependencies import require_role

router = APIRouter(prefix="/auth", tags=['Authentication'])


@router.post("/register", response_model=ResponseSchema)
async def register_user(
    payload: RegisterSchema,
    session: AsyncSession = Depends(db.get_session)
):
    result = await AuthService.register_service(payload, session)

    return ResponseSchema(
        detail="User registered",
        result=result
    )


@router.post("/login", response_model=ResponseSchema)
async def login(
    payload: LoginSchema,
    session: AsyncSession = Depends(db.get_session)
):
    result = await AuthService.logins_service(payload, session)

    return ResponseSchema(
        detail="Login successful",
        result=result
    )


@router.post("/forgot-password", response_model=ResponseSchema)
async def forgot_password(
    payload: ForgotPasswordSchema,
    session: AsyncSession = Depends(db.get_session)
):
    result = await AuthService.forgot_password_service(payload, session)

    return ResponseSchema(
        detail="Password updated successfully",
        result=result
    )


@router.get("/verify-email", response_model=ResponseSchema)
async def verify_email(
    token: str,
    session: AsyncSession = Depends(db.get_session)
):
    email = AuthService.verify_email_token(token)

    user = await session.scalar(
        select(Users).where(Users.email == email)
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified:
        return ResponseSchema(
            detail="Email already verified",
            result={"email": email}
        )

    user.is_verified = True
    await session.commit()

    return ResponseSchema(
        detail="Email verified successfully",
        result={"email": email}
    )



@router.post("/kiosk-login", response_model=ResponseSchema)
async def kiosk_login(
    payload: LoginSchema,
    kiosk_context=Depends(require_role("KIOSK")),
    session: AsyncSession = Depends(db.get_session)
):
    result = await AuthService.kiosk_login_service(
        payload,
        kiosk_user=kiosk_context["user"],   
        session=session
    )

    return ResponseSchema(
        detail="Kiosk login successful",
        result=result
    )