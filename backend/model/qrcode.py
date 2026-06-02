from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from model.mixins import TimeMixim

class QRCode(TimeMixim, SQLModel, table=True):
    __tablename__ = "qr_code"

    id: str = Field(primary_key=True)


    file_group_id: str = Field(foreign_key="file_group.id")

    user_id: str = Field(foreign_key="users.id", index=True) 

    token: str = Field(index=True, unique=True)

    expires_at: Optional[datetime] = None