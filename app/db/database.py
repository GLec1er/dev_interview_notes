"""Конфигурация базы данных и сессии."""

from typing import Annotated, AsyncIterator
from contextlib import asynccontextmanager
from fastapi import Depends
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
)

from app.core.configs import settings


engine = create_async_engine(
    settings.database.database_url,
    echo=settings.app.debug,
    pool_size=settings.database.db_pool_size,        
    max_overflow=settings.database.db_max_overflow,           
    pool_timeout=settings.database.db_pool_timeout,        
    pool_recycle=settings.database.db_pool_recycle,
    pool_pre_ping=settings.database.db_pool_pre_ping,
)


AsyncSessionFactory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False, # чтобы объекты не становились "отсоединенными" после коммита
    autoflush=False,        # отключаем autoflush для явного контроля
    autocommit=False,      # отключаем autocommit для явного контроля
)


async def get_session() -> AsyncIterator[AsyncSession]:
    """
    Зависимость для получения сессии базы данных.
    Принцип работы:
    - Создает новую сессию для каждого запроса.
    - Коммитит транзакцию, если запрос успешен.
    - Откатывает транзакцию в случае ошибки.
    - Закрывает сессию после завершения запроса.
    """
    async with AsyncSessionFactory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Тип для аннотации зависимостей сессии в FastAPI
SessionDep = Annotated[AsyncSession, Depends(get_session)]


# ---------------------------------------------------------------- #
# Контекстный менеджер для работы с сессией 
@asynccontextmanager
async def session_ctx() -> AsyncIterator[AsyncSession]:
    """Контекстный менеджер для работы с сессией базы данных."""
    async with AsyncSessionFactory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
