# alembic/env.py
import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context
import sys
import os
from pathlib import Path

# Добавляем корень проекта в Python path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.models.base import Base
from app.core.configs import settings

# Загружаем конфигурацию Alembic
config = context.config

# Настраиваем логирование
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Устанавливаем URL базы данных из настроек
config.set_main_option("sqlalchemy.url", settings.database.database_url)

# Указываем метаданные
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Запуск миграций в офлайн-режиме."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    """Запуск миграций."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        # Важные опции для работы с существующими таблицами
        include_object=lambda object, name, type_, reflected, compare_to: (
            # Исключаем таблицу alembic_version из сравнения
            not (type_ == "table" and name == "alembic_version")
        ),
        compare_type=True,
        compare_server_default=True,
        render_as_batch=True,  # Для совместимости с SQLite и изменения столбцов
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    """Асинхронный запуск миграций."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_online() -> None:
    """Запуск миграций в онлайн-режиме."""
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()