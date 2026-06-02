import base64
import os
from datetime import datetime
from datetime import date
from uuid import uuid4
from fastapi import HTTPException
from uuid import uuid4

from sqlalchemy import select, insert, update
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from service.schema import RegisterSchema
from model import Person, Users, UsersRole, Role, StudentInfo, University
from repository.role import RoleRepository
from repository.users import UsersRepository
from repository.person import PersonRepository
from repository.user_role import UsersRoleRepository
from service.schema import LoginSchema, ForgotPasswordSchema
from repository.auth_repo import JWTRepo
from service.config import db
from model import UserCredit
from service.email_service import send_verification_email
from service.config import AUTO_VERIFY_EMAILS

from model import University


from service.security.jwt import JWTService

# Encrypt password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:

    @staticmethod
    async def register_service(register: RegisterSchema, session: AsyncSession):


        try:
            for field_name in ("username", "email", "name", "password", "phone_number", "birth"):
                if not str(getattr(register, field_name, "")).strip():
                    raise HTTPException(status_code=400, detail=f"{field_name} is required")

            if len(register.password) < 6:
                raise HTTPException(status_code=400, detail="Password must have at least 6 characters")

            # 🔹 Validar username
            register.username = register.username.strip()
            register.email = register.email.strip().lower()
            register.name = register.name.strip()
            register.phone_number = register.phone_number.strip()

            if await UsersRepository.find_by_username(register.username):
                raise HTTPException(status_code=400, detail="Username already exists!")

            # 🔹 Validar email
            if await UsersRepository.find_by_email(register.email):
                raise HTTPException(status_code=400, detail="Email already exists!")

            # 🔹 IDs
            person_id = str(uuid4())
            user_id = str(uuid4())

            # 🔹 Fecha
            try:
                birth_date = datetime.strptime(register.birth, '%d-%m-%Y').date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid birth date")

            # 🔹 Imagen default
            try:
                with open("./media/profile.png", "rb") as f:
                    image_str = base64.b64encode(f.read()).decode("utf-8")
                    image_str = f"data:image/png;base64,{image_str}"
            except FileNotFoundError:
                image_str = None

            # 🔹 Crear Person
            person = Person(
                id=person_id,
                name=register.name,
                birth=birth_date,
                sex=register.sex,
                profile=image_str,
                phone_number=register.phone_number
            )

            session.add(person)
            await session.flush()

            # 🔹 Crear User
            user = Users(
                id=user_id,
                username=register.username,
                email=register.email,
                password=pwd_context.hash(register.password),
                person_id=person_id,
                is_verified=AUTO_VERIFY_EMAILS,
            )

            session.add(user)
            await session.flush()

            credit = UserCredit(
                user_id=user_id,
                balance=0
            )

            session.add(credit)
            await session.flush()

            # 🔹 Rol default
            role = await session.scalar(
                select(Role).where(Role.role_name == "user")
            )

            if not role:
                raise HTTPException(status_code=500, detail="Default role not found")

            session.add(
                UsersRole(users_id=user_id, role_id=role.id)
            )

            # Estudiante
            if register.is_student:

                if not register.university_id or not register.matricula:
                    raise HTTPException(
                        status_code=400,
                        detail="University and matricula required"
                    )

                # 🔹 Validar universidad existe
                university = await session.scalar(
                    select(University).where(
                        (University.id == register.university_id) |
                        (University.short_name.ilike(register.university_id)) |
                        (University.name.ilike(f"%{register.university_id}%"))
                    )
                )

                if not university:
                    raise HTTPException(
                        status_code=404,
                        detail="University not found"
                    )

                matricula_clean = register.matricula.strip().lower()

                existing_matricula = await session.scalar(
                select(StudentInfo).where(StudentInfo.matricula == matricula_clean)
                )

                if existing_matricula:
                    raise HTTPException(
                        status_code=400,
                        detail="Matricula already registered"
                    )
                
                matricula=matricula_clean

                
                student = StudentInfo(
                    id=str(uuid4()),
                    user_id=user_id,
                    university_id=university.id,
                    matricula=matricula_clean
                )

                session.add(student)


            if not AUTO_VERIFY_EMAILS:
                token = AuthService.create_email_verification_token(user.email)
                await send_verification_email(user.email, token)
            await session.commit()

            return {"message": "User registered successfully"}

        except Exception as e:
            await session.rollback()
            raise e
    
    @staticmethod
    async def logins_service(login: LoginSchema, session: AsyncSession):

        _user = await session.scalar(
            select(Users)
            .where(Users.username == login.username)
            .options(
                selectinload(Users.roles),
                selectinload(Users.student_info)
            )
        )

        if _user is None:
            raise HTTPException(status_code=404, detail="Username not found!")

        if not pwd_context.verify(login.password, _user.password):
            raise HTTPException(status_code=400, detail="Invalid password!")
        
        if not _user.is_verified:
            raise HTTPException(
            status_code=403,
            detail="Please verify your email before login"
            )

        if not _user.roles:
            raise HTTPException(status_code=400, detail="User has no role assigned")
        


        if _user.student_info:
            duplicate = await session.scalar(
                select(StudentInfo)
                .where(StudentInfo.matricula == _user.student_info.matricula)
            )

            if duplicate and duplicate.user_id != _user.id:
                raise HTTPException(
                    status_code=403,
                    detail="Matricula already in use"
                )

        roles = [role.role_name for role in _user.roles]
        main_role = roles[0]

        token_data = {
            "sub": _user.id,
            "username": _user.username,
            "role": main_role,
            "type": "remote",   
            "kiosk_id": None
        }

        token = JWTRepo(data=token_data).generate_token()

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": _user.id,
                "username": _user.username,
                "role": main_role
            }
        }

    @staticmethod
    async def kiosk_login_service(
        login: LoginSchema,
        kiosk_user,
        session: AsyncSession
    ):
    # 🔹 buscar usuario
        _user = await session.scalar(
            select(Users)
            .where(Users.username == login.username)
            .options(selectinload(Users.roles))
        )

        if not _user:
            raise HTTPException(status_code=404, detail="User not found")

        if not pwd_context.verify(login.password, _user.password):
            raise HTTPException(status_code=400, detail="Invalid password")

        if not _user.is_verified:
            raise HTTPException(status_code=403, detail="Email not verified")

    # 🔹 roles
        roles = [role.role_name for role in _user.roles]
        main_role = roles[0]

    # 🔥 TOKEN ESPECIAL
        token_data = {
            "sub": _user.id,
            "username": _user.username,
            "role": main_role,
            "type": "kiosk",              # 🔥 clave
            "kiosk_id": kiosk_user.id     # 🔥 clave
        }

        token = JWTRepo(data=token_data).generate_token()

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": _user.id,
                "username": _user.username,
                "role": main_role
            },
            "kiosk": {
                "id": kiosk_user.id,
                "username": kiosk_user.username
            }
        }


    @staticmethod
    async def forgot_password_service(
        forgot_password: ForgotPasswordSchema,
        session: AsyncSession
    ):
        try:
            user = await session.scalar(
                select(Users).where(Users.email == forgot_password.email)
            )

            if not user:
                raise HTTPException(status_code=404, detail="Email not found!")

        # 🔹 Confirmar contraseña
            if forgot_password.new_password != forgot_password.confirm_password:
                raise HTTPException(
                    status_code=400,
                    detail="Passwords do not match"
                )

        # 🔹 Evitar reutilizar contraseña
            if pwd_context.verify(forgot_password.new_password, user.password):
                raise HTTPException(
                    status_code=400,
                    detail="New password cannot be the same as the old one"
                )

        # 🔹 Actualizar contraseña
            user.password = pwd_context.hash(forgot_password.new_password)

            await session.commit()

            return {"message": "Password updated successfully"}

        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=500, detail=str(e))
        
    @staticmethod
    def create_email_verification_token(email: str):
        data = {
            "sub": email,
            "type": "email_verification"
        }
        return JWTRepo(data=data).generate_token()

    @staticmethod
    def verify_email_token(token: str):
        payload = JWTRepo(token=token).decode_token()

        if payload.get("type") != "email_verification":
            raise HTTPException(status_code=400, detail="Invalid token type")

        return payload.get("sub")




