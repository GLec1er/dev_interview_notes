# Создайте middleware для автоматического извлечения токенов из куков
from fastapi import Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware

class CookieAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Проверяем куки на наличие токенов
        access_token = request.cookies.get("access_token")
        
        # Если токен в куках, добавляем его в заголовки
        if access_token and "authorization" not in request.headers:
            request.scope["headers"].append(
                (b"authorization", f"Bearer {access_token}".encode())
            )
        
        response = await call_next(request)
        return response
