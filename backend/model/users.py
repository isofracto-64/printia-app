
from typing import Optional,List
from sqlalchemy import Column, String, table
from sqlmodel import SQLModel, Field, Relationship
from model.mixins import TimeMixim
from model.user_role import UsersRole
from model.role import Role


class Users(TimeMixim, SQLModel,table=True):
    __tablename__ = "users"

    id: Optional[str] = Field(default=None, primary_key=True)
    username: str = Field(sa_column=Column("username",String, unique=True))
    email: str = Field(sa_column=Column("email",String, unique=True))
    password: str

    person_id: Optional[str] = Field(foreign_key="person.id")
    person: "Person" = Relationship(back_populates="users")

    roles: List[Role] = Relationship(
        back_populates="users",
        link_model=UsersRole
    )

    is_verified: bool = Field(default=False)

    student_info: Optional["StudentInfo"] = Relationship(back_populates="user")
    credit: Optional["UserCredit"] = Relationship(back_populates="user")