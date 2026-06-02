from sqlalchemy import select, delete, or_
from sqlalchemy.orm import selectinload
from model import Users, Person, Role, UsersRole, StudentInfo
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from repository.users import UsersRepository
from uuid import UUID
from model import UserCredit

class UserService:

    @staticmethod
    async def get_user_profile(username: str, session: AsyncSession):
        query = (
            select(
                Users.username,
                Users.email,
                Person.name,
                Person.birth,
                Person.sex,
                Person.profile,
                Person.phone_number,
                Role.role_name.label("role"),
                StudentInfo.university_id,
                StudentInfo.matricula,
                UserCredit.balance
            )
            .join(Person, Users.person_id == Person.id)
            .join(UsersRole, Users.id == UsersRole.users_id)
            .join(Role, UsersRole.role_id == Role.id)
            .outerjoin(StudentInfo, Users.id == StudentInfo.user_id)
            .outerjoin(UserCredit, Users.id == UserCredit.user_id)
            .where(Users.username == username)
        )

        result = await session.execute(query)

        user = result.mappings().first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return dict(user)



    @staticmethod
    async def delete_user_by_username(username: str, session: AsyncSession):
        deleted = await UsersRepository.delete_by_username(session, username)

        if not deleted:
            raise HTTPException(status_code=404, detail="User not found")

        return {"message": f"User '{username}' deleted successfully"}
    

    @staticmethod
    async def search_user(
        session: AsyncSession,
        search: str = None
    ):
        query = (
            select(Users)
            .join(Person, Users.person_id == Person.id)
            .options(
                selectinload(Users.roles),
                selectinload(Users.person),
                selectinload(Users.student_info).selectinload(StudentInfo.university)
            )
        )

        if search:
            query = query.where(
                or_(
                    Users.username.ilike(f"%{search}%"),
                    Users.email.ilike(f"%{search}%"),
                    Person.name.ilike(f"%{search}%")
                )
            )

        query = query.limit(20) 

        result_db = await session.execute(query)
        users = result_db.scalars().all()


        result = []

        for user in users:
            result.append({
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
                "name": user.person.name if user.person else None,
                "phone": user.person.phone_number if user.person else None,
                "roles": [role.role_name for role in user.roles],
                "student": {
                    "matricula": user.student_info.matricula,
                    "university": user.student_info.university.name
                } if user.student_info else None
            })

        return result

    @staticmethod
    async def update_profile_image(user_id: str, image_base64: str, session: AsyncSession):
        from model import Users
        from sqlalchemy.orm import selectinload


        query = (
            select(Users)
            .where(Users.id == user_id)
            .options(selectinload(Users.person))
        )
        result = await session.execute(query)
        user = result.scalar_one_or_none()

        if not user or not user.person:
            raise HTTPException(status_code=404, detail="Usuario o perfil no encontrado")


        user.person.profile = image_base64
        
        await session.commit()
        return image_base64
