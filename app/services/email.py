"""Сервис для отправки email."""

from datetime import datetime
import secrets
import ssl
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib

from app.core.configs import settings
from app.core.loggers import log


class EmailService:
    """Сервис отправки email."""
    
    def __init__(self):
        self.email_settings = settings.email
    
    @staticmethod
    def generate_password(length: int = 12) -> str:
        """
        Генерирует новый пароль.
        
        Args:
            length: Длина пароля (по умолчанию 12)
            
        Returns:
            Новый пароль с буквами, цифрами и спецсимволами
        """
        # Убираем похожие символы: 0, O, l, 1, I для удобства
        chars = string.ascii_letters + string.digits + string.punctuation
        # Исключаем некоторые спецсимволы которые могут вызвать проблемы
        chars = chars.replace("'", "").replace('"', "").replace("\\", "").replace("/", "")
        
        password = ''.join(secrets.choice(chars) for _ in range(length))
        return password
    

    async def send_password_reset_email(
        self,
        to_email: str,
        first_name: str,
        new_password: str,
    ) -> bool:
        """
        Отправляет email с новым паролем.
        
        Args:
            to_email: Email адрес получателя
            first_name: Имя пользователя
            new_password: Новый пароль
            
        Returns:
            True если успешно отправлено, False в случае ошибки
        """
        try:
            # Создаем сообщение
            message = MIMEMultipart("alternative")
            message["Subject"] = "🔐 Восстановление пароля - InterviewBox"
            message["From"] = f"{self.email_settings.sender_name} <{self.email_settings.sender_email}>"
            message["To"] = to_email
            
            # HTML версия письма
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            </head>
            <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #F7FAFC; color: #2D3748; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
                    
                    <!-- Шапка -->
                    <div style="background: linear-gradient(135deg, #3182CE 0%, #2C5282 100%); padding: 32px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-weight: 700; font-size: 28px;">Восстановление пароля</h1>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">InterviewBox</p>
                    </div>
                    
                    <!-- Контент -->
                    <div style="padding: 40px;">
                        <!-- Приветствие -->
                        <div style="margin-bottom: 32px;">
                            <h2 style="color: #2D3748; margin: 0 0 16px 0; font-weight: 600; font-size: 20px;">
                                👋 Привет, {first_name}!
                            </h2>
                            <p style="color: #4A5568; margin: 0; font-size: 16px;">
                                Был выполнен запрос на восстановление пароля для вашего аккаунта. 
                                Используйте новый пароль ниже для входа в систему.
                            </p>
                        </div>
                        
                        <!-- Карточка с паролем -->
                        <div style="background-color: #F7FAFC; border: 2px solid #E2E8F0; border-radius: 10px; padding: 24px; margin: 32px 0; position: relative;">
                            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                                <h3 style="color: #2D3748; margin: 0; font-weight: 600; font-size: 18px;">
                                    Ваш новый пароль
                                </h3>
                            </div>
                            
                            <div style="background-color: white; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; text-align: center;">
                                <code style="font-family: 'SF Mono', Monaco, 'Cascadia Mono', monospace; font-size: 18px; letter-spacing: 1px; color: #2D3748; font-weight: 600;">
                                    {new_password}
                                </code>
                            </div>
                        </div>
                        
                        <!-- Важное уведомление -->
                        <div style="background-color: #FFF5F5; border-left: 4px solid #E53E3E; padding: 20px; border-radius: 6px; margin-bottom: 32px;">
                            <div style="display: flex; align-items: flex-start;">
                                <div style="color: #E53E3E; margin-right: 12px; flex-shrink: 0;">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                </div>
                                <div>
                                    <h4 style="color: #2D3748; margin: 0 0 8px 0; font-weight: 600; font-size: 16px;">
                                        Важная информация
                                    </h4>
                                    <p style="color: #4A5568; margin: 0; font-size: 14px;">
                                        Пароль сгенерирован и готов к использованию.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Кнопка входа -->
                        <div style="text-align: center; margin-bottom: 32px;">
                            <a href="{self.email_settings.frontend_base_url}/login" style="display: inline-block; background: linear-gradient(135deg, #3182CE 0%, #2B6CB0 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3); transition: all 0.2s;">
                                Перейти к входу →
                            </a>
                        </div>
                        
                        <!-- Дополнительная информация -->
                        <div style="padding-top: 24px; border-top: 1px solid #E2E8F0;">
                            <p style="color: #718096; margin: 0 0 8px 0; font-size: 14px; text-align: center;">
                                <strong>Не вы запрашивали восстановление?</strong>
                            </p>
                            <p style="color: #718096; margin: 0; font-size: 14px; text-align: center;">
                                Пожалуйста, проигнорируйте это письмо или свяжитесь с нашей службой поддержки.
                            </p>
                        </div>
                    </div>
                    
                    <!-- Футер -->
                    <div style="background-color: #F7FAFC; padding: 24px; text-align: center; border-top: 1px solid #E2E8F0;">
                        <p style="color: #718096; margin: 0 0 8px 0; font-size: 14px;">
                            <strong>InterviewBox</strong> — платформа для подготовки к собеседованиям
                        </p>
                        <p style="color: #A0AEC0; margin: 0; font-size: 13px;">
                            © {datetime.now().year} InterviewBox. Все права защищены.
                        </p>
                    </div>
                    
                </div>
            </body>
            </html>
            """
            
            # Добавляем обе версии
            part = MIMEText(html_content, "html")
            message.attach(part)

            # Создаем SSL контекст без проверки сертификатов
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            # Отправляем письмо
            async with aiosmtplib.SMTP(
                hostname=self.email_settings.smtp_server,
                port=self.email_settings.smtp_port,
                tls_context=ssl_context,
                timeout=30,
            ) as smtp:
                await smtp.login(
                    self.email_settings.smtp_user,
                    self.email_settings.smtp_password,
                )
                await smtp.send_message(message)

            log.info(f"✅ Email с новым паролем отправлен на {to_email}")
            return True
            
        except Exception as e:
            log.error(f"❌ Ошибка при отправке email на {to_email}: {e}")
            return False
