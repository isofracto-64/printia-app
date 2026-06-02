from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
from uuid import uuid4
from model.mixins import TimeMixim


class File(TimeMixim, SQLModel, table=True):
    __tablename__ = "files"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)

    user_id: str = Field(foreign_key="users.id")
    file_group_id: Optional[str] = Field(default=None, foreign_key="file_group.id")

    filename: str
    file_path: str
    file_type: str
    size: Optional[int] = None

    pages: int = 1
    status: str = "UPLOADED"