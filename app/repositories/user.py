from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from app.core.auth import SecurityUtils
from app.db.models.auth import User
from app.schemas.user import UserCreate, UserUpdate
from app.repositories.base import BaseRepository
from app.core.loggers import log


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
            
            user = User(**user_dict)
            self.session.add(user)
            await self.session.commit()
            await self.session.refresh(user)
            
            log.info(f"✅ Пользователь создан: {user.email}")
            return user
            
        except IntegrityError as e:
            log.error(f"❌ Ошибка уникальности при создании пользователя: {e}")
            await self.session.rollback()
            raise ValueError("Email уже существует")
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка БД при создании пользователя: {e}")
            await self.session.rollback()
            raise
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """Получить пользователя по email."""
        try:
            return await self.get_by(email=email)
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при получении пользователя по email: {e}")
            raise
    
    async def get_by_username(self, username: str) -> Optional[User]:
        """Получить пользователя по username."""
        try:
            return await self.get_by(username=username)
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при получении пользователя по username: {e}")
            raise
    
    async def get_by_email_or_username(
        self, 
        identifier: str
    ) -> Optional[User]:
        """Получить пользователя по email или username."""
        try:
            # Сначала ищем по email
            user = await self.get_by_email(identifier)
            if user:
                return user
            
            # Если не нашли по email, ищем по username
            return await self.get_by_username(identifier)
            
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при поиске пользователя: {e}")
            raise
    
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
            log.debug(f"🔄 Время входа обновлено для пользователя: {user_id}")
            
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при обновлении времени входа: {e}")
            raise
    
    async def update_password(
        self, 
        user_id: UUID, 
        new_password: str
    ) -> User:
        """Обновить пароль пользователя."""
        try:
            hashed_password = self.security.get_password_hash(new_password)
            
            stmt = (
                update(User)
                .where(User.id == user_id)
                .values(hashed_password=hashed_password)
                .returning(User)
            )
            
            result = await self.session.execute(stmt)
            user = result.scalar_one()
            await self.session.flush()
            
            log.info(f"✅ Пароль обновлен для пользователя: {user.email}")
            return user
            
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при обновлении пароля: {e}")
            raise
    
    async def deactivate_user(self, user_id: UUID) -> User:
        """Деактивировать пользователя."""
        try:
            stmt = (
                update(User)
                .where(User.id == user_id)
                .values(is_active=False)
                .returning(User)
            )
            
            result = await self.session.execute(stmt)
            user = result.scalar_one()
            await self.session.flush()
            
            log.info(f"⚠️ Пользователь деактивирован: {user.email}")
            return user
            
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при деактивации пользователя: {e}")
            raise
    
    async def activate_user(self, user_id: UUID) -> User:
        """Активировать пользователя."""
        try:
            stmt = (
                update(User)
                .where(User.id == user_id)
                .values(is_active=True)
                .returning(User)
            )
            
            result = await self.session.execute(stmt)
            user = result.scalar_one()
            await self.session.flush()
            
            log.info(f"✅ Пользователь активирован: {user.email}")
            return user
            
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при активации пользователя: {e}")
            raise
    
    async def verify_user(self, user_id: UUID) -> User:
        """Подтвердить email пользователя."""
        try:
            stmt = (
                update(User)
                .where(User.id == user_id)
                .values(is_verified=True)
                .returning(User)
            )
            
            result = await self.session.execute(stmt)
            user = result.scalar_one()
            await self.session.flush()
            
            log.info(f"✅ Email подтвержден: {user.email}")
            return user
            
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при подтверждении email: {e}")
            raise
    
    async def get_active_users(
        self, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[User]:
        """Получить список активных пользователей."""
        try:
            return await self.get_multi(
                skip=skip,
                limit=limit,
                is_active=True,
            )
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при получении активных пользователей: {e}")
            raise
    
    async def search_users(
        self, 
        search_term: str,
        skip: int = 0,
        limit: int = 100,
    ) -> List[User]:
        """Поиск пользователей по email или username."""
        try:
            query = (
                select(User)
                .where(
                    (User.email.ilike(f"%{search_term}%")) |
                    (User.username.ilike(f"%{search_term}%")) |
                    (User.full_name.ilike(f"%{search_term}%"))
                )
                .offset(skip)
                .limit(limit)
            )
            
            result = await self.session.execute(query)
            return result.scalars().all()
            
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при поиске пользователей: {e}")
            raise
    
    async def count_by_status(
        self, 
        is_active: Optional[bool] = None,
        is_verified: Optional[bool] = None,
    ) -> int:
        """Посчитать пользователей по статусу."""
        try:
            query = select(func.count()).select_from(User)
            
            filters = []
            if is_active is not None:
                filters.append(User.is_active == is_active)
            if is_verified is not None:
                filters.append(User.is_verified == is_verified)
            
            if filters:
                query = query.where(*filters)
            
            result = await self.session.execute(query)
            return result.scalar_one()
            
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при подсчете пользователей: {e}")
            raise
