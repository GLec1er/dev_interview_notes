import asyncio
import re
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from uuid import UUID

from psycopg2 import IntegrityError
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import SecurityUtils
from app.db.models.auth import User
from app.schemas.user import UserCreate, LoginRequest, Token
from app.repositories.user import UserRepository
from app.core.loggers import log
from app.core.configs.init import settings


class AuthService:
    """Сервис аутентификации."""
    
    def __init__(
        self, 
        user_repository: UserRepository,
        security: SecurityUtils,
    ):
        self.user_repository = user_repository
        self.security = security
    
    @classmethod
    def from_session(cls, session: AsyncSession) -> "AuthService":
        """Создать сервис из сессии."""
        user_repository = UserRepository(session)
        security = SecurityUtils()
        return cls(user_repository, security)
    
    async def register(
        self, 
        user_data: UserCreate,
    ) -> Dict[str, Any]:
        """Регистрация нового пользователя."""
        try:
            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_regex, user_data.email):
                raise ValueError("Некорректный формат email")
            
            # Проверяем уникальность
            existing_email = await self.user_repository.get_by(email=user_data.email)
            if existing_email:
                raise ValueError("Не удалось завершить регистрацию")
            
            # Создаем пользователя
            user = await self.user_repository.create(
                user_data=user_data
            )
            
            log.info(f"✅ Пользователь зарегистрирован: {user.email}")
            return {
                "user": user,
                "tokens": await self._create_tokens(user.id),
            }
            
        except ValueError as e:
            log.warning(f"⚠️ Ошибка валидации: {e}")
            raise
        except IntegrityError as e:
            log.error(f"❌ Ошибка целостности БД: {e}")
            raise ValueError("Ошибка при создании пользователя")
        except Exception as e:
            log.error(f"❌ Неожиданная ошибка: {e}")
            raise ValueError("Внутренняя ошибка сервера")
    
    async def login(
        self, 
        login_data: LoginRequest,
    ) -> Dict[str, Any]:
        """Аутентификация пользователя с защитой от brute-force."""
        try:
            # Добавляем небольшую задержку для защиты от timing attacks
            await asyncio.sleep(0.1)
        
            # Ищем пользователя по email
            user = await self.user_repository.get_by(email=login_data.email.lower().strip())

            # Если пользователь не найден, логируем и возвращаем общую ошибку
            if not user:
                log.warning(f"⚠️ Попытка входа с несуществующим идентификатором: {login_data.email[:10]}...")
                # Всегда одна и та же ошибка для безопасности
                raise ValueError("Invalid credentials")
            
            # Проверяем блокировку аккаунта
            if hasattr(user, 'locked_until') and user.locked_until:
                if user.locked_until > datetime.now():
                    lock_time = (user.locked_until - datetime.now()).seconds // 60
                    log.warning(f"🚫 Заблокированный аккаунт пытается войти: {user.email}, осталось: {lock_time} мин")
                    raise ValueError(f"Account is temporarily locked. Try again in {lock_time} minutes")
                else:
                    # Разблокируем аккаунт если время блокировки прошло
                    await self._unlock_account(user)
            
            # Проверяем пароль
            password_valid = False
            try:
                password_valid = self.security.verify_password(login_data.password, user.password)
            except Exception as e:
                log.error(f"❌ Ошибка проверки пароля: {e}")
                password_valid = False
            
            if not password_valid:
                # Увеличиваем счетчик неудачных попыток
                await self._handle_failed_login(user)
                
                # Проверяем, не превышен ли лимит попыток
                failed_attempts = getattr(user, 'failed_login_attempts', 0)
                max_attempts = 5
                
                if failed_attempts >= max_attempts:
                    # Блокируем аккаунт на 30 минут
                    await self._lock_account(user, minutes=30)
                    log.warning(f"🚫 Аккаунт заблокирован после {failed_attempts} неудачных попыток: {user.email}")
                    raise ValueError("Too many failed attempts. Account locked for 30 minutes")
                
                log.warning(f"⚠️ Неверный пароль для пользователя: {user.email}, попытка: {failed_attempts}")
                raise ValueError("Invalid credentials")
            
            # Сбрасываем счетчик неудачных попыток при успешном входе
            await self._reset_failed_attempts(user)
            
            # Проверяем активность пользователя
            if not user.is_active:
                log.warning(f"⚠️ Попытка входа в неактивный аккаунт: {user.email}")
                raise ValueError("Account is inactive")
            
            # Обновляем last_login и IP
            await self._update_login_stats(user)
            
            # Создаем токены
            tokens = await self._create_tokens(user.id)
            
            # Логируем успешный вход
            log.info(f"✅ Успешный вход: {user.email}")
            
            return {
                "user": user,
                "tokens": tokens,
            }
            
        except ValueError as e:
            # Логируем ошибку валидации
            log.warning(f"⚠️ Ошибка входа: {str(e)[:50]}")
            raise
        except Exception as e:
            log.error(f"❌ Неожиданная ошибка при входе: {e}")
            raise ValueError("Login failed")
    
    async def _handle_failed_login(
        self, 
        user: User,
    ):
        """Обработка неудачной попытки входа."""
        try:
            # Увеличиваем счетчик неудачных попыток
            current_attempts = getattr(user, 'failed_login_attempts', 0) + 1
            
            # Обновляем в базе данных
            stmt = (
                update(User)
                .where(User.id == user.id)
                .values(
                    failed_login_attempts=current_attempts,
                    updated_at=datetime.now()
                )
            )
            await self.user_repository.session.execute(stmt)
            await self.user_repository.session.flush()
            
            # Логируем неудачную попытку
            log.warning(f"⚠️ Неудачная попытка входа: {user.email}, попытка #{current_attempts}")
            
        except Exception as e:
            log.error(f"❌ Ошибка при обработке неудачного входа: {e}")
    
    async def _reset_failed_attempts(
        self, 
        user: User,
    ):
        """Сброс счетчика неудачных попыток."""
        try:
            if getattr(user, 'failed_login_attempts', 0) > 0:
                stmt = (
                    update(User)
                    .where(User.id == user.id)
                    .values(
                        failed_login_attempts=0,
                        locked_until=None,
                        updated_at=datetime.now()
                    )
                )
                await self.user_repository.session.execute(stmt)
                await self.user_repository.session.flush()
        except Exception as e:
            log.error(f"❌ Ошибка при сбросе счетчика попыток: {e}")
    
    async def _lock_account(
        self, 
        user: User, 
        minutes: int = 30,
    ):
        """Блокировка аккаунта на указанное время."""
        try:
            locked_until = datetime.now() + timedelta(minutes=minutes)
            stmt = (
                update(User)
                .where(User.id == user.id)
                .values(
                    locked_until=locked_until,
                    updated_at=datetime.now()
                )
            )
            await self.user_repository.session.execute(stmt)
            await self.user_repository.session.flush()
        except Exception as e:
            log.error(f"❌ Ошибка при блокировке аккаунта: {e}")
    
    async def _unlock_account(
        self, 
        user: User,
    ):
        """Разблокировка аккаунта."""
        try:
            stmt = (
                update(User)
                .where(User.id == user.id)
                .values(
                    locked_until=None,
                    failed_login_attempts=0,
                    updated_at=datetime.now()
                )
            )
            await self.user_repository.session.execute(stmt)
            await self.user_repository.session.flush()
        except Exception as e:
            log.error(f"❌ Ошибка при разблокировке аккаунта: {e}")
    
    async def _update_login_stats(
        self, 
        user: User, 
    ):
        """Обновление статистики входа."""
        try:
            update_data = {
                "last_login": datetime.now(),
                "updated_at": datetime.now()
            }
            
            stmt = (
                update(User)
                .where(User.id == user.id)
                .values(**update_data)
            )
            await self.user_repository.session.execute(stmt)
            await self.user_repository.session.flush()
            
        except Exception as e:
            log.error(f"❌ Ошибка при обновлении статистики входа: {e}")

    ######################################################
    async def refresh_tokens(
        self, 
        refresh_token: str,
    ) -> Token:
        """Обновить access токен."""
        try:
            # Верифицируем refresh токен
            payload = self.security.verify_token(refresh_token, is_refresh=True)
            user_id = payload.get("sub")
            
            if not user_id:
                raise ValueError("Invalid token")
            
            # Проверяем существование пользователя
            user = await self.user_repository.get(user_id)
            if not user or not user.is_active:
                raise ValueError("User not found or inactive")
            
            # Создаем новые токены
            tokens = await self._create_tokens(user.id)
            
            return tokens
            
        except Exception as e:
            log.error(f"❌ Ошибка обновления токенов: {e}")
            raise
    
    async def _create_tokens(self, user_id: UUID) -> Token:
        """Создать пару токенов."""
        access_token = self.security.create_access_token(
            data={"sub": str(user_id)},
        )
        refresh_token = self.security.create_refresh_token(
            str(user_id),
        )
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in= settings.auth.access_token_expire_minutes * 60,
        )
    
    async def logout(self, token: str) -> None:
        """Выход (добавить токен в черный список)."""
        # Здесь можно добавить токен в Redis blacklist
        # для реализации моментального logout
        pass