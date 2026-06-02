
from fastapi import HTTPException
import logging
import re
from typing import TypeVar, Optional

from pydantic import BaseModel, validator
from sqlalchemy import false
from model.person import Sex


T = TypeVar('T')

# get root logger
logger = logging.getLogger(__name__)


class RegisterSchema(BaseModel):

    username: str
    email: str
    name: str
    password: str
    phone_number: str
    birth: str
    sex: Sex
    profile: str = "base64"

    is_student: bool
    university_id: Optional[str] = None
    matricula: Optional[str] = None



    @validator("phone_number")
    def phone_validation(cls, v):
        logger.debug(f"phone in 2 validatior: {v}")


        regex = r"^[\+]?[(]?[0-9]{2,4}[)]?[-\s\.]?[0-9]{4}[-\s\.]?[0-9]{4,6}$"
        if v and not re.search(regex, v, re.I):
            raise HTTPException(status_code=400, detail="Invalid input phone number!")
        return v

    @validator("username", "email", "name", "password", "birth")
    def required_text_validation(cls, v):
        if not str(v or "").strip():
            raise HTTPException(status_code=400, detail="Required field is empty")
        return v

    @validator("email")
    def email_validation(cls, v):
        email = str(v or "").strip().lower()
        regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
        if not re.match(regex, email):
            raise HTTPException(status_code=400, detail="Invalid email")
        return email

    @validator("password")
    def password_validation(cls, v):
        if len(str(v or "")) < 6:
            raise HTTPException(status_code=400, detail="Password must have at least 6 characters")
        return v

    @validator("sex")
    def sex_validation(cls, v):
        if hasattr(Sex, v) is False:
            raise HTTPException(status_code=400, detail="Invalid input sex")
        return v


class LoginSchema(BaseModel):
    username: str
    password: str


class ForgotPasswordSchema(BaseModel):
    email: str
    new_password: str
    confirm_password: str


class DetailSchema(BaseModel):
    status: str
    message: str
    result: Optional[T] = None


class ResponseSchema(BaseModel):
    detail: str
    result: Optional[T] = None
