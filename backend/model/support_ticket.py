from typing import Optional
from sqlmodel import SQLModel, Field
from model.mixins import TimeMixim


class SupportTicket(TimeMixim, SQLModel, table=True):
    __tablename__ = "support_ticket"

    id: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    subject: str
    message: str
    status: str = "abierto"
    admin_note: Optional[str] = None
