from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional
from model.mixins import TimeMixim

class UserCredit(TimeMixim, SQLModel, table=True):
    __tablename__ = "user_credit"

    user_id: str = Field(foreign_key="users.id", primary_key=True)
    balance: float = 0

    user: "Users" = Relationship(back_populates="credit")