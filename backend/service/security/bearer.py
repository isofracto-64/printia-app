from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from service.security.jwt import JWTService


class JWTBearer(HTTPBearer):

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)

        if not credentials:
            raise HTTPException(status_code=403, detail="Invalid authorization")

        if credentials.scheme != "Bearer":
            raise HTTPException(status_code=403, detail="Invalid scheme")

        token = credentials.credentials

        try:
            payload = JWTService.decode_token(token)
        except:
            raise HTTPException(status_code=403, detail="Invalid token")

        return payload   