from typing import List
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from model.role import Role
from repository.base_repo import BaseRepo

class RoleRepository(BaseRepo):
    model = Role

    @classmethod
    async def find_by_role_name(cls, role_name: str): 
        from service.config import db
        async with db.SessionLocal() as session: 
            query = select(Role).where(Role.role_name == role_name)
            result = await session.execute(query)
            return result.scalar_one_or_none()
    
    @staticmethod
    async def find_by_list_role_name(session: AsyncSession, role_names: List[str]):

        query = select(Role).where(Role.role_name.in_(role_names))
        result = await session.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def create_list(session: AsyncSession, roles: List[Role]):
        session.add_all(roles)
        await session.commit()