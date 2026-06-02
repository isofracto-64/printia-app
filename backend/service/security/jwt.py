from datetime import datetime, timedelta
from jose import jwt
from service.config import SECRET_KEY, ALGORITHM


class JWTService:

    @staticmethod
    def create_token(data: dict, expires_minutes: int = 30):
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=expires_minutes)

        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def decode_token(token: str):
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])