from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from service.config import db
from repository.users import UsersRepository
from service.security.bearer import JWTBearer


def require_role(*allowed_roles):

    allowed_roles_set = {r.lower() for r in allowed_roles}

    async def checker(
        payload=Depends(JWTBearer()),
        session=Depends(db.get_session),
    ):
        user = await UsersRepository.get_with_roles(
            session,
            payload["sub"]
        )

        if not user:
            raise HTTPException(404, "User not found")

        roles = {r.role_name.lower() for r in user.roles}

        if not roles.intersection(allowed_roles_set):
            raise HTTPException(403, "Forbidden")


        return {
            "user": user,
            "payload": payload
        }

    return checker



def get_current_kiosk():

    async def checker(
        payload=Depends(JWTBearer()),
        session=Depends(db.get_session),
    ):

        if payload.get("role") != "kiosk":
            raise HTTPException(403, "Not a kiosk")


        kiosk = await UsersRepository.get_with_roles(
            session,
            payload["sub"]
        )

        if not kiosk:
            raise HTTPException(404, "Kiosk not found")

        return kiosk

    return checker

def get_current_user():

    async def checker(
        payload=Depends(JWTBearer()),
        session=Depends(db.get_session),
    ):

        if payload.get("type") == "kiosk":
            raise HTTPException(403, "Use kiosk endpoint")

        user = await UsersRepository.get_with_roles(
            session,
            payload["sub"]
        )

        if not user:
            raise HTTPException(404, "User not found")

        return user

    return checker

def get_kiosk_user():

    async def checker(
        payload=Depends(JWTBearer()),
        session=Depends(db.get_session),
    ):

        user = await UsersRepository.get_with_roles(
            session,
            payload["sub"]
        )

        if not user:
            raise HTTPException(404, "User not found")

        roles = {role.role_name.lower() for role in user.roles}
        kiosk_id = payload.get("kiosk_id")

        if payload.get("type") != "kiosk":
            if "kiosk" not in roles:
                raise HTTPException(403, "Must login from kiosk")
            kiosk_id = user.id

        if not kiosk_id:
            raise HTTPException(403, "Missing kiosk_id")

        return {"user": user, "kiosk_id": kiosk_id}

    return checker

    
