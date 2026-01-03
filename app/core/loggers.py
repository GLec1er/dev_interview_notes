import asyncio
from datetime import datetime, timedelta
import os
import shutil
import sys
from loguru import logger


# Its a good practice to clean up old log files to save disk space
def cleanup_old_logs(log_dir="logs", days=14):
    now = datetime.now()
    for file in os.listdir(log_dir):
        file_path = os.path.join(log_dir, file)
        if os.path.isfile(file_path):
            mtime = datetime.fromtimestamp(os.path.getmtime(file_path))
            if now - mtime > timedelta(days=days):
                os.remove(file_path)
                print(f"🧹 Delete old log: {file}")
        elif os.path.isdir(file_path) and file.endswith(".zip"):
            shutil.rmtree(file_path)


def configure_logger():
    os.makedirs("logs", exist_ok=True)
    cleanup_old_logs("logs", days=14)
    logger.remove()

    level_colors = {
        "DEBUG": "<blue>",
        "INFO": "<white>",
        "WARNING": "<yellow>",
        "ERROR": "<red>",
        "CRITICAL": "<bold><red>",
        "SUCCESS": "<green>"
    }

    for level, color in level_colors.items():
        logger.level(level, color=color)

    logger.add(
        sys.stdout,
        colorize=True,
        level="DEBUG",
        format=(
            "<level>{time:YYYY-MM-DD HH:mm:ss}</level> | "
            "<level>{level: <8}</level> | "
            "<level>{name}</level>:<level>{function}</level>:<level>{line}</level> - "
            "<level>{message}</level>"
        ),
    )


    # ERROR file output
    logger.add(
        "logs/errors_{time:YYYY-MM-DD}.log",
        rotation="5 MB",
        retention="14 days",
        compression="zip",
        level="ERROR",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} - {message}"
    )

    logger.info("📟 Loger initialized successfully!")
    return logger


log = configure_logger()
