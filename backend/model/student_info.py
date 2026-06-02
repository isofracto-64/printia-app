from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from model.mixins import TimeMixim


class StudentInfo(TimeMixim, SQLModel, table=True):
    __tablename__ = "student_info"

    id: Optional[str] = Field(default=None, primary_key=True)

    user_id: str = Field(foreign_key="users.id", unique=True)
    university_id: str = Field(foreign_key="university.id")

    matricula: str = Field(index=True, unique=True)

    # relaciones
    user: "Users" = Relationship(back_populates="student_info")
    university: "University" = Relationship()
    