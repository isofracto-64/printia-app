from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import AsyncSession
from dotenv import load_dotenv
import os

load_dotenv()

def build_async_database_url(url: str) -> str:
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


DATABASE_URL = build_async_database_url(os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://user:password@localhost:5432/printia_db",
))
SECRET_KEY = os.getenv("SECRET_KEY", "change-this-secret-before-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTE = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTE", "30"))
BACKEND_PUBLIC_URL = os.getenv("BACKEND_PUBLIC_URL", "http://localhost:8000")
SQL_ECHO = os.getenv("SQL_ECHO", "false").lower() == "true"
AUTO_VERIFY_EMAILS = os.getenv("AUTO_VERIFY_EMAILS", "false").lower() == "true"
CORS_ALLOW_ALL = os.getenv("CORS_ALLOW_ALL", "false").lower() == "true"
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000",
    ).split(",")
    if origin.strip()
]


class AsyncDatabaseSession:
    def __init__(self) -> None:
        self.engine = None
        self.SessionLocal = None

    def init(self):

        self.engine = create_async_engine(
            DATABASE_URL,
            echo=SQL_ECHO,
            future=True
        )


        self.SessionLocal = sessionmaker(
            bind=self.engine,
            class_=AsyncSession,
            expire_on_commit=False
        )

    async def create_all(self):
        async with self.engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)

    async def get_session(self):
        async with self.SessionLocal() as session:
            yield session

    async def close(self):
        await self.engine.dispose()


db = AsyncDatabaseSession()
