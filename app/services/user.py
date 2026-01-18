import asyncio
from datetime import datetime, timezone
from typing import Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import SecurityUtils
from app.schemas.user import UserCreate, UserLogin
from app.repositories.user import UserRepository
from app.services.email import EmailService
from app.core.loggers import log


class AuthService:
    """Сервис аутентификации."""
    
    def __init__(
        self, 
        user_repository: UserRepository,
        security: SecurityUtils,
        email_service: EmailService = None,
    ):
        self.user_repository = user_repository
        self.security = security
        self.email_service = email_service or EmailService()
    
    @classmethod
    def from_session(cls, session: AsyncSession) -> "AuthService":
        """Создать сервис из сессии."""
        user_repository = UserRepository(session)
        security = SecurityUtils()
        email_service = EmailService()
        return cls(user_repository, security, email_service)
    
    async def register(
        self, 
        user_data: UserCreate,
    ) -> Dict[str, Any]:
        """Регистрация нового пользователя."""
        try:
            user = await self.user_repository.create(user_data=user_data)
            log.info(f"✅ Пользователь зарегистрирован: {user.email}")
            return user
            
        except ValueError as e:
            log.warning(f"⚠️ Ошибка валидации: {e}")
            raise
        except Exception as e:
            log.error(f"❌ Неожиданная ошибка: {e}")
            raise ValueError("Внутренняя ошибка сервера")
    

    async def login(
        self, 
        login_data: UserLogin,
    ) -> Dict[str, Any]:
        """Аутентификация пользователя"""
        
        current_time = datetime.now(timezone.utc)

        try:
            await asyncio.sleep(0.1)

            # 1. Получаем пользователя
            user = await self.user_repository.get_by(
                email=login_data.email.lower().strip(),
                is_active=True,
            )
            if not user:
                log.warning(f"⚠️ Попытка входа с несуществующим email: {login_data.email[:10]}...")
                raise ValueError("Invalid credentials")

            # 2. Проверяем/разблокируем при необходимости
            await self.user_repository.unlock_user_if_expired(user.id)
            
            # 3. Перечитываем пользователя после возможной разблокировки
            user = await self.user_repository.get(user.id)
            if not user:
                raise ValueError("User not found")

            # 4. Проверяем, не заблокирован ли он сейчас
            if user.locked_until and user.locked_until > current_time:
                lock_time_min = (user.locked_until - current_time).total_seconds() // 60
                log.warning(f"🚫 Заблокированный аккаунт: {user.email}, осталось: {int(lock_time_min)} мин")
                raise ValueError(f"Account is temporarily locked. Try again in {int(lock_time_min)} minutes")

            # 5. Проверяем пароль
            password_valid = False
            try:
                password_valid = self.security.verify_password(login_data.password, user.password)
            except Exception as e:
                log.error(f"❌ Ошибка проверки пароля: {e}")

            if not password_valid:
                # 6. 💥 Атомарно обрабатываем неудачную попытку
                attempts, locked_until = await self.user_repository.increment_failed_login_attempts(user.id)
                
                # После увеличения счетчика проверяем, не заблокировался ли пользователь
                if locked_until and locked_until > current_time:
                    lock_time_min = (locked_until - current_time).total_seconds() // 60
                    log.warning(f"🚫 Аккаунт заблокирован после {attempts} попыток: {user.email}")
                    raise ValueError(f"Too many failed attempts. Account locked for {int(lock_time_min)} minutes")
                
                log.warning(f"⚠️ Неверный пароль: {user.email}, попытка #{attempts}")
                raise ValueError("Invalid credentials")

            # 7. ✅ Успешный вход — сбрасываем счётчик
            await self.user_repository.reset_failed_login_attempts(user.id)

            # 8. Обновляем last_login
            await self.user_repository.update_last_login(user.id)

            log.info(f"✅ Успешный вход: {user.email}")
            return {
                "user": user,
                "tokens": self.security.create_tokens(user.id),
            }
            
        except ValueError as e:
            log.warning(f"⚠️ Ошибка входа: {str(e)[:50]}")
            raise
        except Exception as e:
            log.error(f"❌ Неожиданная ошибка при входе: {e}")
            raise ValueError("Login failed")
    
    
    async def forgot_password(
        self,
        email: str,
    ) -> Dict[str, Any]:
        """
        Восстановление пароля по email.
        
        1. Проверяет, существует ли пользователь с таким email
        2. Генерирует новый пароль
        3. Обновляет пароль в БД
        4. Отправляет новый пароль на email
        """
        try:
            email = email.lower().strip()
            
            # 1. Проверяем существование пользователя
            user = await self.user_repository.get_by(email=email)
            if not user:
                log.warning(f"⚠️ Попытка восстановления пароля для несуществующего email: {email[:10]}...")
                # Не раскрываем, существует ли пользователь
                raise ValueError("If email exists, you will receive a message")
            
            # 2. Генерируем новый пароль
            new_password = EmailService.generate_password()
            
            # 3. Хешируем и обновляем в БД
            hashed_password = self.security.get_password_hash(new_password)
            await self.user_repository.update_password(user.id, hashed_password)
            
            # 4. Отправляем email
            email_sent = await self.email_service.send_password_reset_email(
                to_email=user.email,
                first_name=user.first_name,
                new_password=new_password,
            )
            
            if not email_sent:
                log.warning(f"⚠️ Не удалось отправить email восстановления на {email}")
                raise ValueError("Failed to send recovery email")
            
            log.info(f"✅ Пароль восстановлен для: {email}")
            
            return {
                "message": "Новый пароль отправлен вам на email",
                "email": email,
                "password": new_password,  # В реальном приложении не возвращаем пароль в ответе
            }
            
        except ValueError as e:
            log.warning(f"⚠️ Ошибка восстановления пароля: {str(e)[:50]}")
            raise
        except Exception as e:
            log.error(f"❌ Неожиданная ошибка при восстановлении пароля: {e}")
            raise ValueError("Password recovery failed")
