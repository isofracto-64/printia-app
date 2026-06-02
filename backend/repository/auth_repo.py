from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError, ExpiredSignatureError

from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


from service.config import SECRET_KEY, ALGORITHM

class JWTRepo:

    def __init__(self, data: dict = {}, token: str = None):
        self.data = data
        self.token = token

    # 🔐 GENERAR TOKEN
    def generate_token(self, expires_delta: Optional[timedelta] = None):
        to_encode = self.data.copy()

        expire = datetime.utcnow() + (
            expires_delta if expires_delta else timedelta(minutes=30)
        )

        to_encode.update({"exp": expire})

        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    # 🔓 DECODIFICAR TOKEN (SEGURO)
    def decode_token(self):
        try:
            payload = jwt.decode(
                self.token,
                SECRET_KEY,
                algorithms=[ALGORITHM]
            )
            return payload

        except ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")

        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

    # 🔧 UTILIDAD ESTÁTICA
    @staticmethod
    def extract_token(token: str):
        try:
            return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        except ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")

        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

class JWTBearer(HTTPBearer):

    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)

        if credentials.scheme != "Bearer":
            raise HTTPException(status_code=403, detail="Invalid authentication schema")

    # 🔥 Validar token directamente
        try:
            jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        except ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

        return credentials.credentials

    @staticmethod
    def verify_jwt(jwt_token: str):
        return True if jwt.decode(jwt_token, SECRET_KEY, algorithms=[ALGORITHM]) is not None else False