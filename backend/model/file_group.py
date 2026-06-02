from sqlmodel import SQLModel, Field
from datetime import datetime, timedelta
from typing import Optional
from model.mixins import TimeMixim


class FileGroup(TimeMixim, SQLModel, table=True):
    __tablename__ = "file_group"

    id: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="users.id")

    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None