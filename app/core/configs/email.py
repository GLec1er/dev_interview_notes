from pydantic import Field
from pydantic_settings import BaseSettings
from functools import lru_cache


class EmailSettings(BaseSettings):
    """Настройки электронной почты."""
    
    # SMTP сервер
    smtp_server: str = Field(
        default="smtp.gmail.com",
        alias="SMTP_SERVER",
    )
    smtp_port: int = Field(
        default=587,
        alias="SMTP_PORT"
    )
    smtp_user: str = Field(
        default="your-email@gmail.com",
        alias="SMTP_USER"
    )
    smtp_password: str = Field(
        default="your-app-password",
        alias="SMTP_PASSWORD"
    )
    
    # От кого отправлять письма
    sender_email: str = Field(
        default="noreply@interviewnotes.com",
        alias="SENDER_EMAIL"
    )
    sender_name: str = Field(
        default="Interview Notes",
        alias="SENDER_NAME"
    )
    
    # Времена жизни ссылок
    password_reset_expire_minutes: int = Field(
        default=30,
        alias="PASSWORD_RESET_EXPIRE_MINUTES"
    )

    frontend_base_url: str = Field(
        default="http://localhost:5173",
        alias="FRONTEND_BASE_URL"
    )
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"  # Игнорировать лишние переменные


@lru_cache()
def get_email_settings() -> EmailSettings:
    """Получить кешированные настройки приложения."""
    return EmailSettings()