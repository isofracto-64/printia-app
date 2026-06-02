from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from model.mixins import TimeMixim


class University(TimeMixim, SQLModel, table=True):
    __tablename__ = "university"

    id: Optional[str] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    short_name: Optional[str] = None  
    is_active: bool = True

    # relación inversa
    students: List["StudentInfo"] = Relationship(back_populates="university")