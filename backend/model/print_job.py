from sqlmodel import SQLModel, Field
from typing import Optional
from model.mixins import TimeMixim


class PrintJob(TimeMixim, SQLModel, table=True):
    __tablename__ = "print_job"

    id: str = Field(primary_key=True)

    file_group_id: str = Field(foreign_key="file_group.id")

    user_id: Optional[str] = Field(default=None, foreign_key="users.id")
    kiosk_id: Optional[str] = Field(default=None, foreign_key="users.id")

    status: str = "pending_config"


    settings: Optional[str] = None  

    estimated_cost: Optional[float] = 0
    final_cost: Optional[float] = 0