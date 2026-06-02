
from typing import Optional,List
from sqlalchemy import Column, String, table
from sqlmodel import SQLModel, Field, Relationship
from model.mixins import TimeMixim



class UsersRole(TimeMixim,SQLModel,table=True):
    __tablename__ = "user_role"

    users_id: str = Field( foreign_key="users.id", primary_key=True)
    role_id: str = Field( foreign_key="role.id", primary_key=True)


