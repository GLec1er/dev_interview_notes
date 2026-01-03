from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, HTTPBearer
from fastapi import HTTPException, status

from app.core.configs.init import settings
from app.core.loggers import log

# Конфигурация
pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto",
)

# OAuth2 для паролей
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.app.api_prefix}/auth/login",
    auto_error=False,  # Не выбрасывать ошибку 401 автоматически
)

# Для API ключей (если нужно)
http_bearer = HTTPBearer(auto_error=False)


class SecurityUtils:
    """Утилиты для работы с безопасностью."""
    
    @staticmethod
    def verify_password(
        plain_password: str, 
        hashed_password: str
    ) -> bool:
        """Проверить пароль."""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Хешировать пароль."""
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(
        data: Dict[str, Any], 
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Создать access токен."""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.now() + expires_delta
        else:
            expire = datetime.now() + timedelta(
                minutes=settings.auth.access_token_expire_minutes,
            )
        
        to_encode.update({
            "exp": expire,
            "type": "access",
            "iat": datetime.now(),
        })
        
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.auth.secret_key.get_secret_value(),
            algorithm=settings.auth.algorithm,
        )
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(
        user_id: str, 
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Создать refresh токен."""
        if expires_delta:
            expire = datetime.now() + expires_delta
        else:
            expire = datetime.now() + timedelta(
                days=settings.auth.refresh_token_expire_days,
            )
        
        to_encode = {
            "sub": str(user_id),
            "exp": expire,
            "type": "refresh",
            "iat": datetime.now(),
        }
        
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.auth.refresh_secret_key.get_secret_value(), 
            algorithm=settings.auth.algorithm,
        )
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str, is_refresh: bool = False) -> Dict[str, Any]:
        """Верифицировать токен."""
        try:
            secret_key = (
                settings.auth.refresh_secret_key 
                if is_refresh 
                else settings.auth.secret_key
            )
            
            payload = jwt.decode(
                token, 
                secret_key, 
                algorithms=[settings.auth.algorithm,]
            )
            
            # Проверяем тип токена
            token_type = payload.get("type")
            if is_refresh and token_type != "refresh":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type",
                )
            elif not is_refresh and token_type != "access":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type",
                )
            
            return payload
            
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )



security = SecurityUtils()