# Generate roles manually
async def generate_role():
    async with db.SessionLocal() as session:
        from sqlalchemy import insert
        
        _exists = await RoleRepository.find_by_list_role_name(session, ["admin", "user", "kiosk"])
        
        if not _exists:
            print("Insertando roles con SQL puro ")
            try:
                await session.execute(
                    insert(Role).values([
                        {"id": str(uuid4()), "role_name": "admin", "created_at": datetime.now(), "modified_at": datetime.now()},
                        {"id": str(uuid4()), "role_name": "user", "created_at": datetime.now(), "modified_at": datetime.now()},
                        {"id": str(uuid4()), "role_name": "kiosk", "created_at": datetime.now(), "modified_at": datetime.now()}
                    ])
                )
                await session.commit()
            except Exception as e:
                print(f"Error fatal: {e}")
                await session.rollback()

async def generate_universities():
    async with db.SessionLocal() as session:
        existing = await session.scalar(select(University).limit(1))

        if existing:
            return

        universities = [
            University(id=str(uuid4()), name="Universidad Tecnológica", short_name="UT"),
            University(id=str(uuid4()), name="UNAM", short_name="UNAM"),
        ]

        session.add_all(universities)
        await session.commit()



async def generate_kiosks():
    async with db.SessionLocal() as session:

        from sqlalchemy import select
        from uuid import uuid4
        from datetime import datetime
        from passlib.context import CryptContext

        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

        # 🔹 Verificar si ya existe
        existing = await session.scalar(
            select(Users).where(Users.username == "IMbis_printia")
        )

        if existing:
            return

        try:
            role = await session.scalar(
                select(Role).where(Role.role_name == "kiosk")
            )

            if not role:
                raise Exception("Role kiosk not found")

            kiosk_user = Users(
                id=str(uuid4()),
                username="IMbis_printia",
                email=os.getenv("KIOSK_DEFAULT_EMAIL", "kiosk@example.com"),
                password=pwd_context.hash(os.getenv("KIOSK_DEFAULT_PASSWORD", "change-this-kiosk-password")),
                is_verified=True,
                created_at=datetime.now(),
                modified_at=datetime.now()
            )

            session.add(kiosk_user)
            await session.flush()

            # Asignar rol inmediatamente
            session.add(
                UsersRole(
                    users_id=kiosk_user.id,
                    role_id=role.id,
                    created_at=datetime.now(),
                    modified_at=datetime.now()
                )
            )

            await session.commit()

            print("printia creado con rol asignado")

        except Exception as e:
            await session.rollback()
            print(f"Error creando a printia: {e}")


