# Запуск приложения

## 1. Предварительные требования

- Docker и Docker Compose установлены
- Или Python 3.11+ и PostgreSQL 15+ (для локального запуска)

## 2. Запуск через Docker Compose

### Для первого запуска:

```bash
# Клонировать репозиторий
cd dev_interview_notes

# Создать .env файл (если его нет)
cp .env.example .env

# Сборка и запуск контейнеров
docker-compose up --build
```

Приложение будет доступно по адресу: **http://localhost:8888**

- API Documentation: http://localhost:8888/docs
- Alternative API Docs: http://localhost:8888/redoc

### Для последующих запусков:

```bash
# Просто стартовать контейнеры
docker-compose up

# Или в фоновом режиме
docker-compose up -d

# Остановить контейнеры
docker-compose down

# Остановить с удалением volumes (база данных)
docker-compose down -v
```

## 3. Локальный запуск (без Docker)

### Установка зависимостей:

```bash
# Создать виртуальное окружение
python3 -m venv venv

# Активировать окружение
source venv/bin/activate  # macOS/Linux
# или
venv\Scripts\activate  # Windows

# Установить зависимости
pip install -r requirements.txt
# или
pip install -e .  # если используется pyproject.toml
```

### Запуск PostgreSQL локально:

```bash
# macOS с Homebrew
brew services start postgresql

# Или через Docker контейнер
docker run --name interview_db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=interview_notes -p 5432:5432 -d postgres:15-alpine
```

### Создание БД:

```bash
# Подключиться к PostgreSQL
psql -U postgres

# Создать БД (если её нет)
CREATE DATABASE interview_notes;

# Выход
\q
```

### Запуск приложения:

```bash
# В корневой директории проекта
uvicorn app.main:app --reload

# Или с указанием хоста и порта
uvicorn app.main:app --host 0.0.0.0 --port 8888 --reload
```

## 4. Проверка здоровья приложения

```bash
# Health check
curl http://localhost:8888/health

# Должен вернуть:
# {"status":"ok"}
```

## 5. Переменные окружения

Создайте `.env` файл в корневой директории:

```env
# Database
DB_HOST=postgres          # или localhost для локального запуска
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=interview_notes
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/interview_notes

# App
DEBUG=True
ENVIRONMENT=development
```

## 6. Тестирование API

После запуска приложения, откройте в браузере:

**http://localhost:8888/docs**

Это откроет Swagger UI интерфейс где можно тестировать все endpoints.

## 7. Решение проблем

### Ошибка: "Could not connect to database"

```bash
# Проверить статус PostgreSQL контейнера
docker-compose ps

# Просмотреть логи БД
docker-compose logs postgres

# Перезапустить контейнер БД
docker-compose restart postgres
```

### Таблицы не создаются

Таблицы создаются автоматически при запуске приложения (в lifespan контексте).
Если не создаются, проверить логи:

```bash
docker-compose logs app
```

### Ошибка с импортами

```bash
# Переустановить зависимости
pip install -r requirements.txt --force-reinstall

# Или с pyproject.toml
pip install -e . --force-reinstall
```

## 8. Остановка и очистка

```bash
# Остановить контейнеры
docker-compose down

# Полная очистка (удалит БД)
docker-compose down -v

# Удалить образы
docker-compose down -v --rmi all
```

---

**Готово!** Приложение должно быть запущено и готово к использованию.
