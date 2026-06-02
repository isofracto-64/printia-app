
from datetime import date
from typing import Optional
from sqlalchemy import table
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from model.mixins import TimeMixim


class Sex(str,Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"

class Person(SQLModel,TimeMixim,table=True):
    __tablename__ = "person"

    id: str = Field(None, primary_key=True, nullable=False)
    name:str
    birth: date
    sex: Sex
    profile: str
    phone_number: str

    users: "Users"= Relationship(sa_relationship_kwargs={"uselist":False}, back_populates="person")