async def generate_admin_user():
    username = os.getenv("ADMIN_DEFAULT_USERNAME", "").strip()
    email = os.getenv("ADMIN_DEFAULT_EMAIL", "").strip().lower()
    password = os.getenv("ADMIN_DEFAULT_PASSWORD", "")

    if not username or not email or not password:
        return

    async with db.SessionLocal() as session:
        existing = await session.scalar(
            select(Users).where((Users.username == username) | (Users.email == email))
        )

        if existing:
            return

        role = await session.scalar(
            select(Role).where(Role.role_name == "admin")
        )

        if not role:
            print("Role admin not found")
            return

        person_id = str(uuid4())
        user_id = str(uuid4())

        person = Person(
            id=person_id,
            name=os.getenv("ADMIN_DEFAULT_NAME", "Administrador Printia"),
            birth=date(2000, 1, 1),
            sex="MALE",
            profile="",
            phone_number=os.getenv("ADMIN_DEFAULT_PHONE", "0000000000"),
        )

        user = Users(
            id=user_id,
            username=username,
            email=email,
            password=pwd_context.hash(password),
            person_id=person_id,
            is_verified=True,
            created_at=datetime.now(),
            modified_at=datetime.now(),
        )

        session.add(person)
        await session.flush()
        session.add(user)
        await session.flush()
        session.add(
            UsersRole(
                users_id=user_id,
                role_id=role.id,
                created_at=datetime.now(),
                modified_at=datetime.now(),
            )
        )
        session.add(UserCredit(user_id=user_id, balance=0))
        await session.commit()
        print("Admin user created")


async def auto_verify_users_for_testing():
    if not AUTO_VERIFY_EMAILS:
        return

    async with db.SessionLocal() as session:
        await session.execute(
            update(Users)
            .where(Users.is_verified == False)
            .values(is_verified=True)
        )
        await session.commit()
