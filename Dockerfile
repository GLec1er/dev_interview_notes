FROM python:3.11-slim

WORKDIR /app

# Установка зависимостей системы
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Установка Poetry
RUN pip install --no-cache-dir poetry

# Копируем только pyproject.toml и poetry.lock (если есть)
COPY pyproject.toml poetry.lock* ./

# Устанавливаем зависимости в виртуальное окружение Poetry и отключаем активацию виртуалки
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi

# Копируем исходники
COPY app/ ./app/

EXPOSE 8888

CMD ["uvicorn", "app.core.main:app", "--host", "0.0.0.0", "--port", "8888"]
