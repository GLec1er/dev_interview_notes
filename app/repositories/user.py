from typing import Optional
from datetime import datetime, timedelta, timezone
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update, func, or_
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from app.core.auth import SecurityUtils
from app.db.models.auth import User
from app.schemas.user import UserCreate, UserUpdate
from app.repositories.base import BaseRepository
from app.core.loggers import log
from app.core.configs.init import settings


class UserRepository(
    BaseRepository[
        User, # Модель пользователя
        UserCreate, # Схема создания пользователя
        UserUpdate, # Схема обновления пользователя
    ]
):
    """Репозиторий для работы с пользователями."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)
        self.security = SecurityUtils()
    
    async def create(
        self, 
        user_data: UserCreate,
    ) -> User:
        """Создать нового пользователя."""
        try:
            # Хешируем пароль перед сохранением
            hashed_password = self.security.get_password_hash(user_data.password)
            db_data = user_data.model_dump(exclude={"password"})
            db_data["password"] = hashed_password
            
            user_dict = {
                "first_name": db_data["first_name"],
                "last_name": db_data["last_name"],
                "email": db_data["email"],
                "password": db_data["password"],
            }
            
            return await super().create(UserCreate(**user_dict))
            
        except IntegrityError as e:
            log.error(f"❌ Ошибка уникальности при создании пользователя: {e}")
            await self.session.rollback()
            raise ValueError("Email уже существует")
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка БД при создании пользователя: {e}")
            await self.session.rollback()
            raise

    async def increment_failed_login_attempts(self, user_id: UUID) -> tuple[int, Optional[datetime]]:
        """
        Атомарно увеличивает failed_login_attempts и возвращает:
        - текущее значение попыток
        - locked_until (если превышен лимит → блокировка)
        """
        try:
            current_time = datetime.now(timezone.utc)
            
            # ПЕРВЫЙ UPDATE: увеличиваем счетчик
            stmt = (
                update(User)
                .where(User.id == user_id)
                .where(
                    or_(
                        User.locked_until.is_(None),
                        User.locked_until <= current_time
                    )
                )
                .values(
                    failed_login_attempts=User.failed_login_attempts + 1,
                    updated_at=func.now()
                )
                .returning(User.failed_login_attempts, User.locked_until)
            )
            result = await self.session.execute(stmt)
            await self.session.flush()  # ← Важно: сохраняем изменения
            await self.session.commit()
            
            row = result.fetchone()

            if not row:
                # Пользователь уже заблокирован
                user = await self.get(user_id)
                if user:
                    return user.failed_login_attempts, user.locked_until
                raise ValueError("User not found")

            attempts, locked_until = row

            # ВТОРОЙ UPDATE: блокируем если нужно
            if attempts >= settings.auth.max_failed_attempts:
                lock_time = datetime.now(timezone.utc) + timedelta(minutes=settings.auth.lock_duration_minutes)
                lock_stmt = (
                    update(User)
                    .where(User.id == user_id)
                    .where(User.failed_login_attempts >= settings.auth.max_failed_attempts)
                    .values(
                        locked_until=lock_time,
                        updated_at=func.now()
                    )
                    .returning(User.locked_until)
                )
                lock_result = await self.session.execute(lock_stmt)
                await self.session.flush()  # ← Важно: сохраняем изменения
                await self.session.commit()

                lock_row = lock_result.fetchone()
                if lock_row:
                    locked_until = lock_row[0]

            return attempts, locked_until

        except SQLAlchemyError as e:
            await self.session.rollback()
            log.error(f"❌ Ошибка при увеличении попыток входа: {e}")
            raise

    async def reset_failed_login_attempts(self, user_id: UUID) -> None:
        """Сбросить счётчик и снять блокировку (если есть)."""
        try:
            stmt = (
                update(User)
                .where(User.id == user_id)
                .values(
                    failed_login_attempts=0,
                    locked_until=None,
                    updated_at=func.now()
                )
            )
            await self.session.execute(stmt)
            await self.session.flush()
            await self.session.commit()
            log.debug(f"🔄 Счётчик попыток сброшен для пользователя: {user_id}")
        except SQLAlchemyError as e:
            await self.session.rollback()
            log.error(f"❌ Ошибка при сбросе попыток: {e}")
            raise

    async def unlock_user_if_expired(self, user_id: UUID) -> bool:
        """
        Разблокировать пользователя, если блокировка истекла.
        Возвращает True, если разблокировка произошла.
        """
        try:
            current_time = datetime.now(timezone.utc)
            stmt = (
                update(User)
                .where(User.id == user_id)
                .where(User.locked_until.isnot(None))
                .where(User.locked_until <= current_time)
                .values(
                    locked_until=None,
                    failed_login_attempts=0,
                    updated_at=func.now()
                )
            )
            result = await self.session.execute(stmt)
            rows_updated = result.rowcount
            if rows_updated:
                log.info(f"🔓 Автоматическая разблокировка: {user_id}")
            return rows_updated > 0
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при разблокировке: {e}")
            return False
    
    async def update_last_login(self, user_id: UUID) -> None:
        """Обновить время последнего входа."""
        try:
            stmt = (
                update(User)
                .where(User.id == user_id)
                .values(last_login=func.now())
            )
            await self.session.execute(stmt)
            await self.session.flush()
            await self.session.commit()
            log.debug(f"🔄 Время входа обновлено для пользователя: {user_id}")
            
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при обновлении времени входа: {e}")
            raise
