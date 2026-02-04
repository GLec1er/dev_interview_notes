import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Alert,
  Stack,
  Paper,
  alpha,
  IconButton,
  Tooltip,
  Fab,
  Dialog,
  DialogActions,
  DialogContent,
  Tab,
  Tabs,
  DialogTitle,
  TextField,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  Lightbulb as SolutionIcon,
  Description as DescriptionIcon,
  TrendingUp as DifficultyIcon,
  Visibility as PublishedIcon,
  VisibilityOff as DraftIcon,
  Category as CategoryIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  KeyboardArrowUp as ScrollTopIcon,
  Comment as CommentIcon,
  History as HistoryIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { questionService } from '../services/questionService';
import { answerService } from '../services/answerService';
import { categoryService } from '../services/categoryService';
import { questionCompletionService } from '../services/questionCompletionService';
import { favoriteService } from '../services/favoriteService';
import { ContentRenderer } from '../components/ContentRenderer';
import type { Question, Answer, Category, ContentBlock } from '../types';
import { ContentEditor } from '../components/Admin/ContentEditor';
import { useAuth } from '../context/AuthContext';

// Нейтральная цветовая палитра
const NEUTRAL_COLORS = {
  primary: '#2D3748',
  secondary: '#4A5568',
  accent: '#3182CE',
  background: '#F7FAFC',
  surface: '#FFFFFF',
  textPrimary: '#1A202C',
  textSecondary: '#718096',
  border: '#E2E8F0',
  success: '#38A169',
  warning: '#DD6B20',
  error: '#E53E3E',
  info: '#3182CE',
};

// SolutionCard.tsx - обновленная версия компонента с кнопками админа
interface SolutionCardProps {
  answer: Answer;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onCopyCode: (code: string) => void;
  isAdmin: boolean;
  onEditAnswer: (answer: Answer) => void;
  onDeleteAnswer: (answerId: string) => void;
}

