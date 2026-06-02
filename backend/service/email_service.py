from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from fastapi import HTTPException
from service.email_config import *
from service.config import BACKEND_PUBLIC_URL

conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=MAIL_PASSWORD,
    MAIL_FROM=MAIL_FROM,
    MAIL_PORT=MAIL_PORT,
    MAIL_SERVER=MAIL_SERVER,
    MAIL_STARTTLS=MAIL_STARTTLS,
    MAIL_SSL_TLS=MAIL_SSL_TLS,
    USE_CREDENTIALS=True
)

async def send_verification_email(email: str, token: str):
    if not MAIL_USERNAME or not MAIL_PASSWORD or not MAIL_FROM:
        raise HTTPException(status_code=500, detail="Email service is not configured")

    link = f"{BACKEND_PUBLIC_URL.rstrip('/')}/auth/verify-email?token={token}"

    message = MessageSchema(
        subject="Verifica tu cuenta",
        recipients=[email],
        body=f"""
        <h2>Bienvenido a Printia </h2>
        <p>Haz clic para verificar tu cuenta:</p>
        <a href="{link}">Verificar cuenta</a>
        """,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
