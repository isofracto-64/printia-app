from sqlalchemy import update as sql_update
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from service.config import db
from sqlalchemy import select, delete
from model.users import Users
from repository.base_repo import BaseRepo
from sqlalchemy.orm import selectinload
from model import Role, UsersRole
from fastapi import HTTPException

class UsersRepository(BaseRepo):
    model = Users

    
    @staticmethod
    async def find_by_username(username: str):
        from service.config import db
        async with db.SessionLocal() as session:
            query = (
                select(Users)
                .where(Users.username == username)
                .options(selectinload(Users.roles))  
            )
            result = await session.execute(query)
            return result.scalar_one_or_none()

    @staticmethod
    async def find_by_email(email: str):
        from service.config import db
        async with db.SessionLocal() as session:
            query = select(Users).where(Users.email == email)
            result = await session.execute(query)
            return result.scalar_one_or_none()

    @staticmethod
    async def update_password(email: str, password: str): 
        from service.config import db
        async with db.SessionLocal() as session:
            query = (
                sql_update(Users)
                .where(Users.email == email)
                .values(password=password)
                .execution_options(synchronize_session="fetch")
            )
            await session.execute(query)
            await session.commit()

    @staticmethod
    async def find_by_id(user_id: str):
        from service.config import db

        async with db.SessionLocal() as session:
            query = (
                select(Users)
                .where(Users.id == user_id)
                .options(selectinload(Users.roles))
            )

            result = await session.execute(query)
            return result.scalar_one_or_none()

    @staticmethod
    async def update_user_role(session, user_id: str, role_name: str):

        role = await session.scalar(
            select(Role).where(Role.role_name == role_name.lower())
        )

        if not role:
            raise HTTPException(status_code=400, detail="Role not found")

        await session.execute(
            delete(UsersRole).where(UsersRole.users_id == user_id)
        )

        session.add(
            UsersRole(users_id=user_id, role_id=role.id)
        )

        await session.commit()

    @staticmethod
    async def get_with_roles(session: AsyncSession, user_id: str):
        query = (
            select(Users)
            .where(Users.id == user_id)
            .options(selectinload(Users.roles))
        )

        result = await session.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def delete_by_username(session: AsyncSession, username: str):

        query = (
            select(Users)
            .where(Users.username == username)
            .options(selectinload(Users.student_info))
        )
        result = await session.execute(query)
        user = result.scalar_one_or_none()

        if not user:
            return False

        try:

            from model import PrintJob, FileGroup, File, QRCode, CreditTransaction, UserCredit
            
            await session.execute(delete(PrintJob).where(PrintJob.user_id == user.id))

            file_groups_query = select(FileGroup.id).where(FileGroup.user_id == user.id)
            fg_result = await session.execute(file_groups_query)
            fg_ids = fg_result.scalars().all()

            if fg_ids:
                await session.execute(delete(QRCode).where(QRCode.file_group_id.in_(fg_ids)))
                await session.execute(delete(File).where(File.file_group_id.in_(fg_ids)))
                await session.execute(delete(FileGroup).where(FileGroup.user_id == user.id))

            await session.execute(delete(CreditTransaction).where(CreditTransaction.user_id == user.id))
            await session.execute(delete(UserCredit).where(UserCredit.user_id == user.id))

            from model import StudentInfo
            await session.execute(delete(StudentInfo).where(StudentInfo.user_id == user.id))


            from model import UsersRole
            await session.execute(delete(UsersRole).where(UsersRole.users_id == user.id))
            await session.execute(delete(Users).where(Users.id == user.id))

            if user.person_id:
                from model import Person
                await session.execute(delete(Person).where(Person.id == user.person_id))

            await session.commit()
            return True

        except Exception as e:
            await session.rollback()
            raise e


    @staticmethod
    async def search_user(
        session: AsyncSession,
        username: str = None,
        email: str = None
    ):
        query = (
            select(Users)
            .options(
                selectinload(Users.roles),
                selectinload(Users.person)
            )
        )

        if username:
            query = query.where(Users.username.ilike(f"%{username}%"))

        if email:
            query = query.where(Users.email.ilike(f"%{email}%"))

        result = await session.execute(query)
        users = result.scalars().all()

        return users
    
    @staticmethod
    async def update_profile_image(user_id: str, image_base64: str, session: AsyncSession):
        query = select(Users).where(Users.id == user_id).options(selectinload(Users.person))
        result = await session.execute(query)
        user = result.scalar_one_or_none()

        if not user or not user.person:
            raise HTTPException(status_code=404, detail="User or Person profile not found")

        user.person.profile = image_base64
        
        await session.commit()
        return image_base64