const SolutionCard: React.FC<SolutionCardProps> = ({ 
  answer, 
  index, 
  isExpanded, 
  onToggle,
  onCopyCode,
  isAdmin,
  onEditAnswer,
  onDeleteAnswer
}) => {

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${NEUTRAL_COLORS.border}`,
        backgroundColor: NEUTRAL_COLORS.surface,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        mb: 2,
        '&:hover': {
          borderColor: alpha(NEUTRAL_COLORS.accent, 0.5),
          boxShadow: `0 4px 20px ${alpha(NEUTRAL_COLORS.accent, 0.08)}`,
        },
      }}
    >
      {/* Заголовок карточки - кликабельная область */}
      <Box
        sx={{
          p: { xs: 2.5, md: 3 },
          backgroundColor: NEUTRAL_COLORS.background,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
          },
        }}
      >
        {/* Левая часть с номером и информацией */}
        <Stack 
          direction="row" 
          spacing={2.5} 
          alignItems="center" 
          sx={{ flex: 1 }}
          onClick={onToggle}
        >
          {/* Номер решения */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
              color: NEUTRAL_COLORS.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.125rem',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
          >
            {index + 1}
          </Box>

          {/* Информация о решении */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: NEUTRAL_COLORS.textPrimary,
                mb: 0.5,
                fontSize: '1.125rem',
              }}
            >
              Решение {index + 1}
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Typography
                variant="caption"
                sx={{
                  color: NEUTRAL_COLORS.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: NEUTRAL_COLORS.success,
                    display: 'inline-block',
                  }}
                />
                Обновлено: {new Date(answer.updated_at).toLocaleDateString()}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        {/* Правая часть с иконкой и статусом */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Кнопки для админов */}
          {isAdmin && (
            <>
              <Tooltip title="Редактировать ответ">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditAnswer(answer);
                  }}
                  size="small"
                  sx={{
                    color: NEUTRAL_COLORS.accent,
                    backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.2),
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Удалить ответ">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAnswer(answer.id);
                  }}
                  size="small"
                  sx={{
                    color: NEUTRAL_COLORS.error,
                    backgroundColor: alpha(NEUTRAL_COLORS.error, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(NEUTRAL_COLORS.error, 0.2),
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          
          {/* Иконка раскрытия */}
          <IconButton
            onClick={onToggle}
            size="small"
            sx={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              color: NEUTRAL_COLORS.accent,
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Контент решения - раскрывающаяся часть */}
      <Box
        sx={{
          maxHeight: isExpanded ? 'none' : 0,
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: NEUTRAL_COLORS.surface,
          visibility: isExpanded ? 'visible' : 'hidden',
        }}
      >
        <Box 
          sx={{ 
            p: { xs: 3, md: 4 },
            opacity: isExpanded ? 1 : 0,
            transform: isExpanded ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: isExpanded ? '0.1s' : '0s',
          }}
        >
          {/* Декоративная полоска сверху */}
          <Box
            sx={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.3),
              mb: 3,
              opacity: isExpanded ? 1 : 0,
              transform: isExpanded ? 'translateX(0)' : 'translateX(-20px)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: isExpanded ? '0.2s' : '0s',
            }}
          />

          {/* Контент решения */}
          <Box
            sx={{
              color: NEUTRAL_COLORS.textPrimary,
              lineHeight: 1.8,
              fontSize: '1.05rem',
              '& > *': {
                mb: 2,
              },
              '& p': {
                mb: 2,
              },
              '& h2, & h3, & h4': {
                color: NEUTRAL_COLORS.textPrimary,
                fontWeight: 700,
                mt: 3,
                mb: 1.5,
              },
              '& code': {
                backgroundColor: alpha(NEUTRAL_COLORS.background, 0.8),
                padding: '2px 6px',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.9em',
              },
              '& pre': {
                backgroundColor: alpha(NEUTRAL_COLORS.background, 0.9),
                padding: 3,
                borderRadius: 2,
                overflow: 'auto',
                fontSize: '0.9rem',
                lineHeight: 1.6,
              },
              '& ul, & ol': {
                pl: 3,
                mb: 2,
              },
              '& li': {
                mb: 1,
              },
            }}
          >
            <ContentRenderer 
              blocks={answer.content} 
              onCopyCode={onCopyCode}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export const QuestionDetailPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSolutions, setExpandedSolutions] = useState<number[]>([0]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompletionLoading, setIsCompletionLoading] = useState(false);
  const [answerIsPublished, setAnswerIsPublished] = useState(true);
  
  // Состояния для модалок
  const [openQuestionEditDialog, setOpenQuestionEditDialog] = useState(false);
  const [openQuestionDeleteDialog, setOpenQuestionDeleteDialog] = useState(false);
  const [openAnswerAddDialog, setOpenAnswerAddDialog] = useState(false);
  const [openAnswerEditDialog, setOpenAnswerEditDialog] = useState(false);
  const [openAnswerDeleteDialog, setOpenAnswerDeleteDialog] = useState(false);
  
  // Состояния для форм
  const [questionFormData, setQuestionFormData] = useState({
    title: '',
    slug: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    is_published: true,
    category_id: '',
  });
  const [questionContent, setQuestionContent] = useState<ContentBlock[]>([]);
  const [questionTab, setQuestionTab] = useState(0);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  
  const [answerFormData, setAnswerFormData] = useState<Answer | null>(null);
  const [answerContent, setAnswerContent] = useState<ContentBlock[]>([]);
  const [answerTab, setAnswerTab] = useState(0);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  // Отслеживание скролла для кнопки "Наверх"
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadData = useCallback(async () => {
    if (!questionId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Загружаем вопрос
      const questionData = await questionService.getQuestion(questionId);
      setQuestion(questionData);

      // Загружаем категории
      try {
        const categoriesData = await categoryService.getCategories(1, 100, true);
        setCategories(categoriesData.items);
        
        // Находим категорию вопроса
        if (questionData.category_id) {
          const foundCategory = categoriesData.items.find(
            (cat: Category) => cat.id === questionData.category_id
          );
          if (foundCategory) {
            setCategory(foundCategory);
          }
        }
      } catch (categoryErr) {
        console.warn('Failed to load categories:', categoryErr);
      }

      // Загружаем ответы
      try {
        const answersData = await answerService.getAnswers(
          questionId,
          undefined,
          undefined,
          undefined,
          undefined,
          true,
        );
        setAnswers(answersData);
      } catch (answerErr) {
        console.warn('Failed to load answers:', answerErr);
        setAnswers([]);
      }
    } catch (err) {
      console.error('Failed to load question:', err);
      setError('Failed to load question details');
    } finally {
      setIsLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return NEUTRAL_COLORS.success;
      case 'medium':
        return NEUTRAL_COLORS.warning;
      case 'hard':
        return NEUTRAL_COLORS.error;
      default:
        return NEUTRAL_COLORS.secondary;
    }
  };

  const handleSolutionToggle = (index: number) => {
    setExpandedSolutions((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleBookmarkToggle = async () => {
    if (!questionId) return;

    try {
      let response;
      if (isBookmarked) {
        response = await favoriteService.removeFromFavorites(questionId);
        setIsBookmarked(false);
        setShowCopyNotification('Удалено из избранного');
      } else {
        response = await favoriteService.addToFavorites(questionId);
        setIsBookmarked(true);
        setShowCopyNotification('Добавлено в избранное');
      }
    
      setIsBookmarked(!isBookmarked);
      
      setTimeout(() => setShowCopyNotification(null), 2000);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      setShowCopyNotification('Ошибка при обновлении избранного');
      setTimeout(() => setShowCopyNotification(null), 2000);
    }
  };

  const handleShareQuestion = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopyNotification('Ссылка скопирована в буфер обмена');
    setTimeout(() => setShowCopyNotification(null), 2000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setShowCopyNotification('Код скопирован в буфер обмена');
    setTimeout(() => setShowCopyNotification(null), 2000);
  };

  const handleToggleCompletion = async () => {
    if (!questionId) return;
    
    try {
      setIsCompletionLoading(true);
      
      if (isCompleted) {
        await questionCompletionService.unmarkQuestionComplete(questionId);
        setIsCompleted(false);
        setShowCopyNotification('Отметка выполнения удалена');
      } else {
        await questionCompletionService.markQuestionComplete(questionId);
        setIsCompleted(true);
        setShowCopyNotification('Вопрос отмечен как выполненный!');
      }
      
      setTimeout(() => setShowCopyNotification(null), 2000);
    } catch (err) {
      console.error('Failed to toggle completion:', err);
      setShowCopyNotification('Ошибка при обновлении статуса');
      setTimeout(() => setShowCopyNotification(null), 2000);
    } finally {
      setIsCompletionLoading(false);
    }
  };

  // Загружаем статус выполнения и избранного при загрузке вопроса
  useEffect(() => {
    if (questionId) {
      questionCompletionService.isQuestionCompleted(questionId)
        .then(result => setIsCompleted(result.is_completed))
        .catch(err => console.error('Failed to check completion status:', err));

      favoriteService.isFavorite(questionId)
        .then(result => setIsBookmarked(result.is_favorited))
        .catch(err => console.error('Failed to check favorite status:', err));
    }
  }, [questionId]);

  // Функции для работы с вопросами
  const handleOpenQuestionEdit = () => {
    if (!question || !user?.is_admin) return;
    
    setQuestionFormData({
      title: question.title,
      slug: question.slug,
      difficulty: question.difficulty,
      is_published: question.is_published,
      category_id: question.category_id || '',
    });
    
    // Конвертируем контент вопроса в правильный формат
    const convertedContent = (question.content || []).map(block => {
      if (block.type === 'code' && block.data) {
        const data = block.data as any;
        if (data.content !== undefined && data.code === undefined) {
          return {
            ...block,
            data: {
              ...data,
              code: data.content,
              content: undefined
            }
          };
        }
      }
      return block;
    });
    
    setQuestionContent(convertedContent);
    setQuestionTab(0);
    setQuestionError(null);
    setOpenQuestionEditDialog(true);
  };

  const handleOpenQuestionDelete = () => {
    setOpenQuestionDeleteDialog(true);
  };

  const handleCloseQuestionEdit = () => {
    setOpenQuestionEditDialog(false);
    setQuestionFormData({
      title: '',
      slug: '',
      difficulty: 'easy',
      is_published: true,
      category_id: '',
    });
    setQuestionContent([]);
    setQuestionError(null);
  };

  const handleCloseQuestionDelete = () => {
    setOpenQuestionDeleteDialog(false);
  };

  const handleSaveQuestion = async () => {
    if (!questionId || !question || !user?.is_admin) return;
    
    try {
      setIsSavingQuestion(true);
      setQuestionError(null);
      
      if (!questionFormData.category_id) {
        setQuestionError('Пожалуйста, выберите категорию');
        setIsSavingQuestion(false);
        return;
      }

      if (!questionFormData.title.trim()) {
        setQuestionError('Название вопроса обязательно');
        setIsSavingQuestion(false);
        return;
      }

      if (!questionFormData.slug.trim()) {
        setQuestionError('URL-адрес вопроса обязателен');
        setIsSavingQuestion(false);
        return;
      }

      const questionData = {
        title: questionFormData.title,
        slug: questionFormData.slug,
        difficulty: questionFormData.difficulty,
        is_published: questionFormData.is_published,
        content: questionContent,
        category_id: questionFormData.category_id,
      };

      await questionService.updateQuestion(questionId, questionData);
      
      handleCloseQuestionEdit();
      loadData(); // Перезагружаем данные
      setShowCopyNotification('Вопрос успешно обновлен');
      setTimeout(() => setShowCopyNotification(null), 2000);
    } catch (err: any) {
      setQuestionError(err.response?.data?.detail || 'Не удалось сохранить вопрос');
      console.error('Failed to save question:', err);
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!questionId || !user?.is_admin) return;
    
    try {
      await questionService.deleteQuestion(questionId);
      setShowCopyNotification('Вопрос успешно удален');
      setTimeout(() => {
        navigate('/questions');
      }, 1500);
    } catch (err) {
      console.error('Failed to delete question:', err);
      setShowCopyNotification('Ошибка при удалении вопроса');
      setTimeout(() => setShowCopyNotification(null), 2000);
    } finally {
      handleCloseQuestionDelete();
    }
  };

// Функции для работы с ответами
const handleOpenAnswerAdd = () => {
  if (!user?.is_admin || !questionId) return;
  
  setAnswerFormData(null);
  setAnswerContent([]);
  setAnswerIsPublished(true); // По умолчанию опубликован
  setAnswerError(null);
  setAnswerTab(0);
  setOpenAnswerAddDialog(true);
};

const handleCloseAnswerAdd = () => {
  setOpenAnswerAddDialog(false);
  setAnswerFormData(null);
  setAnswerContent([]);
  setAnswerIsPublished(true);
  setAnswerError(null);
};

const handleOpenAnswerEdit = (answer: Answer) => {
  if (!user?.is_admin) return;
  
  setAnswerFormData(answer);
  
  // Конвертируем контент ответа в правильный формат
  const convertedContent = (answer.content || []).map(block => {
    if (block.type === 'code' && block.data) {
      const data = block.data as any;
      if (data.content !== undefined && data.code === undefined) {
        return {
          ...block,
          data: {
            ...data,
            code: data.content,
            content: undefined
          }
        };
      }
    }
    return block;
  });
  
  setAnswerContent(convertedContent);
  setAnswerIsPublished(answer.is_published || true); // Устанавливаем текущий статус
  setAnswerError(null);
  setAnswerTab(0);
  setOpenAnswerEditDialog(true);
};

const handleCloseAnswerEdit = () => {
  setOpenAnswerEditDialog(false);
  setAnswerFormData(null);
  setAnswerContent([]);
  setAnswerIsPublished(true);
  setAnswerError(null);
};

  const handleOpenAnswerDelete = (answerId: string) => {
    if (!user?.is_admin) return;
    
    setSelectedAnswerId(answerId);
    setOpenAnswerDeleteDialog(true);
  };

  const handleCloseAnswerDelete = () => {
    setOpenAnswerDeleteDialog(false);
    setSelectedAnswerId(null);
  };

  const handleSaveAnswer = async (isEdit: boolean = false) => {
  if (!questionId || !user?.is_admin) return;
  
  try {
    setIsSavingAnswer(true);
    setAnswerError(null);
    
    if (answerContent.length === 0) {
      setAnswerError('Содержание ответа не может быть пустым');
      setIsSavingAnswer(false);
      return;
    }
    
    // ✅ Теперь передаем настройку публикации
    const answerData = {
      content: answerContent,
      is_published: answerIsPublished, // Используем состояние
    };
    
    console.log('Saving answer with data:', answerData); // Для отладки
    
    if (isEdit && answerFormData?.id) {
      await answerService.updateAnswer(questionId, answerFormData.id, answerData);
      setShowCopyNotification('Ответ успешно обновлен');
    } else {
      await answerService.createAnswer(questionId, answerData);
      setShowCopyNotification('Ответ успешно добавлен');
    }
    
    if (isEdit) {
      handleCloseAnswerEdit();
    } else {
      handleCloseAnswerAdd();
    }
    
    loadData();
    setTimeout(() => setShowCopyNotification(null), 2000);
  } catch (err: any) {
    setAnswerError(err.response?.data?.detail || 'Не удалось сохранить ответ');
    console.error('Failed to save answer:', err);
    console.error('Error details:', err.response?.data);
  } finally {
    setIsSavingAnswer(false);
  }
};

  const handleDeleteAnswer = async () => {
    if (!selectedAnswerId || !user?.is_admin || !questionId) return;
    
    try {
      // ✅ Исправлено: передаем questionId как параметр
      await answerService.deleteAnswer(questionId, selectedAnswerId);
      setAnswers(answers.filter(answer => answer.id !== selectedAnswerId));
      setShowCopyNotification('Ответ успешно удален');
      setTimeout(() => setShowCopyNotification(null), 2000);
    } catch (err) {
      console.error('Failed to delete answer:', err);
      setShowCopyNotification('Ошибка при удалении ответа');
      setTimeout(() => setShowCopyNotification(null), 2000);
    } finally {
      handleCloseAnswerDelete();
    }
  };

  // Автоматическая генерация slug из title
  const handleQuestionTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setQuestionFormData({
      ...questionFormData,
      title: title,
      slug: title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${NEUTRAL_COLORS.background} 0%, ${alpha(
            NEUTRAL_COLORS.background,
            0.8
          )} 100%)`,
        }}
      >
        <CircularProgress size={48} sx={{ color: NEUTRAL_COLORS.accent }} />
      </Box>
    );
  }

  if (error || !question) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/questions')}
          sx={{ mb: 2, color: NEUTRAL_COLORS.accent }}
        >
          Назад к вопросам
        </Button>
        <Alert
          severity="error"
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(NEUTRAL_COLORS.error, 0.2)}`,
          }}
        >
          {error || 'Вопрос не найден'}
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${NEUTRAL_COLORS.background} 0%, ${alpha(
          NEUTRAL_COLORS.background,
          0.8
        )} 100%)`,
        py: 4,
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        {/* Уведомления */}
        {showCopyNotification && (
          <Alert
            severity="success"
            sx={{
              position: 'fixed',
              top: 20,
              right: 20,
              zIndex: 9999,
              borderRadius: 2,
              boxShadow: 3,
            }}
            onClose={() => setShowCopyNotification(null)}
          >
            {showCopyNotification}
          </Alert>
        )}

        {/* Кнопка "Наверх" */}
        {showScrollTop && (
          <Fab
            size="medium"
            onClick={scrollToTop}
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              zIndex: 1000,
              backgroundColor: NEUTRAL_COLORS.accent,
              color: NEUTRAL_COLORS.surface,
              '&:hover': {
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.9),
              },
            }}
          >
            <ScrollTopIcon />
          </Fab>
        )}

        {/* Кнопка назад */}
        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          {/* Левая кнопка - назад к вопросам */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/questions')}
            sx={{
              color: NEUTRAL_COLORS.accent,
              '&:hover': {
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
              },
            }}
            variant="text"
          >
            Назад к вопросам
          </Button>

          {/* Правая кнопка - в профиль */}
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/profile')}
            sx={{
              color: NEUTRAL_COLORS.accent,
              '&:hover': {
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
              },
            }}
            variant="text"
          >
            Мой профиль
          </Button>
        </Box>

        {/* Карточка вопроса */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            mb: 4,
            borderRadius: 3,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
            backgroundColor: NEUTRAL_COLORS.surface,
            position: 'relative',
          }}
        >
          {/* Действия с вопросом (правый верхний угол) */}
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ 
              position: 'absolute',
              top: { xs: 16, md: 24 },
              right: { xs: 16, md: 24 },
              zIndex: 1,
            }}
          >
            <Tooltip title={isCompleted ? "Снять отметку выполнения" : "Отметить как выполненный"}>
              <IconButton
                onClick={handleToggleCompletion}
                disabled={isCompletionLoading}
                size="small"
                sx={{
                  color: isCompleted ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.textSecondary,
                  backgroundColor: alpha(NEUTRAL_COLORS.background, 0.8),
                  '&:hover': {
                    backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                  },
                }}
              >
                {isCompletionLoading ? (
                  <CircularProgress size={24} />
                ) : isCompleted ? (
                  <CheckCircleIcon />
                ) : (
                  <RadioButtonUncheckedIcon />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title={isBookmarked ? "Удалить из избранное" : "Добавить в избранное"}>
              <IconButton
                onClick={handleBookmarkToggle}
                size="small"
                sx={{
                  color: isBookmarked ? NEUTRAL_COLORS.warning : NEUTRAL_COLORS.textSecondary,
                  backgroundColor: alpha(NEUTRAL_COLORS.background, 0.8),
                  '&:hover': {
                    backgroundColor: alpha(NEUTRAL_COLORS.warning, 0.1),
                  },
                }}
              >
                {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Поделиться вопросом">
              <IconButton
                onClick={handleShareQuestion}
                size="small"
                sx={{
                  color: NEUTRAL_COLORS.textSecondary,
                  backgroundColor: alpha(NEUTRAL_COLORS.background, 0.8),
                  '&:hover': {
                    backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                  },
                }}
              >
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack spacing={4}>
            {/* Верхняя часть: статус, сложность и категория */}
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                mb: 3,
                pb: 3,
                borderBottom: `1px solid ${alpha(NEUTRAL_COLORS.border, 0.5)}`,
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              {/* Сложность */}
              <Chip
                icon={<DifficultyIcon />}
                label={`Сложность: ${question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}`}
                size="medium"
                sx={{
                  fontWeight: 700,
                  backgroundColor: alpha(getDifficultyColor(question.difficulty), 0.1),
                  color: getDifficultyColor(question.difficulty),
                  border: `1px solid ${alpha(getDifficultyColor(question.difficulty), 0.3)}`,
                  textTransform: 'capitalize',
                  fontSize: '0.95rem',
                  px: 1,
                  height: 36,
                }}
              />
              
              {/* Категория */}
              {category && (
                <Chip
                  icon={<CategoryIcon />}
                  label={`Категория: ${category.name}`}
                  size="medium"
                  sx={{
                    fontWeight: 700,
                    backgroundColor: alpha(NEUTRAL_COLORS.info, 0.1),
                    color: NEUTRAL_COLORS.info,
                    border: `1px solid ${alpha(NEUTRAL_COLORS.info, 0.3)}`,
                    fontSize: '0.95rem',
                    px: 1,
                    height: 36,
                    '& .MuiChip-icon': {
                      color: NEUTRAL_COLORS.info,
                    },
                  }}
                />
              )}
              
              {/* Статус публикации */}
              {question.is_published ? (
                <Chip
                  icon={<PublishedIcon />}
                  label="Опубликовано"
                  size="medium"
                  sx={{
                    fontWeight: 700,
                    backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                    color: NEUTRAL_COLORS.success,
                    border: `1px solid ${alpha(NEUTRAL_COLORS.success, 0.3)}`,
                    fontSize: '0.95rem',
                    px: 1,
                    height: 36,
                  }}
                />
              ) : (
                <Chip
                  icon={<DraftIcon />}
                  label="Черновик"
                  size="medium"
                  sx={{
                    fontWeight: 700,
                    backgroundColor: alpha(NEUTRAL_COLORS.secondary, 0.1),
                    color: NEUTRAL_COLORS.secondary,
                    border: `1px solid ${alpha(NEUTRAL_COLORS.secondary, 0.3)}`,
                    fontSize: '0.95rem',
                    px: 1,
                    height: 36,
                  }}
                />
              )}
            </Stack>

            {/* Содержимое вопроса с иконкой слева */}
            <Stack direction="row" spacing={3} alignItems="flex-start">
              {/* Иконка вопроса */}
              <Box sx={{ flexShrink: 0 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                    color: NEUTRAL_COLORS.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 1,
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 28 }} />
                </Box>
              </Box>

              {/* Заголовок и контент вопроса */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    color: NEUTRAL_COLORS.textPrimary,
                    letterSpacing: '-0.025em',
                    mb: 2.5,
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    lineHeight: 1.2,
                  }}
                >
                  {question.title}
                </Typography>

                {/* Контент вопроса */}
                <Box
                  sx={{
                    '& > *': {
                      mb: 2.5,
                    },
                    '& p': {
                      mb: 2.5,
                    },
                  }}
                >
                  <ContentRenderer 
                    blocks={question.content}
                  />
                </Box>

                {/* Дополнительная информация о вопросе */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 3, pt: 3, borderTop: `1px dashed ${alpha(NEUTRAL_COLORS.border, 0.3)}` }}>
                  <Typography variant="caption" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                    <HistoryIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Обновлено: {new Date(question.updated_at).toLocaleDateString()}
                  </Typography>
                  
                  <Typography variant="caption" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                    <CommentIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Решений: {answers.length}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Stack>

          {/* Кнопки управления вопросом внизу карточки (только для админов) */}
          {user?.is_admin && (
            <Box 
              sx={{ 
                mt: 4, 
                pt: 3, 
                borderTop: `1px solid ${alpha(NEUTRAL_COLORS.border, 0.5)}`,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2
              }}
            >
              <Button
                startIcon={<EditIcon />}
                onClick={handleOpenQuestionEdit}
                variant="outlined"
                sx={{
                  borderColor: NEUTRAL_COLORS.accent,
                  color: NEUTRAL_COLORS.accent,
                  '&:hover': {
                    borderColor: alpha(NEUTRAL_COLORS.accent, 0.8),
                    backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
                  },
                }}
              >
                Редактировать вопрос
              </Button>
              
              <Button
                startIcon={<DeleteIcon />}
                onClick={handleOpenQuestionDelete}
                variant="outlined"
                sx={{
                  borderColor: NEUTRAL_COLORS.error,
                  color: NEUTRAL_COLORS.error,
                  '&:hover': {
                    borderColor: alpha(NEUTRAL_COLORS.error, 0.8),
                    backgroundColor: alpha(NEUTRAL_COLORS.error, 0.04),
                  },
                }}
              >
                Удалить вопрос
              </Button>
            </Box>
          )}
        </Paper>

        {/* Секция решений */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
            backgroundColor: NEUTRAL_COLORS.surface,
          }}
        >
          <Stack spacing={3}>
            {/* Заголовок секции решений с иконкой слева */}
            <Stack direction="row" spacing={3} alignItems="center" sx={{ flexWrap: 'wrap', gap: 2 }}>
              {/* Иконка решений */}
              <Box sx={{ flexShrink: 0 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                    color: NEUTRAL_COLORS.success,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SolutionIcon sx={{ fontSize: 28 }} />
                </Box>
              </Box>

              {/* Текст заголовка */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: NEUTRAL_COLORS.textPrimary,
                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                    mb: 1,
                  }}
                >
                  Варианты решения
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: NEUTRAL_COLORS.textSecondary,
                  }}
                >
                  Подробные объяснения и подходы к решению проблемы
                </Typography>
              </Box>

              {/* Кнопка добавления ответа для админов */}
              {user?.is_admin && (
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleOpenAnswerAdd}
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: NEUTRAL_COLORS.success,
                    color: NEUTRAL_COLORS.surface,
                    '&:hover': {
                      backgroundColor: alpha(NEUTRAL_COLORS.success, 0.9),
                    },
                  }}
                >
                  Добавить решение
                </Button>
              )}
            </Stack>

            {/* Список решений */}
            {answers.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  borderRadius: 2,
                  border: `1px dashed ${NEUTRAL_COLORS.border}`,
                  backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '50%',
                    backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
                    display: 'inline-flex',
                    mb: 2,
                  }}
                >
                  <SolutionIcon
                    sx={{ fontSize: 48, color: NEUTRAL_COLORS.textSecondary }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: NEUTRAL_COLORS.textSecondary,
                    mb: 1,
                  }}
                >
                  Пока нет доступных решений
                </Typography>
              </Paper>
            ) : (
              <Box>
                <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary, mb: 2 }}>
                  Кликните на заголовок, чтобы развернуть решение.
                </Typography>
                
                {answers.map((answer, index) => (
                  <SolutionCard
                    key={answer.id}
                    answer={answer}
                    index={index}
                    isExpanded={expandedSolutions.includes(index)}
                    onToggle={() => handleSolutionToggle(index)}
                    onCopyCode={handleCopyCode}
                    isAdmin={user?.is_admin || false}
                    onEditAnswer={handleOpenAnswerEdit}
                    onDeleteAnswer={handleOpenAnswerDelete}
                  />
                ))}
              </Box>
            )}

            {/* Быстрые действия внизу */}
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ mt: 4, pt: 3, borderTop: `1px solid ${alpha(NEUTRAL_COLORS.border, 0.5)}` }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/questions')}
                variant="outlined"
              >
                Вернуться к вопросам
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Подсказки для пользователей */}
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 3,
            border: `1px dashed ${NEUTRAL_COLORS.border}`,
            backgroundColor: alpha(NEUTRAL_COLORS.info, 0.05),
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ color: NEUTRAL_COLORS.info, fontWeight: 600 }}>
              Советы по использованию платформы:
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                • Нажимайте на код, чтобы скопировать его в буфер обмена
              </Typography>
              <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                • Добавляйте понравившиеся вопросы в закладки для быстрого доступа
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Container>

      {/* Модалка редактирования вопроса */}
      <Dialog 
        open={openQuestionEditDialog} 
        onClose={handleCloseQuestionEdit} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
            maxHeight: '90vh',
            backgroundColor: NEUTRAL_COLORS.secondary,
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${NEUTRAL_COLORS.border}`,
          pb: 2,
          fontWeight: 700,
          color: NEUTRAL_COLORS.surface,
        }}>
          Редактировать вопрос
          {questionError && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(NEUTRAL_COLORS.error, 0.2)}`,
              }}
              onClose={() => setQuestionError(null)}
            >
              {questionError}
            </Alert>
          )}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Tabs 
            value={questionTab} 
            onChange={(e, v) => setQuestionTab(v)}
            sx={{ mb: 3 }}
          >
            <Tab label="Основная информация" />
            <Tab label="Содержание" />
          </Tabs>
          
          {questionTab === 0 ? (
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Название вопроса *"
                value={questionFormData.title}
                onChange={handleQuestionTitleChange}
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: NEUTRAL_COLORS.accent,
                    }
                  }
                }}
              />
              <TextField
                fullWidth
                label="URL-адрес вопроса *"
                value={questionFormData.slug}
                onChange={(e) => setQuestionFormData({ ...questionFormData, slug: e.target.value })}
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: NEUTRAL_COLORS.accent,
                    }
                  }
                }}
                helperText="URL-friendly версия названия (генерируется автоматически)"
              />
              
              {/* Категория */}
              <FormControl fullWidth size="medium">
                <InputLabel>Категория *</InputLabel>
                <Select
                  value={questionFormData.category_id}
                  label="Категория *"
                  onChange={(e) => setQuestionFormData({ ...questionFormData, category_id: e.target.value })}
                  sx={{
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: NEUTRAL_COLORS.accent,
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>Выберите категорию</em>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="medium">
                <InputLabel>Сложность</InputLabel>
                <Select
                  value={questionFormData.difficulty}
                  label="Сложность"
                  onChange={(e) => setQuestionFormData({ ...questionFormData, difficulty: e.target.value as any })}
                  sx={{
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: NEUTRAL_COLORS.accent,
                    }
                  }}
                >
                  <MenuItem value="easy">Легкий</MenuItem>
                  <MenuItem value="medium">Средний</MenuItem>
                  <MenuItem value="hard">Сложный</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          ) : (
            <ContentEditor
              content={questionContent}
              onChange={setQuestionContent}
              maxHeight="400px"
            />
          )}
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: `1px solid ${NEUTRAL_COLORS.border}`,
          pt: 2,
          px: 3,
          pb: 3
        }}>
          <Button
            variant="outlined"
            onClick={handleCloseQuestionEdit}
            sx={{
              borderWidth: 2,
              borderColor: NEUTRAL_COLORS.border,
              color: NEUTRAL_COLORS.surface,
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                borderColor: NEUTRAL_COLORS.accent,
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
              }
            }}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveQuestion}
            disabled={!questionFormData.category_id || !questionFormData.title.trim() || !questionFormData.slug.trim() || isSavingQuestion}
            startIcon={isSavingQuestion ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              backgroundColor: NEUTRAL_COLORS.success,
              color: NEUTRAL_COLORS.surface,
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: alpha(NEUTRAL_COLORS.success, 0.9),
              }
            }}
          >
            {isSavingQuestion ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модалка подтверждения удаления вопроса */}
      <Dialog 
        open={openQuestionDeleteDialog} 
        onClose={handleCloseQuestionDelete} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
            backgroundColor: NEUTRAL_COLORS.secondary,
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${NEUTRAL_COLORS.border}`,
          pb: 2,
          fontWeight: 700,
          color: NEUTRAL_COLORS.surface,
        }}>
          Удаление вопроса
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ mt:2, mb: 2, color: NEUTRAL_COLORS.surface }}>
            Вы уверены, что хотите удалить вопрос "{question?.title}"?
          </Typography>
          <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.primary }}>
            Это действие нельзя отменить. Все связанные ответы также будут удалены.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: `1px solid ${NEUTRAL_COLORS.border}`,
          pt: 2,
          px: 3,
          pb: 3
        }}>
          <Button
            variant="outlined"
            onClick={handleCloseQuestionDelete}
            sx={{
              borderWidth: 2,
              borderColor: NEUTRAL_COLORS.border,
              color: NEUTRAL_COLORS.surface,
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                borderColor: NEUTRAL_COLORS.accent,
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
              }
            }}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteQuestion}
            sx={{
              backgroundColor: NEUTRAL_COLORS.error,
              color: NEUTRAL_COLORS.surface,
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: alpha(NEUTRAL_COLORS.error, 0.9),
              }
            }}
          >
            Удалить вопрос
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модалка добавления ответа */}
      <Dialog 
        open={openAnswerAddDialog} 
        onClose={handleCloseAnswerAdd} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
            maxHeight: '90vh',
            backgroundColor: NEUTRAL_COLORS.secondary,
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${NEUTRAL_COLORS.border}`,
          pb: 2,
          fontWeight: 700,
          color: NEUTRAL_COLORS.surface,
        }}>
          Добавить новый ответ
          {answerError && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(NEUTRAL_COLORS.error, 0.2)}`,
              }}
              onClose={() => setAnswerError(null)}
            >
              {answerError}
            </Alert>
          )}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Tabs 
            value={answerTab} 
            onChange={(e, v) => setAnswerTab(v)}
            sx={{ mb: 3 }}
          >
            <Tab label="Содержание ответа" />
          </Tabs>
          
          {answerTab === 0 && (
            <ContentEditor
              content={answerContent}
              onChange={setAnswerContent}
              maxHeight="400px"
            />
          )}
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: `1px solid ${NEUTRAL_COLORS.border}`,
          pt: 2,
          px: 3,
          pb: 3
        }}>
          <Button
            variant="outlined"
            onClick={handleCloseAnswerAdd}
            sx={{
              borderWidth: 2,
              borderColor: NEUTRAL_COLORS.border,
              color: NEUTRAL_COLORS.surface,
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                borderColor: NEUTRAL_COLORS.accent,
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
              }
            }}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSaveAnswer(false)}
            disabled={answerContent.length === 0 || isSavingAnswer}
            startIcon={isSavingAnswer ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              backgroundColor: NEUTRAL_COLORS.success,
              color: NEUTRAL_COLORS.surface,
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: alpha(NEUTRAL_COLORS.success, 0.9),
              }
            }}
          >
            {isSavingAnswer ? 'Сохранение...' : 'Добавить ответ'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модалка редактирования ответа */}
      <Dialog 
        open={openAnswerEditDialog} 
        onClose={handleCloseAnswerEdit} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
            maxHeight: '90vh',
            backgroundColor: NEUTRAL_COLORS.secondary,
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${NEUTRAL_COLORS.border}`,
          pb: 2,
          fontWeight: 700,
          color: NEUTRAL_COLORS.surface,
        }}>
          Редактировать ответ
          {answerError && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(NEUTRAL_COLORS.error, 0.2)}`,
              }}
              onClose={() => setAnswerError(null)}
            >
              {answerError}
            </Alert>
          )}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Tabs 
            value={answerTab} 
            onChange={(e, v) => setAnswerTab(v)}
            sx={{ mb: 3 }}
          >
            <Tab label="Содержание ответа" />
          </Tabs>
          
          {answerTab === 0 && (
            <ContentEditor
              content={answerContent}
              onChange={setAnswerContent}
              maxHeight="400px"
            />
          )}
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: `1px solid ${NEUTRAL_COLORS.border}`,
          pt: 2,
          px: 3,
          pb: 3
        }}>
          <Button
            variant="outlined"
            onClick={handleCloseAnswerEdit}
            sx={{
              borderWidth: 2,
              borderColor: NEUTRAL_COLORS.border,
              color: NEUTRAL_COLORS.textPrimary,
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                borderColor: NEUTRAL_COLORS.accent,
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
              }
            }}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSaveAnswer(true)}
            disabled={answerContent.length === 0 || isSavingAnswer}
            startIcon={isSavingAnswer ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              backgroundColor: NEUTRAL_COLORS.success,
              color: NEUTRAL_COLORS.surface,
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: alpha(NEUTRAL_COLORS.success, 0.9),
              }
            }}
          >
            {isSavingAnswer ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модалка подтверждения удаления ответа */}
      <Dialog 
        open={openAnswerDeleteDialog} 
        onClose={handleCloseAnswerDelete} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
            backgroundColor: NEUTRAL_COLORS.secondary,
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${NEUTRAL_COLORS.border}`,
          pb: 2,
          fontWeight: 700,
          color: NEUTRAL_COLORS.surface,
        }}>
          Удаление ответа
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ mt:2, mb: 2, color: NEUTRAL_COLORS.surface }}>
            Вы уверены, что хотите удалить этот ответ?
          </Typography>
          <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.primary }}>
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: `1px solid ${NEUTRAL_COLORS.border}`,
          pt: 2,
          px: 3,
          pb: 3
        }}>
          <Button
            variant="outlined"
            onClick={handleCloseAnswerDelete}
            sx={{
              borderWidth: 2,
              borderColor: NEUTRAL_COLORS.border,
              color: NEUTRAL_COLORS.surface,
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                borderColor: NEUTRAL_COLORS.accent,
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
              }
            }}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteAnswer}
            sx={{
              backgroundColor: NEUTRAL_COLORS.error,
              color: NEUTRAL_COLORS.surface,
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: alpha(NEUTRAL_COLORS.error, 0.9),
              }
            }}
          >
            Удалить ответ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};