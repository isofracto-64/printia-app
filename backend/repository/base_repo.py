from typing import Generic, TypeVar, Type
from sqlalchemy import update as sql_update, delete as sql_delete
from sqlalchemy.future import select
# Importamos la instancia db que creaste en tu config
from service.config import db 

T = TypeVar('T')

class BaseRepo(Generic[T]):
    model: Type[T] = None

    @classmethod
    async def create(cls, **kwargs):
        from service.config import db
        async with db.SessionLocal() as session:

            forbidden_keys = ['created_at', 'modified_at']
            clean_data = {
                k: v for k, v in kwargs.items() 
                if k not in forbidden_keys and not hasattr(v, '__clause_element__')
            }

            obj = cls.model(**clean_data)
            session.add(obj)
            await session.commit()
            await session.refresh(obj)
            return obj

    @classmethod
    async def get_all(cls):
        async with db.SessionLocal() as session:
            query = select(cls.model)
            result = await session.execute(query)
            return result.scalars().all()

    @classmethod
    async def get_by_id(cls, model_id: str):
        async with db.SessionLocal() as session:
            query = select(cls.model).where(cls.model.id == model_id)
            result = await session.execute(query)
            return result.scalar_one_or_none()

    @classmethod
    async def update(cls, model_id: str, **kwargs):
        async with db.SessionLocal() as session:
            query = (
                sql_update(cls.model)
                .where(cls.model.id == model_id)
                .values(**kwargs)
                .execution_options(synchronize_session="fetch")
            )
            await session.execute(query)
            await session.commit()

    @classmethod
    async def delete(cls, model_id: str):
        async with db.SessionLocal() as session:
            query = sql_delete(cls.model).where(cls.model.id == model_id)
            await session.execute(query)
            await session.commit()