"""Репозиторий для работы с отметками выполнения вопросов."""

from typing import Optional, List, Dict, Any
from uuid import UUID

from sqlalchemy import case, func, select, delete
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from app.db.models.question import QuestionCompletion, Question, Category
from app.core.loggers import log
from app.repositories.base import BaseRepository
from app.schemas.base import PaginationParams


class QuestionCompletionRepository(
    BaseRepository[
        QuestionCompletion, 
        dict, 
        dict
    ]
):
    """Репозиторий для работы с отметками выполнения вопросов в БД."""

    def __init__(self, session: AsyncSession):
        super().__init__(QuestionCompletion, session)
    
    async def mark_question_complete(
        self,
        user_id: UUID,
        question_id: UUID,
    ) -> Optional[QuestionCompletion]:
        """Отметить вопрос как выполненный.
        
        Args:
            user_id: UUID пользователя
            question_id: UUID вопроса
            
        Returns:
            Объект QuestionCompletion или None если уже существует
        """
        try:
            # Проверяем, не отмечен ли уже вопрос как выполненный
            existing = await self.get_completion(user_id, question_id)
            if existing:
                log.warning(f"⚠️ Вопрос {question_id} уже отмечен как выполненный для пользователя {user_id}")
                return existing
            
            # Создаем новую запись
            completion = QuestionCompletion(
                user_id=user_id,
                question_id=question_id,
            )
            self.session.add(completion)
            await self.session.flush()
            
            log.info(f"✅ Вопрос {question_id} отмечен как выполненный для пользователя {user_id}")
            return completion
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при отметке вопроса как выполненного: {e}")
            raise

    async def unmark_question_complete(
        self,
        user_id: UUID,
        question_id: UUID,
    ) -> bool:
        """Снять отметку выполнения с вопроса.
        
        Args:
            user_id: UUID пользователя
            question_id: UUID вопроса
            
        Returns:
            True если отметка была удалена, False если не найдена
        """
        try:
            stmt = delete(QuestionCompletion).where(
                (QuestionCompletion.user_id == user_id) &
                (QuestionCompletion.question_id == question_id)
            )
            result = await self.session.execute(stmt)
            
            if result.rowcount > 0:
                log.info(f"✅ Отметка выполнения удалена для вопроса {question_id} пользователя {user_id}")
                return True
            else:
                log.warning(f"⚠️ Отметка выполнения не найдена для вопроса {question_id} пользователя {user_id}")
                return False
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при удалении отметки выполнения: {e}")
            raise

    async def get_completion(
        self,
        user_id: UUID,
        question_id: UUID,
    ) -> Optional[QuestionCompletion]:
        """Получить отметку выполнения вопроса.
        
        Args:
            user_id: UUID пользователя
            question_id: UUID вопроса
            
        Returns:
            Объект QuestionCompletion или None
        """
        try:
            stmt = select(QuestionCompletion).where(
                (QuestionCompletion.user_id == user_id) &
                (QuestionCompletion.question_id == question_id)
            )
            result = await self.session.execute(stmt)
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при получении отметки выполнения: {e}")
            raise

    async def is_question_completed(
        self,
        user_id: UUID,
        question_id: UUID,
    ) -> bool:
        """Проверить, выполнен ли вопрос пользователем.
        
        Args:
            user_id: UUID пользователя
            question_id: UUID вопроса
            
        Returns:
            True если вопрос выполнен, False иначе
        """
        try:
            completion = await self.get_completion(user_id, question_id)
            return completion is not None
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при проверке выполнения вопроса: {e}")
            raise

    async def get_user_completed_questions(
        self,
        user_id: UUID,
        pagination: Optional[PaginationParams] = None,
    ) -> tuple[List[QuestionCompletion], int]:
        """Получить список выполненных вопросов пользователя.
        
        Args:
            user_id: UUID пользователя
            pagination: Параметры пагинации
            
        Returns:
            Кортеж (список выполненных вопросов, общее количество)
        """
        try:
            # Подсчет общего количества
            count_stmt = select(func.count()).select_from(QuestionCompletion).where(
                QuestionCompletion.user_id == user_id
            )
            count_result = await self.session.execute(count_stmt)
            total = count_result.scalar_one()
            
            # Получение списка с пагинацией
            stmt = select(QuestionCompletion).where(
                QuestionCompletion.user_id == user_id
            ).options(
                selectinload(QuestionCompletion.question)
            ).order_by(QuestionCompletion.completed_at.desc())
            
            if pagination:
                stmt = stmt.offset((pagination.page_number - 1) * pagination.limit).limit(pagination.limit)
            
            result = await self.session.execute(stmt)
            completions = result.scalars().unique().all()
            
            log.debug(f"📖 Получено {len(completions)} выполненных вопросов для пользователя {user_id}")
            return completions, total
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при получении выполненных вопросов: {e}")
            raise

    async def get_user_completion_stats(
        self,
        user_id: UUID,
    ) -> Dict[str, Any]:
        """Получить статистику выполнения вопросов пользователем.
        
        Args:
            user_id: UUID пользователя
            
        Returns:
            Словарь со статистикой
        """
        try:
            # Единый запрос для получения всей статистики
            stmt = select(
                func.count().label('total'),
                func.sum(case((Question.difficulty == 'easy', 1), else_=0)).label('easy'),
                func.sum(case((Question.difficulty == 'medium', 1), else_=0)).label('medium'),
                func.sum(case((Question.difficulty == 'hard', 1), else_=0)).label('hard')
            ).select_from(QuestionCompletion).join(
                Question, Question.id == QuestionCompletion.question_id
            ).where(
                QuestionCompletion.user_id == user_id
            )
            
            result = await self.session.execute(stmt)
            row = result.first()
            
            # Если результатов нет, возвращаем нули
            if not row or row.total is None:
                stats = {
                    'total_completed': 0,
                    'easy_completed': 0,
                    'medium_completed': 0,
                    'hard_completed': 0,
                }
            else:
                stats = {
                    'total_completed': row.total,
                    'easy_completed': row.easy or 0,
                    'medium_completed': row.medium or 0,
                    'hard_completed': row.hard or 0,
                }
            
            # Дополнительно: количество вопросов по каждой сложности в системе
            total_counts_stmt = select(
                Question.difficulty,
                func.count(Question.id).label('count')
            ).group_by(Question.difficulty)
            
            total_counts_result = await self.session.execute(total_counts_stmt)
            total_counts = total_counts_result.all()
            
            # Преобразуем в удобный формат
            difficulty_totals = {'easy': 0, 'medium': 0, 'hard': 0, 'all': 0}
            for difficulty, count in total_counts:
                difficulty_totals[difficulty] = count
                difficulty_totals['all'] += count
            
            # Добавляем прогресс по каждой сложности (в процентах)
            stats.update({
                'total': difficulty_totals['all'],
                'total_easy': difficulty_totals['easy'],
                'total_medium': difficulty_totals['medium'],
                'total_hard': difficulty_totals['hard'],
            })
            
            return stats
            
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при получении статистики выполнения: {e}")
            raise

    async def get_user_completion_stats_by_category(
        self,
        user_id: UUID,
    ) -> List[Dict[str, Any]]:
        """Получить статистику выполнения вопросов по категориям.
        
        Args:
            user_id: UUID пользователя
            
        Returns:
            Список словарей со статистикой по категориям
        """
        try:
            # Получаем все категории с количеством выполненных вопросов
            stmt = select(
                Category.id,
                Category.name,
                func.count(QuestionCompletion.id).label('completed_count'),
                func.count(Question.id).label('total_count'),
            ).outerjoin(
                Question, Category.id == Question.category_id
            ).outerjoin(
                QuestionCompletion,
                (Question.id == QuestionCompletion.question_id) &
                (QuestionCompletion.user_id == user_id)
            ).group_by(
                Category.id,
                Category.name,
            ).order_by(
                Category.name
            )
            
            result = await self.session.execute(stmt)
            rows = result.all()
            
            stats = []
            for row in rows:
                category_id, category_name, completed_count, total_count = row
                percentage = (completed_count / total_count * 100) if total_count > 0 else 0
                
                stats.append({
                    'category_id': str(category_id),
                    'category_name': category_name,
                    'completed_count': completed_count or 0,
                    'total_count': total_count or 0,
                    'percentage': round(percentage, 2),
                })
            
            log.debug(f"📊 Получена статистика по категориям для пользователя {user_id}")
            return stats
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при получении статистики по категориям: {e}")
            raise

    async def get_overall_completion_percentage(
        self,
        user_id: UUID,
    ) -> float:
        """Получить общий процент выполнения вопросов.
        
        Args:
            user_id: UUID пользователя
            
        Returns:
            Процент выполнения (0-100)
        """
        try:
            # Общее количество опубликованных вопросов
            total_stmt = select(func.count()).select_from(Question).where(
                Question.is_published == True
            )
            total_result = await self.session.execute(total_stmt)
            total_questions = total_result.scalar_one()
            
            if total_questions == 0:
                return 0.0
            
            # Количество выполненных вопросов
            completed_stmt = select(func.count()).select_from(QuestionCompletion).where(
                QuestionCompletion.user_id == user_id
            )
            completed_result = await self.session.execute(completed_stmt)
            completed_questions = completed_result.scalar_one()
            
            percentage = (completed_questions / total_questions) * 100
            
            log.debug(f"📊 Общий процент выполнения для пользователя {user_id}: {percentage:.2f}%")
            return round(percentage, 2)
        except SQLAlchemyError as e:
            log.error(f"❌ Ошибка при получении общего процента выполнения: {e}")
            raise
