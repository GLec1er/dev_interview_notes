"""Основная точка входа FastAPI приложения."""

from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.configs import settings
from app.core.middleware import CookieAuthMiddleware
from app.db.models.question import Base
from app.db.database import engine
from app.core.loggers import log
from app.routers.questions import router as question_router
from app.routers.answers import router as answer_router
from app.routers.category import router as category_router
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.question_completion import router as question_completion_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Создание таблиц в БД...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    log.info("Таблицы успешно созданы/проверены")
    yield
    log.info("Завершение работы приложения...")


app = FastAPI(
    title=settings.app.app_name,
    description=settings.app.app_description,
    version=settings.app.app_version,
    lifespan=lifespan,
)


# Add middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.app.cors_origins,
    allow_credentials=settings.app.cors_allow_credentials,
    allow_methods=settings.app.cors_allow_methods,
    allow_headers=settings.app.cors_allow_headers,
)
app.add_middleware(CookieAuthMiddleware)


# Root endpoint
app.include_router(question_router)
app.include_router(answer_router)
app.include_router(category_router)
app.include_router(question_completion_router)
app.include_router(auth_router)
app.include_router(users_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Interview Notes API",
        "docs": "/docs",
        "openapi": "/openapi.json",
    }


@app.get("/health")
async def health():
    """Health check endpoint with detailed information."""
    try:
        # Проверка для asyncpg
        async with engine.connect() as conn:
            # Способ 1
            await conn.scalar(text("SELECT 1"))
            # Способ 2 - получение версии базы данных
            version = await conn.scalar(text("SELECT version()"))
            
        db_status = {
            "status": "healthy",
            "database_version": version.split()[1] if version else "unknown"
        }
    except Exception as e:
        db_status = {
            "status": "unhealthy",
            "error": str(e)
        }
    
    health_info = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "dependencies": {
            "database": db_status,
        }
    }

    if db_status.get("status") != "healthy":
        health_info["status"] = "degraded"
        
    return health_info
