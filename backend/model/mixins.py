from datetime import datetime
#from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime
from sqlmodel import Field,SQLModel
from sqlalchemy import func

class TimeMixim:
    """Mxin to for datetime value of when the entity was created and when it was last modified"""

    created_at: datetime = Field(default_factory=datetime.utcnow)

    modified_at: datetime = Field(default_factory=datetime.utcnow)