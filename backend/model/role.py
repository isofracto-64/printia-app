from typing import Optional,List
from sqlalchemy import Column, String, table
from sqlmodel import SQLModel, Field, Relationship
from model.mixins import TimeMixim
from model.user_role import UsersRole

class Role(TimeMixim,SQLModel,table=True):
    __tablename__ = "role"

    id: Optional[str] = Field(default=None, primary_key=True)
    role_name: str

    users: List["Users"]= Relationship(back_populates="roles", link_model=UsersRole)