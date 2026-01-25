"""Сервис для отправки feedback."""

import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import ssl

from app.core.configs import settings
from app.core.loggers import log


class FeedbackService:
    """Сервис отправки feedback на email."""
    
    def __init__(self):
        self.email_settings = settings.email
    
    async def send_feedback(
        self,
        name: str,
        email: str,
        subject: str,
        message: str,
        feedback_type: str,
    ) -> bool:
        """
        Отправляет feedback на почту администратора.
        
        Args:
            name: Имя пользователя
            email: Email пользователя
            subject: Тема сообщения
            message: Текст сообщения
            feedback_type: Тип feedback (suggestion, bug, general)
            
        Returns:
            True если успешно отправлено, False в случае ошибки
        """
        try:
            # Транслитерируем тип feedback для читаемости
            type_translation = {
                'suggestion': '💡 Предложение',
                'bug': '🐛 Ошибка/Проблема',
                'general': '💬 Общее замечание',
            }
            feedback_type_display = type_translation.get(feedback_type, feedback_type)
            
            # Создаем сообщение
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"[FEEDBACK] {subject}"
            msg["From"] = f"{self.email_settings.sender_name} <{self.email_settings.sender_email}>"
            msg["To"] = "grisha.lavrov.178@mail.ru"  # Адрес админа
            msg["Reply-To"] = email  # Чтобы можно было легко ответить
            
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
                    <div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 32px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-weight: 700; font-size: 24px;">Новый Feedback</h1>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">Interview Notes</p>
                    </div>
                    
                    <!-- Контент -->
                    <div style="padding: 32px;">
                        <!-- Тип и тема -->
                        <div style="margin-bottom: 24px;">
                            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px;">
                                <span style="background-color: #e0f7ff; padding: 6px 12px; border-radius: 6px; font-weight: 600; color: #0099cc; font-size: 14px;">
                                    {feedback_type_display}
                                </span>
                            </div>
                            <h2 style="color: #2D3748; margin: 0; font-weight: 700; font-size: 20px;">
                                {subject}
                            </h2>
                        </div>
                        
                        <!-- Инфо о пользователе -->
                        <div style="background-color: #F7FAFC; border-left: 4px solid #00d4ff; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                            <p style="color: #4A5568; margin: 0 0 8px 0; font-size: 14px;">
                                <strong>От:</strong> {name}
                            </p>
                            <p style="color: #4A5568; margin: 0; font-size: 14px;">
                                <strong>Email:</strong> <a href="mailto:{email}" style="color: #00d4ff; text-decoration: none;">{email}</a>
                            </p>
                        </div>
                        
                        <!-- Сообщение -->
                        <div style="margin-bottom: 24px;">
                            <h3 style="color: #2D3748; margin: 0 0 12px 0; font-weight: 600; font-size: 16px;">Сообщение:</h3>
                            <div style="background-color: #F7FAFC; padding: 16px; border-radius: 8px; border: 1px solid #E2E8F0;">
                                <p style="color: #2D3748; margin: 0; font-size: 16px; white-space: pre-wrap; word-wrap: break-word;">
                                    {message}
                                </p>
                            </div>
                        </div>
                        
                        <!-- Кнопка ответа -->
                        <div style="text-align: center; margin-top: 32px;">
                            <a href="mailto:{email}" style="display: inline-block; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                                Ответить пользователю
                            </a>
                        </div>
                    </div>
                    
                    <!-- Подвал -->
                    <div style="background-color: #F7FAFC; padding: 20px; text-align: center; border-top: 1px solid #E2E8F0;">
                        <p style="color: #718096; margin: 0; font-size: 12px;">
                            Это автоматическое письмо с платформы Interview Notes
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Добавляем HTML версию
            html_part = MIMEText(html_content, "html", "utf-8")
            msg.attach(html_part)
            
            # Отправляем письмо через SMTP
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
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
                await smtp.send_message(msg)
            
            log.info(f"Feedback отправлен успешно. От: {email}, тип: {feedback_type}")
            return True
            
        except Exception as e:
            log.error(f"Ошибка при отправке feedback: {str(e)}")
            return False


# Создаем глобальный экземпляр сервиса
feedback_service = FeedbackService()
