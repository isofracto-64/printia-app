from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
from model.mixins import TimeMixim


class CreditTransaction(TimeMixim, SQLModel, table=True):
    __tablename__ = "credit_transaction"

    id: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="users.id")

    amount: float
    type: str  
    description: str