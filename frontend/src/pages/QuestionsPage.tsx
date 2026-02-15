import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Pagination,
  Grid,
  Chip,
  Stack,
  Paper,
  alpha,
  InputAdornment,
  IconButton,
  Divider,
  Fade,
  FormControl,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
  SwipeableDrawer,
  DialogActions,
  DialogContent,
  Dialog,
  Switch,
  FormControlLabel,
  InputLabel,
  DialogTitle,
  Tabs,
  Alert,
  Tab,
  Tooltip,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  QuestionAnswer as QuestionIcon,
  Numbers as NumbersIcon,
  Bolt as BoltIcon,
  KeyboardArrowRight as ArrowRightIcon,
  TrendingFlat as TrendingFlatIcon,
  Speed as SpeedIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  AssignmentRounded as AssignmentRoundedIcon,
  Add as AddIcon,
  Lock as LockIcon,
  Logout as LogoutIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { questionService } from '../services/questionService';
import { categoryService } from '../services/categoryService';
import { questionCompletionService } from '../services/questionCompletionService';
import { FeedbackFab } from '../components/FeedbackFab';
import type { Question, Category, ContentBlock } from '../types';
import { useAuth } from '../context/AuthContext';
import { ContentEditor } from '../components/Admin/ContentEditor';

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
  question: '#9e3fa7ff',
};

// Вспомогательная функция для меток сортировки
const getSortLabel = (sortBy: string) => {
  switch (sortBy) {
    case 'updated_at':
      return 'Дата обновления';
    case 'created_at':
      return 'Дата создания';
    case 'title':
      return 'Название';
    case 'difficulty':
      return 'Сложность';
    default:
      return sortBy;
  }
};

// Улучшенная статистическая карточка
interface EnhancedStatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  total: number;
  percentage: number;
  isActive: boolean;
  onClick: () => void;
  isCompletionFilter?: boolean;
}

const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color,
  total,
  percentage,
  isActive,
  onClick,
  isCompletionFilter = false
}) => {
  // Специальный стиль для фильтра по выполненным
  if (isCompletionFilter) {
    return (
      <Paper
        elevation={0}
        onClick={onClick}
        sx={{
          minWidth: 250,
          p: 3,
          borderRadius: 3,
          border: `2px solid ${isActive ? NEUTRAL_COLORS.success : alpha(NEUTRAL_COLORS.border, 0.3)}`,
          backgroundColor: isActive ? alpha(NEUTRAL_COLORS.success, 0.1) : alpha(NEUTRAL_COLORS.background, 0.5),
          height: '100%',
          transition: 'all 0.3s',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            borderColor: isActive ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.accent,
            backgroundColor: isActive ? alpha(NEUTRAL_COLORS.success, 0.15) : alpha(NEUTRAL_COLORS.background, 0.8),
            transform: 'translateY(-4px)',
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: '16px',
              backgroundColor: isActive ? alpha(NEUTRAL_COLORS.success, 0.2) : alpha(NEUTRAL_COLORS.success, 0.1),
              color: isActive ? NEUTRAL_COLORS.success : alpha(NEUTRAL_COLORS.success, 0.7),
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: isActive ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.textPrimary,
                fontSize: '1.1rem',
                lineHeight: 1.2,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isActive ? alpha(NEUTRAL_COLORS.success, 0.8) : NEUTRAL_COLORS.textSecondary,
                fontWeight: 500,
                display: 'block',
                mt: 0.5,
              }}
            >
              {isActive ? 'Фильтр активен' : 'Показать выполненные'}
            </Typography>
          </Box>
        </Stack>
        
        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            color: isActive ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.textSecondary,
            fontSize: '3rem',
            lineHeight: 1,
            textAlign: 'center',
            mb: 2,
          }}
        >
          {value}%
        </Typography>
        
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: alpha(NEUTRAL_COLORS.border, 0.3),
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${Math.min(percentage, 100)}%`,
                height: '100%',
                borderRadius: 3,
                backgroundColor: NEUTRAL_COLORS.success,
                transition: 'width 1s ease-out',
              }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: NEUTRAL_COLORS.textSecondary,
              fontWeight: 600,
              display: 'block',
              mt: 1,
              textAlign: 'right',
              fontSize: '0.75rem',
            }}
          >
            {percentage.toFixed(1)}% выполнено
          </Typography>
        </Box>
        
        {/* Иконка активности */}
        {isActive && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: NEUTRAL_COLORS.success,
              boxShadow: `0 0 8px ${NEUTRAL_COLORS.success}`,
            }}
          />
        )}
      </Paper>
    );
  }

  // Обычный стиль для других карточек
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        minWidth: 250,
        p: 3,
        borderRadius: 3,
        border: `2px solid ${alpha(color, isActive ? 0.6 : 0.2)}`,
        backgroundColor: alpha(color, isActive ? 0.12 : 0.05),
        height: '100%',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: `0 20px 40px ${alpha(color, 0.15)}`,
          borderColor: alpha(color, isActive ? 0.8 : 0.4),
          backgroundColor: alpha(color, isActive ? 0.16 : 0.08),
          '& .stat-glow': {
            opacity: 0.3,
          },
        },
      }}
    >
      {/* Эффект свечения */}
      <Box
        className="stat-glow"
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 100,
          height: 100,
          borderRadius: '50%',
          backgroundColor: alpha(color, 0.2),
          filter: 'blur(20px)',
          opacity: 0,
          transition: 'opacity 0.3s',
        }}
      />

      {/* Иконка и заголовок */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 52,
            height: 52,
            borderRadius: '16px',
            backgroundColor: alpha(color, isActive ? 0.25 : 0.15),
            color: color,
            flexShrink: 0,
            boxShadow: `0 8px 24px ${alpha(color, 0.2)}`,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: NEUTRAL_COLORS.textPrimary,
              fontSize: '1.1rem',
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: alpha(NEUTRAL_COLORS.textSecondary, 0.8),
              fontWeight: 500,
              display: 'block',
              mt: 0.5,
            }}
          >
            {title === 'Всего вопросов' ? 'В базе данных' : 
             title === 'Легкие' ? 'Базовый уровень' :
             title === 'Средние' ? 'Продвинутый уровень' : 'Экспертный уровень'}
          </Typography>
        </Box>
      </Stack>

      {/* Значение и проценты */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              color: color,
              fontSize: '3rem',
              lineHeight: 1,
              background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {value}
          </Typography>
          {title !== 'Всего вопросов' && total > 0 && (
            <Chip
              icon={<TrendingFlatIcon />}
              label={`${percentage.toFixed(1)}%`}
              size="small"
              sx={{
                fontWeight: 700,
                backgroundColor: alpha(color, 0.1),
                color: color,
                border: `2px solid ${alpha(color, 0.2)}`,
                fontSize: '0.75rem',
                height: 28,
                '& .MuiChip-icon': {
                  color: color,
                },
              }}
            />
          )}
        </Stack>
      </Box>

      {/* Прогресс-бар */}
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: alpha(NEUTRAL_COLORS.border, 0.3),
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${Math.min(percentage, 100)}%`,
              height: '100%',
              borderRadius: 3,
              backgroundColor: color,
              backgroundImage: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
              transition: 'width 1s ease-out',
              boxShadow: `0 2px 8px ${alpha(color, 0.3)}`,
            }}
          />
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: NEUTRAL_COLORS.textSecondary,
            fontWeight: 600,
            display: 'block',
            mt: 1,
            textAlign: 'right',
            fontSize: '0.75rem',
          }}
        >
          {title === 'Всего вопросов' ? 'Общее количество' : `${percentage.toFixed(1)}% от общего числа`}
        </Typography>
      </Box>
    </Paper>
  );
};

// Статистический блок с интерактивными фильтрами
const StatisticsSection: React.FC<{
  total: number;
  easy: number;
  medium: number;
  hard: number;
  onFilterSelect: (filter: string) => void;
  onCompletionFilterSelect: (filter: boolean | undefined) => void;
  activeFilter: string;
  activeCompletionFilter?: boolean;
  completionPercentage: number;
}> = ({ total, easy, medium, hard, onFilterSelect, onCompletionFilterSelect, activeFilter, activeCompletionFilter, completionPercentage }) => {
  const stats = [
    {
      title: 'Всего вопросов',
      value: total,
      icon: <NumbersIcon sx={{ fontSize: 28 }} />,
      color: NEUTRAL_COLORS.accent,
      filter: '',
      percentage: 100,
    },
    {
      title: 'Легкие',
      value: easy,
      icon: <SpeedIcon sx={{ fontSize: 28 }} />,
      color: NEUTRAL_COLORS.success,
      filter: 'easy',
      percentage: total > 0 ? (easy / total) * 100 : 0,
    },
    {
      title: 'Средние',
      value: medium,
      icon: <BarChartIcon sx={{ fontSize: 28 }} />,
      color: NEUTRAL_COLORS.warning,
      filter: 'medium',
      percentage: total > 0 ? (medium / total) * 100 : 0,
    },
    {
      title: 'Сложные',
      value: hard,
      icon: <TimelineIcon sx={{ fontSize: 28 }} />,
      color: NEUTRAL_COLORS.error,
      filter: 'hard',
      percentage: total > 0 ? (hard / total) * 100 : 0,
    },
    {
      title: 'Выполнено',
      value: Math.round(completionPercentage),
      icon: <CheckCircleIcon sx={{ fontSize: 28 }} />,
      color: NEUTRAL_COLORS.success,
      filter: 'completed',
      percentage: completionPercentage,
      isCompletionFilter: true,
    },
  ];

  const handleCardClick = (stat: any) => {
    if (stat.isCompletionFilter) {
      if (activeCompletionFilter === true) {
        // Если уже активен фильтр "Выполнено", сбрасываем его
        onCompletionFilterSelect(undefined);
      } else {
        // Иначе включаем фильтр "Выполнено"
        onCompletionFilterSelect(true);
      }
    } else {
      onFilterSelect(stat.filter);
    }
  };

  return (
    <Fade in={true}>
      <Box sx={{ mb: 4 }}>
        {/* Заголовок статистики */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: NEUTRAL_COLORS.textPrimary,
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2.25rem' },
                background: `linear-gradient(135deg, ${NEUTRAL_COLORS.textPrimary} 0%, ${NEUTRAL_COLORS.accent} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Статистика вопросов
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: NEUTRAL_COLORS.textSecondary,
                fontWeight: 400,
                maxWidth: '600px',
              }}
            >
              Обзор сложности и распределения вопросов
              {activeCompletionFilter !== undefined && (
                <Chip
                  label={activeCompletionFilter ? 'Только выполненные' : 'Только невыполненные'}
                  size="small"
                  sx={{
                    ml: 2,
                    backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                    color: NEUTRAL_COLORS.success,
                    fontWeight: 600,
                  }}
                />
              )}
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Chip
              label="Актуальная база вопросов"
              size="small"
              sx={{
                fontWeight: 600,
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                color: NEUTRAL_COLORS.accent,
                border: `2px solid ${alpha(NEUTRAL_COLORS.accent, 0.2)}`,
              }}
            />
          </Box>
        </Box>

        {/* Карточки статистики - теперь на всю ширину */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={6} lg={stat.isCompletionFilter ? 3 : 2.25} key={stat.title}>
              <EnhancedStatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                total={total}
                percentage={stat.percentage}
                isActive={
                  stat.isCompletionFilter 
                    ? activeCompletionFilter === true 
                    : activeFilter === stat.filter
                }
                onClick={() => handleCardClick(stat)}
                isCompletionFilter={stat.isCompletionFilter}
              />
            </Grid>
          ))}
        </Grid>

        {/* Визуализация распределения */}
        {total > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `2px solid ${alpha(NEUTRAL_COLORS.border, 0.3)}`,
              backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: NEUTRAL_COLORS.textPrimary,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              Распределение по сложности
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: 40 }}>
              {/* Легкие */}
              {easy > 0 && (
                <Box
                  sx={{
                    flex: easy,
                    height: 32,
                    borderRadius: 2,
                    backgroundColor: NEUTRAL_COLORS.success,
                    backgroundImage: `linear-gradient(90deg, ${NEUTRAL_COLORS.success} 0%, ${alpha(NEUTRAL_COLORS.success, 0.8)} 100%)`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'scaleY(1.2)',
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: NEUTRAL_COLORS.surface,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {easy} ({((easy / total) * 100).toFixed(1)}%)
                  </Typography>
                </Box>
              )}
              
              {/* Средние */}
              {medium > 0 && (
                <Box
                  sx={{
                    flex: medium,
                    height: 40,
                    borderRadius: 2,
                    backgroundColor: NEUTRAL_COLORS.warning,
                    backgroundImage: `linear-gradient(90deg, ${NEUTRAL_COLORS.warning} 0%, ${alpha(NEUTRAL_COLORS.warning, 0.8)} 100%)`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'scaleY(1.2)',
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: NEUTRAL_COLORS.surface,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {medium} ({((medium / total) * 100).toFixed(1)}%)
                  </Typography>
                </Box>
              )}
              
              {/* Сложные */}
              {hard > 0 && (
                <Box
                  sx={{
                    flex: hard,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: NEUTRAL_COLORS.error,
                    backgroundImage: `linear-gradient(90deg, ${NEUTRAL_COLORS.error} 0%, ${alpha(NEUTRAL_COLORS.error, 0.8)} 100%)`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'scaleY(1.2)',
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: NEUTRAL_COLORS.surface,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {hard} ({((hard / total) * 100).toFixed(1)}%)
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Легенда */}
            <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: NEUTRAL_COLORS.success }} />
                <Typography variant="caption" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                  Легкие
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: NEUTRAL_COLORS.warning }} />
                <Typography variant="caption" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                  Средние
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: NEUTRAL_COLORS.error }} />
                <Typography variant="caption" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                  Сложные
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        )}
      </Box>
    </Fade>
  );
};

// Стилизованная карточка вопроса (горизонтальная версия)
interface QuestionCardProps {
  question: Question;
  onClick: () => void;
  index: number;
  categories: Category[];
  onCompletionChange?: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  onClick, 
  index, 
  categories,
  onCompletionChange,
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompletionLoading, setIsCompletionLoading] = useState(false);

  // Загружаем статус выполнения при монтировании компонента
  useEffect(() => {
    questionCompletionService.isQuestionCompleted(question.id)
      .then(result => setIsCompleted(result.is_completed))
      .catch(err => console.error('Failed to check completion status:', err));
  }, [question.id]);

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

  // Получаем название категории вопроса
  const getCategoryName = (question: Question) => {
    // Сначала проверяем полный объект категории
    if (question.category?.name) {
      return question.category.name;
    }
    
    // Затем ищем в локальном списке категорий по ID
    if (question.category_id) {
      const category = categories.find(cat => cat.id === question.category_id);
      if (category) {
        return category.name;
      }
    }
    
    return null;
  };

  const handleToggleCompletion = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setIsCompletionLoading(true);
      
      if (isCompleted) {
        await questionCompletionService.unmarkQuestionComplete(question.id);
        setIsCompleted(false);
      } else {
        await questionCompletionService.markQuestionComplete(question.id);
        setIsCompleted(true);
      }
      
      // Обновляем статистику после изменения статуса
      if (onCompletionChange) {
        onCompletionChange();
      }
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    } finally {
      setIsCompletionLoading(false);
    }
  };

  const categoryName = getCategoryName(question);
  const isUserIdQuestion = question.user_id;

  return (
    <Paper
      elevation={0}
      sx={{
        cursor: 'pointer',
        borderRadius: 3,
        border: `2px solid ${NEUTRAL_COLORS.border}`,
        backgroundColor: NEUTRAL_COLORS.surface,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        mb: 2,
        width: '100%',
        '&:hover': {
          borderColor: NEUTRAL_COLORS.accent,
          boxShadow: `0 12px 32px ${alpha(NEUTRAL_COLORS.accent, 0.1)}`,
          transform: 'translateY(-3px)',
          '& .hover-indicator': {
            width: '100%',
            opacity: 1,
          },
          '& .question-title': {
            color: NEUTRAL_COLORS.accent,
          },
          '& .arrow-icon': {
            transform: 'translateX(4px)',
          },
        },
      }}
      onClick={(e) => {
      // Открываем в новой вкладке
      window.open(`/questions/${question.id}`, '_blank');
    }}
    >
      {/* Индикатор ховера */}
      <Box
        className="hover-indicator"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '0%',
          height: '4px',
          backgroundColor: NEUTRAL_COLORS.accent,
          transition: 'all 0.3s ease',
          opacity: 0,
        }}
      />

      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Левая часть - номер и заголовок */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1, minWidth: 0 }}>
          {/* Номер вопроса */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
              color: NEUTRAL_COLORS.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.25rem',
              flexShrink: 0,
            }}
          >
            {index + 1}
          </Box>

          {/* Информация о вопросе */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              className="question-title"
              variant="h6"
              sx={{
                fontWeight: 700,
                color: NEUTRAL_COLORS.textPrimary,
                mb: 1,
                fontSize: '1.125rem',
                lineHeight: 1.4,
                transition: 'color 0.2s',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {question.title}
            </Typography>

            {/* Теги и статус */}
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              {/* Сложность - на мобиле только иконка */}
              <Tooltip title={question.difficulty} arrow>
                <Chip
                  label={
                    <Box sx={{ 
                      display: { xs: 'none', sm: 'inline' },
                      textTransform: 'uppercase'
                    }}>
                      {question.difficulty}
                    </Box>
                  }
                  size="small"
                  icon={<BoltIcon />}
                  sx={{
                    fontWeight: 700,
                    backgroundColor: alpha(getDifficultyColor(question.difficulty), 0.1),
                    color: getDifficultyColor(question.difficulty),
                    border: `2px solid ${alpha(getDifficultyColor(question.difficulty), 0.2)}`,
                    fontSize: '1rem',
                    height: { xs: 30, sm: 28 },
                    width: { xs: 30, sm: 'auto' }, // Круг на мобиле
                    justifyContent: 'center',
                    '& .MuiChip-icon': {
                      color: getDifficultyColor(question.difficulty),
                      m: 0,
                      fontSize: { xs: '1.3rem !important', sm: '0.875rem !important' },
                    },
                    '& .MuiChip-label': {
                      display: { xs: 'none', sm: 'block' },
                      px: 1,
                    },
                  }}
                />
              </Tooltip>

              {/* Категория */}
              {categoryName && (
                <Tooltip title={categoryName} arrow>
                  <Chip
                    icon={<CategoryIcon />}
                    label={
                      <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        {categoryName}
                      </Box>
                    }
                    size="small"
                    sx={{
                      fontWeight: 600,
                      backgroundColor: alpha(NEUTRAL_COLORS.info, 0.1),
                      color: NEUTRAL_COLORS.info,
                      border: `2px solid ${alpha(NEUTRAL_COLORS.info, 0.2)}`,
                      fontSize: '1rem',
                      height: { xs: 30, sm: 28 },
                      width: { xs: 30, sm: 'auto' },
                      justifyContent: 'center',
                      '& .MuiChip-icon': {
                        fontSize: { xs: '1.3rem', sm: '0.875rem' },
                        color: NEUTRAL_COLORS.info,
                        m: 0,
                      },
                      '& .MuiChip-label': {
                        display: { xs: 'none', sm: 'block' },
                        px: 1,
                      },
                    }}
                  />
                </Tooltip>
              )}
              
              {/* Бейдж "Твой вопрос" */}
              {isUserIdQuestion && (
                <Tooltip title="Твой вопрос" arrow>
                  <Chip
                    icon={<PersonIcon />}
                    label={
                      <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        Твой вопрос
                      </Box>
                    }
                    size="small"
                    sx={{
                      fontWeight: 700,
                      backgroundColor: alpha(NEUTRAL_COLORS.question, 0.15),
                      color: NEUTRAL_COLORS.question,
                      border: `1px solid ${alpha(NEUTRAL_COLORS.question, 0.3)}`,
                      fontSize: '1rem',
                      height: { xs: 30, sm: 28 },
                      width: { xs: 30, sm: 'auto' },
                      justifyContent: 'center',
                      '& .MuiChip-icon': {
                        fontSize: { xs: '1.3rem', sm: '0.875rem' },
                        color: NEUTRAL_COLORS.question,
                        m: 0,
                      },
                      '& .MuiChip-label': {
                        display: { xs: 'none', sm: 'block' },
                        px: 1,
                      },
                    }}
                  />
                </Tooltip>
              )}
            </Stack>
          </Box>
        </Box>

        {/* Правая часть - кнопка выполнения и стрелка */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            ml: 2,
            flexShrink: 0,
          }}
        >
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
              <CircularProgress size={20} />
            ) : isCompleted ? (
              <CheckCircleIcon />
            ) : (
              <RadioButtonUncheckedIcon />
            )}
          </IconButton>

          <Box
            className="arrow-icon"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: NEUTRAL_COLORS.textSecondary,
              transition: 'transform 0.2s',
              flexShrink: 0,
            }}
          >
            <ArrowRightIcon />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

// Стилизованная кнопка фильтров
interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({ active, onClick, children, color }) => (
  <Button
    variant={active ? 'contained' : 'outlined'}
    onClick={onClick}
    sx={{
      textTransform: 'none',
      fontWeight: 700,
      borderRadius: 2,
      px: 2.5,
      py: 1,
      borderWidth: 2,
      borderColor: active ? (color || NEUTRAL_COLORS.accent) : NEUTRAL_COLORS.border,
      backgroundColor: active ? (color || NEUTRAL_COLORS.accent) : 'transparent',
      color: active ? NEUTRAL_COLORS.surface : (color || NEUTRAL_COLORS.textPrimary),
      fontSize: '0.875rem',
      '&:hover': {
        borderColor: color || NEUTRAL_COLORS.accent,
        backgroundColor: active 
          ? alpha(color || NEUTRAL_COLORS.accent, 0.9) 
          : alpha(color || NEUTRAL_COLORS.accent, 0.08),
        transform: 'translateY(-1px)',
      },
      transition: 'all 0.2s',
    }}
  >
    {children}
  </Button>
);

// Компонент панели фильтров для Drawer и Desktop
const FiltersPanel: React.FC<{
  search: string;
  setSearch: (value: string) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  sortDir: string;
  setSortDir: (value: string) => void;
  limit: number;
  setLimit: (value: number) => void;
  categories: Category[];
  isLoadingCategories: boolean;
  handleResetFilters: () => void;
  getSelectedCategoryName: () => string | null;
  isCompletedFilter?: boolean;
  setIsCompletedFilter?: (value: boolean | undefined) => void;
}> = ({
  search,
  setSearch,
  categoryId,
  setCategoryId,
  difficulty,
  setDifficulty,
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
  limit,
  setLimit,
  categories,
  isLoadingCategories,
  handleResetFilters,
  getSelectedCategoryName,
  isCompletedFilter,
  setIsCompletedFilter,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: `2px solid ${NEUTRAL_COLORS.border}`,
        backgroundColor: NEUTRAL_COLORS.surface,
        height: 'fit-content',
        width: '100%',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          color: NEUTRAL_COLORS.textPrimary,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <FilterIcon />
        Фильтры
      </Typography>

      <Stack spacing={3}>
        {/* Поиск */}
        <Box>
          <TextField
            fullWidth
            placeholder="Поиск вопросов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: NEUTRAL_COLORS.textSecondary }} />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearch('')}
                    sx={{ color: NEUTRAL_COLORS.textSecondary }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: NEUTRAL_COLORS.background,
                '&:hover fieldset': {
                  borderColor: NEUTRAL_COLORS.accent,
                  borderWidth: 2,
                },
                '&.Mui-focused fieldset': {
                  borderColor: NEUTRAL_COLORS.accent,
                  borderWidth: 2,
                },
              },
              '& .MuiInputBase-input': {
                color: NEUTRAL_COLORS.textPrimary,
                fontWeight: 500,
              },
            }}
          />
        </Box>

        <Divider sx={{ borderColor: alpha(NEUTRAL_COLORS.border, 0.5) }} />
        
        <Box>
          <Stack spacing={1}>            
            <FilterButton
              active={isCompletedFilter === false}
              onClick={() => setIsCompletedFilter?.(isCompletedFilter === false ? undefined : false)}
            >
              Показать невыполненные
            </FilterButton>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: alpha(NEUTRAL_COLORS.border, 0.5) }} />

        {/* Категория */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: NEUTRAL_COLORS.textPrimary,
              mb: 2,
            }}
          >
            Выберите категорию
          </Typography>
          <FormControl fullWidth size="medium">
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CategoryIcon sx={{ color: NEUTRAL_COLORS.textSecondary, fontSize: '1rem' }} />
                      <Typography sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                        Все категории
                      </Typography>
                    </Stack>
                  );
                }
                const category = categories.find(c => c.id === selected);
                if (!category) {
                  return (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CategoryIcon sx={{ color: NEUTRAL_COLORS.info, fontSize: '1rem' }} />
                      <Typography sx={{ color: NEUTRAL_COLORS.textPrimary }}>
                        Неизвестная категория
                      </Typography>
                    </Stack>
                  );
                }
                return (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CategoryIcon sx={{ color: NEUTRAL_COLORS.info, fontSize: '1rem' }} />
                    <Typography sx={{ color: NEUTRAL_COLORS.textPrimary, fontWeight: 600 }}>
                      {category.name}
                    </Typography>
                    {category.question_count && (
                      <Chip
                        label={category.question_count}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          backgroundColor: alpha(NEUTRAL_COLORS.info, 0.1),
                          color: NEUTRAL_COLORS.info,
                        }}
                      />
                    )}
                  </Stack>
                );
              }}
              sx={{
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: NEUTRAL_COLORS.accent,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: NEUTRAL_COLORS.accent,
                  borderWidth: 2,
                },
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '24px !important',
                  padding: '12px 14px',
                },
              }}
            >
              <MenuItem value="">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CategoryIcon sx={{ color: NEUTRAL_COLORS.textSecondary, fontSize: '1rem' }} />
                  <Typography sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                    Все категории
                  </Typography>
                </Stack>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CategoryIcon sx={{ color: NEUTRAL_COLORS.info, fontSize: '1rem' }} />
                      <Typography>{category.name}</Typography>
                    </Stack>
                    {category.question_count && (
                      <Chip
                        label={category.question_count}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          backgroundColor: alpha(NEUTRAL_COLORS.info, 0.1),
                          color: NEUTRAL_COLORS.info,
                        }}
                      />
                    )}
                  </Stack>
                </MenuItem>
              ))}
            </Select>
            {isLoadingCategories && (
              <CircularProgress 
                size={20} 
                sx={{ 
                  position: 'absolute', 
                  right: 40, 
                  top: '50%', 
                  transform: 'translateY(-50%)' 
                }} 
              />
            )}
          </FormControl>
        </Box>

        <Divider sx={{ borderColor: alpha(NEUTRAL_COLORS.border, 0.5) }} />

        {/* Сложность */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: NEUTRAL_COLORS.textPrimary,
              mb: 2,
            }}
          >
            Выберите сложность
          </Typography>
          <Stack spacing={1}>
            <FilterButton
              active={difficulty === 'easy'}
              onClick={() => setDifficulty('easy')}
              color={NEUTRAL_COLORS.success}
            >
              Easy
            </FilterButton>
            <FilterButton
              active={difficulty === 'medium'}
              onClick={() => setDifficulty('medium')}
              color={NEUTRAL_COLORS.warning}
            >
              Medium
            </FilterButton>
            <FilterButton
              active={difficulty === 'hard'}
              onClick={() => setDifficulty('hard')}
              color={NEUTRAL_COLORS.error}
            >
              Hard
            </FilterButton>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: alpha(NEUTRAL_COLORS.border, 0.5) }} />

        {/* Сортировка */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: NEUTRAL_COLORS.textPrimary,
              mb: 2,
            }}
          >
            Сортировка
          </Typography>
          
          <Stack spacing={2}>
            {/* Поле сортировки */}
            <FormControl fullWidth size="medium">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Typography sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                        Выберите поле для сортировки
                      </Typography>
                    );
                  }
                  return (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: NEUTRAL_COLORS.accent,
                          boxShadow: `0 0 8px ${NEUTRAL_COLORS.accent}`,
                        }}
                      />
                      <Typography sx={{ color: NEUTRAL_COLORS.textPrimary, fontWeight: 600 }}>
                        {getSortLabel(selected)}
                      </Typography>
                    </Stack>
                  );
                }}
                sx={{
                  borderRadius: 2,
                  border: `2px solid ${alpha(NEUTRAL_COLORS.accent, 0.3)}`,
                  backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.05),
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: NEUTRAL_COLORS.accent,
                    borderWidth: 2,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: NEUTRAL_COLORS.accent,
                    borderWidth: 2,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: '24px !important',
                    padding: '12px 14px',
                  },
                }}
              >
                <MenuItem value="updated_at">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: sortBy === 'updated_at' ? NEUTRAL_COLORS.accent : 'transparent',
                        border: `2px solid ${sortBy === 'updated_at' ? NEUTRAL_COLORS.accent : NEUTRAL_COLORS.border}`,
                        boxShadow: sortBy === 'updated_at' ? `0 0 6px ${NEUTRAL_COLORS.accent}` : 'none',
                      }}
                    />
                    <Typography sx={{ fontWeight: sortBy === 'updated_at' ? 700 : 400 }}>
                      По дате обновления
                    </Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="created_at">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: sortBy === 'created_at' ? NEUTRAL_COLORS.accent : 'transparent',
                        border: `2px solid ${sortBy === 'created_at' ? NEUTRAL_COLORS.accent : NEUTRAL_COLORS.border}`,
                        boxShadow: sortBy === 'created_at' ? `0 0 6px ${NEUTRAL_COLORS.accent}` : 'none',
                      }}
                    />
                    <Typography sx={{ fontWeight: sortBy === 'created_at' ? 700 : 400 }}>
                      По дате создания
                    </Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="title">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: sortBy === 'title' ? NEUTRAL_COLORS.accent : 'transparent',
                        border: `2px solid ${sortBy === 'title' ? NEUTRAL_COLORS.accent : NEUTRAL_COLORS.border}`,
                        boxShadow: sortBy === 'title' ? `0 0 6px ${NEUTRAL_COLORS.accent}` : 'none',
                      }}
                    />
                    <Typography sx={{ fontWeight: sortBy === 'title' ? 700 : 400 }}>
                      По названию
                    </Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="difficulty">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: sortBy === 'difficulty' ? NEUTRAL_COLORS.accent : 'transparent',
                        border: `2px solid ${sortBy === 'difficulty' ? NEUTRAL_COLORS.accent : NEUTRAL_COLORS.border}`,
                        boxShadow: sortBy === 'difficulty' ? `0 0 6px ${NEUTRAL_COLORS.accent}` : 'none',
                      }}
                    />
                    <Typography sx={{ fontWeight: sortBy === 'difficulty' ? 700 : 400 }}>
                      По сложности
                    </Typography>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>
            
            {/* Направление сортировки */}
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                variant={sortDir === 'asc' ? 'contained' : 'outlined'}
                onClick={() => setSortDir('asc')}
                startIcon={
                  sortDir === 'asc' ? (
                    <TrendingFlatIcon sx={{ transform: 'rotate(-90deg)' }} />
                  ) : null
                }
                sx={{
                  borderWidth: 2,
                  borderColor: sortDir === 'asc' ? NEUTRAL_COLORS.accent : NEUTRAL_COLORS.border,
                  backgroundColor: sortDir === 'asc' ? NEUTRAL_COLORS.accent : 'transparent',
                  color: sortDir === 'asc' ? NEUTRAL_COLORS.surface : NEUTRAL_COLORS.textPrimary,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: sortDir === 'asc' ? NEUTRAL_COLORS.accent : NEUTRAL_COLORS.accent,
                    backgroundColor: sortDir === 'asc' ? alpha(NEUTRAL_COLORS.accent, 0.9) : alpha(NEUTRAL_COLORS.accent, 0.08),
                  },
                }}
              >
                Возрастание
              </Button>
              <Button
                fullWidth
                variant={sortDir === 'desc' ? 'contained' : 'outlined'}
                onClick={() => setSortDir('desc')}
                startIcon={
                  sortDir === 'desc' ? (
                    <TrendingFlatIcon sx={{ transform: 'rotate(90deg)' }} />
                  ) : null
                }
                sx={{
                  borderWidth: 2,
                  borderColor: sortDir === 'desc' ? NEUTRAL_COLORS.accent : NEUTRAL_COLORS.border,
                  backgroundColor: sortDir === 'desc' ? NEUTRAL_COLORS.accent : 'transparent',
                  color: sortDir === 'desc' ? NEUTRAL_COLORS.surface : NEUTRAL_COLORS.textPrimary,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: sortDir === 'desc' ? NEUTRAL_COLORS.accent : NEUTRAL_COLORS.accent,
                    backgroundColor: sortDir === 'desc' ? alpha(NEUTRAL_COLORS.accent, 0.9) : alpha(NEUTRAL_COLORS.accent, 0.08),
                  },
                }}
              >
                Убывание
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: alpha(NEUTRAL_COLORS.border, 0.5) }} />

        {/* Количество на странице */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: NEUTRAL_COLORS.textPrimary,
              mb: 2,
            }}
          >
            Показывать на странице
          </Typography>
          
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {[5, 10, 20, 50].map((itemLimit) => (
              <Chip
                key={itemLimit}
                label={`${itemLimit}`}
                onClick={() => setLimit(itemLimit)}
                color={limit === itemLimit ? 'primary' : 'default'}
                sx={{
                  fontWeight: 700,
                  border: `2px solid ${limit === itemLimit ? NEUTRAL_COLORS.accent : NEUTRAL_COLORS.border}`,
                  backgroundColor: limit === itemLimit ? NEUTRAL_COLORS.accent : 'transparent',
                  color: limit === itemLimit ? NEUTRAL_COLORS.surface : NEUTRAL_COLORS.textPrimary,
                  '&:hover': {
                    borderColor: NEUTRAL_COLORS.accent,
                    backgroundColor: limit === itemLimit ? NEUTRAL_COLORS.accent : alpha(NEUTRAL_COLORS.accent, 0.08),
                  },
                }}
              />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ borderColor: alpha(NEUTRAL_COLORS.border, 0.5) }} />

        {/* Сброс фильтров */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={handleResetFilters}
          sx={{
            borderWidth: 2,
            borderColor: NEUTRAL_COLORS.border,
            color: NEUTRAL_COLORS.textPrimary,
            borderRadius: 2,
            py: 1.5,
            fontWeight: 700,
            fontSize: '1rem',
            '&:hover': {
              borderColor: NEUTRAL_COLORS.accent,
              backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s',
          }}
        >
          Очистить все фильтры
        </Button>
      </Stack>
    </Paper>
  );
};

export const QuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(1000));
  const isMobileFilter = useMediaQuery(theme.breakpoints.down(1000));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  
  // Пагинация
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Поиск и фильтры
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Новый фильтр по выполненным вопросам
  const [isCompletedFilter, setIsCompletedFilter] = useState<boolean | undefined>(undefined);
  
  // Сортировка
  const [sortBy, setSortBy] = useState<string>('updated_at');
  const [sortDir, setSortDir] = useState<string>('desc');
  
  const [totalCounts, setTotalCounts] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [overallPercentage, setOverallPercentage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(false);
  
  // Состояние для модалки добавления вопроса
  const [openDialog, setOpenDialog] = useState(false);
  const [contentTab, setContentTab] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    category_id: '',
  });
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Функция для загрузки статистики завершения
  const loadCompletionStats = useCallback(async () => {
    try {
      const stats = await questionCompletionService.getCompletionStats();
      setOverallPercentage(stats.overall_percentage);
    } catch (err) {
      console.error('Failed to load completion stats:', err);
    }
  }, []);

  // Функция для обновления статистики
  const refreshStats = useCallback(() => {
    loadCompletionStats();
    setRefreshKey(prev => prev + 1);
  }, [loadCompletionStats]);

  // Загружаем статистику при монтировании и при изменении refreshKey
  useEffect(() => {
    loadCompletionStats();
  }, [loadCompletionStats, refreshKey]);

  // Загрузка категорий
  const loadCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      const data = await categoryService.getCategories(1, 100, true);
      const activeCategories = data.items.filter((cat: Category) => cat.is_active);
      setCategories(activeCategories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // Дебаунс для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Загрузка вопросов
  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const actualSearch = debouncedSearch.trim();
      const pageNumber = page;

      // Всегда показываем только опубликованные вопросы
      const is_published = true;

      let data;
      if (actualSearch) {
        // При поиске загружаем все вопросы и фильтруем локально
        data = await questionService.getQuestions(
          pageNumber,
          limit,
          is_published,
          difficulty || undefined,
          sortBy,
          sortDir,
          categoryId || undefined,
          true,
          isCompletedFilter,
        );
        const filtered = data.items.filter((q) =>
          q.title.toLowerCase().includes(actualSearch.toLowerCase())
        );
        setQuestions(filtered);
        setTotal(filtered.length);

        setTotalCounts({
          easy: filtered.filter((q) => q.difficulty === 'easy').length,
          medium: filtered.filter((q) => q.difficulty === 'medium').length,
          hard: filtered.filter((q) => q.difficulty === 'hard').length,
        });
      } else {
        // Без поиска используем пагинацию
        data = await questionService.getQuestions(
          pageNumber,
          limit,
          is_published,
          difficulty || undefined,
          sortBy,
          sortDir,
          categoryId || undefined,
          true,
          isCompletedFilter,
        );
        setQuestions(data.items);
        setTotal(data.total);

        // Загружаем статистику
        const statsData = await questionService.getQuestions(
          1,
          1000000,
          is_published,
          difficulty || undefined,
          sortBy,
          sortDir,
          categoryId || undefined,
          true,
          isCompletedFilter,
        );
        setTotalCounts({
          easy: statsData.items.filter((q) => q.difficulty === 'easy').length,
          medium: statsData.items.filter((q) => q.difficulty === 'medium').length,
          hard: statsData.items.filter((q) => q.difficulty === 'hard').length,
        });
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, difficulty, categoryId, debouncedSearch, sortBy, sortDir, isCompletedFilter]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    if (debouncedSearch) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      setFilteredQuestions(questions.slice(startIndex, endIndex));
    } else {
      setFilteredQuestions(questions);
    }
  }, [questions, page, debouncedSearch, limit]);

  // Обработчик для фильтра по выполненным вопросам
  const handleCompletionFilterSelect = useCallback((filter: boolean | undefined) => {
    setIsCompletedFilter(filter);
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setDifficulty('');
    setCategoryId('');
    setIsCompletedFilter(undefined);
    setPage(1);
    setSortBy('updated_at');
    setSortDir('desc');
  }, []);

  const handleStatFilterSelect = (filter: string) => {
    if (filter === '') {
      setDifficulty('');
    } else {
      setDifficulty(filter);
    }
    setPage(1);
  };

  // Получаем название выбранной категории для отображения
  const getSelectedCategoryName = () => {
    if (!categoryId) return null;
    const category = categories.find(c => c.id === categoryId);
    return category?.name || null;
  };

  const totalPages = Math.ceil(total / limit);

  // Обработчики для модалки добавления вопроса
  const handleOpenDialog = () => {
    if (user?.is_admin) {
      setOpenDialog(true);
      setFormData({
        title: '',
        slug: '',
        difficulty: 'easy',
        is_published: false,
        category_id: '',
      });
      setContent([]);
      setContentTab(0);
      setDialogError(null);
    } else {
      setIsAddButtonDisabled(true);
      setTimeout(() => {
        setIsAddButtonDisabled(false);
      }, 3000);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      title: '',
      slug: '',
      difficulty: 'easy',
      is_published: false,
      category_id: '',
    });
    setContent([]);
    setDialogError(null);
  };

  const handleSave = async () => {
    try {
      setDialogError(null);
      setIsSaving(true);

      if (!formData.category_id) {
        setDialogError('Пожалуйста, выберите категорию');
        setIsSaving(false);
        return;
      }

      if (!formData.title.trim()) {
        setDialogError('Название вопроса обязательно');
        setIsSaving(false);
        return;
      }

      if (!formData.slug.trim()) {
        setDialogError('URL-адрес вопроса обязателен');
        setIsSaving(false);
        return;
      }

      const questionData = {
        title: formData.title,
        slug: formData.slug,
        difficulty: formData.difficulty,
        is_published: true,
        content: content,
        category_id: formData.category_id,
      };

      await questionService.createQuestion(questionData);
      
      handleCloseDialog();
      loadQuestions(); // Перезагружаем вопросы
      refreshStats(); // Обновляем статистику
    } catch (err: any) {
      setDialogError(err.response?.data?.detail || 'Не удалось сохранить вопрос');
    } finally {
      setIsSaving(false);
    }
  };

  // Автоматическая генерация slug из title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title: title,
      slug: title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    });
  };

  // Обработчик открытия/закрытия Drawer
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${NEUTRAL_COLORS.background} 0%, ${alpha(
          NEUTRAL_COLORS.background,
          0.8
        )} 100%)`,
      }}
    >
      {/* AppBar Header */}
      <Box sx={{ 
        position: 'sticky', 
        zIndex: 1200, 
        mb: 2, 
      }}>
        <Fade in timeout={400}>
          <AppBar 
            position="static" 
            elevation={0}
            sx={{ 
              top: 0,
              backgroundColor: alpha(NEUTRAL_COLORS.surface, 0.95),
              backdropFilter: 'blur(12px)',
              borderBottom: `1px solid ${NEUTRAL_COLORS.border}`,
              transition: 'all 0.3s ease',
            }}
          >
            <Container maxWidth="xl">
              <Toolbar sx={{ 
                px: { xs: 1, sm: 2 },
                py: 1.5,
                minHeight: '64px !important'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    flexGrow: 1,
                    fontWeight: 900,
                    color: NEUTRAL_COLORS.textPrimary,
                    fontSize: '1.45rem',
                    cursor: 'pointer',
                    letterSpacing: '-0.025em',
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': { 
                      color: NEUTRAL_COLORS.accent,
                      opacity: 0.9 
                    }
                  }}
                  onClick={() => navigate('/')}
                >
                  Interview<span style={{ color: NEUTRAL_COLORS.accent }}>Box</span>
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {user?.is_admin && !isMobile && (
                    <Button
                      variant="outlined"
                      startIcon={<MapIcon />}
                      onClick={() => navigate('/roadmap')}
                      sx={{
                        borderColor: alpha(NEUTRAL_COLORS.accent, 0.5),
                        color: NEUTRAL_COLORS.accent,
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.08),
                          borderColor: NEUTRAL_COLORS.accent,
                        }
                      }}
                    >
                      Дорожные карты
                    </Button>
                  )}
                  {user?.is_admin && (
                    <Chip 
                      label="Admin"
                      onClick={() => navigate('/admin')}
                      size="medium"
                      sx={{ 
                        fontWeight: 600,
                        backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                        color: NEUTRAL_COLORS.success,
                      }}
                    />
                  )}
                  <IconButton
                    onClick={async () => {
                      await logout();
                      navigate('/login');
                    }}
                    size="medium"
                    sx={{
                      backgroundColor: alpha(NEUTRAL_COLORS.error, 0.1),
                      color: NEUTRAL_COLORS.error,
                      '&:hover': {
                        backgroundColor: alpha(NEUTRAL_COLORS.error, 0.2),
                      },
                      width: 40,
                      height: 40
                    }}
                  >
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Toolbar>
            </Container>
          </AppBar>
        </Fade>
      </Box>

      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Hero Section */}
        <Box sx={{ mb: 6, textAlign: 'center', position: 'relative' }}>
          {/* Кнопка назад в главное меню */}
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              borderRadius: 3,
              borderWidth: 2,
              borderColor: alpha(NEUTRAL_COLORS.accent, 0.3),
              color: NEUTRAL_COLORS.accent,
              fontWeight: 600,
              px: 3,
              py: 1.5,
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 1,
              '&:hover': {
                borderColor: NEUTRAL_COLORS.accent,
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
                transform: 'translateY(-50%) translateX(-4px)',
                boxShadow: `0 8px 24px ${alpha(NEUTRAL_COLORS.accent, 0.1)}`,
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {isMobile ? <AssignmentRoundedIcon /> : 'В главное меню'}
          </Button>

          {/* Мобильная кнопка назад */}
          <IconButton
            onClick={() => navigate('/')}
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              display: { xs: 'flex', sm: 'none' },
              color: NEUTRAL_COLORS.accent,
              backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
              '&:hover': {
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.2),
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          {/* Правая кнопка - в профиль */}
          <Button
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/profile')}
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              borderRadius: 3,
              borderWidth: 2,
              borderColor: alpha(NEUTRAL_COLORS.accent, 0.3),
              color: NEUTRAL_COLORS.accent,
              fontWeight: 600,
              px: 3,
              py: 1.5,
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 1,
              '&:hover': {
                borderColor: NEUTRAL_COLORS.accent,
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
                transform: 'translateY(-50%) translateX(4px)',
                boxShadow: `0 8px 24px ${alpha(NEUTRAL_COLORS.accent, 0.1)}`,
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {isMobile ? <PersonIcon /> : 'Мой профиль'}
          </Button>

          {/* Мобильная кнопка профиля */}
          <IconButton
            onClick={() => navigate('/profile')}
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              display: { xs: 'flex', sm: 'none' },
              color: NEUTRAL_COLORS.accent,
              backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
              '&:hover': {
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.2),
              },
            }}
          >
            <PersonIcon />
          </IconButton>

          {/* Основная иконка с интерактивными элементами */}
          <Box
            sx={{
              position: 'relative',
              display: 'inline-block',
              cursor: 'pointer',
              mb: 3,
              '&:hover .icon-wrapper': {
                transform: 'rotate(10deg) scale(1.05)',
              },
              '&:hover .question-count': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            }}
          >
            <Box
              className="icon-wrapper"
              sx={{
                display: 'inline-flex',
                p: 3,
                borderRadius: '24px',
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                color: NEUTRAL_COLORS.accent,
                boxShadow: `0 8px 32px ${alpha(NEUTRAL_COLORS.accent, 0.2)}`,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `conic-gradient(from 0deg, ${alpha(NEUTRAL_COLORS.accent, 0.3)} 0%, transparent 30%)`,
                  opacity: 0,
                  transition: 'opacity 0.3s',
                },
                '&:hover:before': {
                  opacity: 1,
                },
              }}
              onClick={() => {
                handleResetFilters();
                setLimit(10);
                setPage(1);
              }}
            >
              <QuestionIcon sx={{ fontSize: 56 }} />
            </Box>

            {/* Плавающий счетчик вопросов */}
            <Box
              className="question-count"
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: NEUTRAL_COLORS.success,
                color: NEUTRAL_COLORS.surface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.125rem',
                boxShadow: `0 4px 16px ${alpha(NEUTRAL_COLORS.success, 0.4)}`,
                opacity: 0.8,
                transform: 'translateY(10px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {total}
            </Box>

            {/* Индикатор сложности */}
            <Box
              sx={{
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: totalCounts.easy > 0 ? NEUTRAL_COLORS.success : alpha(NEUTRAL_COLORS.success, 0.3),
                  transition: 'all 0.3s',
                }}
              />
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: totalCounts.medium > 0 ? NEUTRAL_COLORS.warning : alpha(NEUTRAL_COLORS.warning, 0.3),
                  transition: 'all 0.3s',
                }}
              />
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: totalCounts.hard > 0 ? NEUTRAL_COLORS.error : alpha(NEUTRAL_COLORS.error, 0.3),
                  transition: 'all 0.3s',
                }}
              />
            </Box>
          </Box>

          {/* Заголовок с интерактивной статистикой */}
          <Box
            sx={{
              position: 'relative',
              display: 'inline-block',
              mb: 2,
              cursor: 'pointer',
              '&:hover .progress-bar': {
                width: '100%',
              },
            }}
            onClick={() => {
              const statsElement = document.getElementById('statistics-section');
              if (statsElement) {
                statsElement.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                color: NEUTRAL_COLORS.textPrimary,
                letterSpacing: '-0.025em',
                mb: 3,
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                background: `linear-gradient(135deg, ${NEUTRAL_COLORS.textPrimary} 0%, ${NEUTRAL_COLORS.accent} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                position: 'relative',
                display: 'inline-block',
                mr: 2,
                ml: 5
              }}
            >
              InterviewBox
              <Box
                component="span"
                sx={{
                  fontSize: { xs: '0.7rem', sm: '1.0rem' },
                  fontWeight: 700,
                  marginLeft: '10px',
                  padding: { xs: '2px 10px', sm: '3px 12px' },
                  borderRadius: '12px',
                  verticalAlign: 'middle',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      boxShadow: `0 0 0 0 ${NEUTRAL_COLORS.accent}80`
                    },
                    '70%': {
                      boxShadow: `0 0 0 6px ${NEUTRAL_COLORS.accent}00`
                    },
                    '100%': {
                      boxShadow: `0 0 0 0 ${NEUTRAL_COLORS.accent}00`
                    }
                  }
                }}
              >
                BETA
              </Box>
              
              {/* Подчеркивание-прогресс бар */}
              <Box
                className="progress-bar"
                sx={{
                  position: 'absolute',
                  bottom: -10,
                  left: 0,
                  width: '60%',
                  height: 4,
                  borderRadius: 2,
                  background: `linear-gradient(90deg, ${NEUTRAL_COLORS.accent} 0%, ${NEUTRAL_COLORS.success} 100%)`,
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </Typography>
          </Box>

          {/* Описание с кнопками быстрого доступа */}
          <Box sx={{ position: 'relative', maxWidth: '600px', mx: 'auto' }}>
            {!isMobileFilter && (
            <Typography
              variant="h6"
              sx={{
                color: NEUTRAL_COLORS.textSecondary,
                fontWeight: 400,
                lineHeight: 1.6,
                fontSize: { xs: '1rem', sm: '1.125rem' },
                mb: 3,
              }}
            >
              Совершенствуйте свои навыки прохождения собеседований с помощью нашей коллекции
            </Typography>
            )}
            {/* Быстрые действия */}
            {!isMobileFilter && (
            <Stack direction="row" alignItems="center" justifyContent="center" flexWrap="wrap" gap={1}>
              <Button
                variant="contained"
                startIcon={<BoltIcon />}
                onClick={() => {
                  setDifficulty('easy');
                  setPage(1);
                }}
                sx={{
                  backgroundColor: NEUTRAL_COLORS.success,
                  color: NEUTRAL_COLORS.surface,
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: alpha(NEUTRAL_COLORS.success, 0.9),
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Начни с легких вопросов
              </Button>
              
              <Typography
                variant="body2"
                sx={{
                  px: 2,
                  fontWeight: 800,
                  color: NEUTRAL_COLORS.accent,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  position: 'relative',
                  '&:before, &:after': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    width: 12,
                    height: 2,
                    backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.3),
                    borderRadius: 1,
                  },
                  '&:before': {
                    left: 4,
                  },
                  '&:after': {
                    right: 4,
                  },
                }}
              >
                или
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={() => {
                  const searchInput = document.querySelector('input[placeholder="Поиск вопросов..."]');
                  if (searchInput) {
                    (searchInput as HTMLElement).focus();
                  }
                }}
                sx={{
                  borderColor: NEUTRAL_COLORS.accent,
                  color: NEUTRAL_COLORS.accent,
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  '&:hover': {
                    borderColor: NEUTRAL_COLORS.accent,
                    backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Найди то, что нужно
              </Button>
            </Stack>
            )}
            {/* Индикатор активности фильтров */}
            {(difficulty || categoryId || debouncedSearch || isCompletedFilter !== undefined || sortBy !== 'updated_at' || sortDir !== 'desc' || limit !== 10) && (
              <Fade in>
                <Paper
                  elevation={0}
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: 2,
                    border: `1px dashed ${alpha(NEUTRAL_COLORS.accent, 0.3)}`,
                    backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.05),
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <FilterIcon fontSize="small" sx={{ color: NEUTRAL_COLORS.accent }} />
                  <Typography variant="caption" sx={{ color: NEUTRAL_COLORS.accent, fontWeight: 600 }}>
                    Есть активные фильтры
                  </Typography>
                  <Chip
                    label="Смотреть"
                    size="small"
                    onClick={() => {
                      const filtersElement = document.querySelector('.filters-column');
                      if (filtersElement) {
                        filtersElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                      color: NEUTRAL_COLORS.accent,
                    }}
                  />
                </Paper>
              </Fade>
            )}
          </Box>
        </Box>

        {/* Улучшенная статистика */}
        {!isMobileFilter && (
        <div id="statistics-section">
          <StatisticsSection
            total={total}
            easy={totalCounts.easy}
            medium={totalCounts.medium}
            hard={totalCounts.hard}
            onFilterSelect={handleStatFilterSelect}
            onCompletionFilterSelect={handleCompletionFilterSelect}
            activeFilter={difficulty}
            activeCompletionFilter={isCompletedFilter}
            completionPercentage={overallPercentage}
          />
        </div>
        )}
        {/* Drawer для мобильных фильтров */}
        <SwipeableDrawer
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onOpen={() => setMobileOpen(true)}
          disableSwipeToOpen={false}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: '85%',
              maxWidth: 350,
              p: 3,
              backgroundColor: NEUTRAL_COLORS.background,
            },
          }}
        >
          <FiltersPanel
            search={search}
            setSearch={setSearch}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortDir={sortDir}
            setSortDir={setSortDir}
            limit={limit}
            setLimit={setLimit}
            categories={categories}
            isLoadingCategories={isLoadingCategories}
            handleResetFilters={handleResetFilters}
            getSelectedCategoryName={getSelectedCategoryName}
            isCompletedFilter={isCompletedFilter}
            setIsCompletedFilter={setIsCompletedFilter}
          />
        </SwipeableDrawer>

        {/* Основной контент - новая структура */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Левая колонка - фильтры (фиксированная ширина) */}
          {!isMobileFilter && (
            <Box className="filters-column" sx={{ width: 320, flexShrink: 0 }}>
              <FiltersPanel
                search={search}
                setSearch={setSearch}
                categoryId={categoryId}
                setCategoryId={setCategoryId}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortDir={sortDir}
                setSortDir={setSortDir}
                limit={limit}
                setLimit={setLimit}
                categories={categories}
                isLoadingCategories={isLoadingCategories}
                handleResetFilters={handleResetFilters}
                getSelectedCategoryName={getSelectedCategoryName}
                isCompletedFilter={isCompletedFilter}
                setIsCompletedFilter={setIsCompletedFilter}
              />
            </Box>
          )}

          {/* Правая колонка - вопросы (растягивается до фильтров) */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Кнопка открытия фильтров на мобильных */}
            {isMobileFilter && (
              <Box sx={{ mb: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={handleDrawerToggle}
                  sx={{
                    borderWidth: 2,
                    borderColor: NEUTRAL_COLORS.accent,
                    color: NEUTRAL_COLORS.accent,
                    fontWeight: 700,
                    py: 1.5,
                    fontSize: '1rem',
                    borderRadius: 3,
                    '&:hover': {
                      backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.08),
                    },
                  }}
                >
                  Открыть фильтры
                </Button>
              </Box>
            )}

            {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 12 }}>
                <CircularProgress size={64} sx={{ color: NEUTRAL_COLORS.accent }} />
              </Box>
            ) : filteredQuestions.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 8,
                  borderRadius: 3,
                  border: `2px solid ${alpha(NEUTRAL_COLORS.border, 0.5)}`,
                  backgroundColor: NEUTRAL_COLORS.surface,
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    borderRadius: '50%',
                    backgroundColor: alpha(NEUTRAL_COLORS.background, 0.8),
                    display: 'inline-flex',
                    mb: 3,
                  }}
                >
                  <QuestionIcon sx={{ fontSize: 64, color: NEUTRAL_COLORS.textSecondary }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: NEUTRAL_COLORS.textSecondary,
                    mb: 2,
                    fontWeight: 700,
                  }}
                >
                  {debouncedSearch ? 'По вашему запросу ничего не найдено' : 'Вопросов пока нет'}
                </Typography>
                {debouncedSearch && (
                  <Button
                    variant="contained"
                    onClick={handleResetFilters}
                    sx={{
                      backgroundColor: NEUTRAL_COLORS.accent,
                      color: NEUTRAL_COLORS.surface,
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
                      fontSize: '1rem',
                      '&:hover': {
                        backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.9),
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    Очистить поиск
                  </Button>
                )}
              </Paper>
            ) : (
              <>
                {/* Заголовок результатов - в одну линию с кнопкой */}
                <Box sx={{ 
                  mb: 4, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  {/* Левая часть - заголовок и кнопка в одной строке */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        color: NEUTRAL_COLORS.textPrimary,
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                      }}
                    >
                      {total} Вопрос{total !== 1 ? (total > 1 && total < 5 ? 'а' : 'ов') : ''}
                    </Typography>
                    
                    {/* Кнопка добавления вопроса */}
                    {user?.is_admin && (
                    <Button
                      variant={user?.is_admin ? "contained" : "outlined"}
                      startIcon={user?.is_admin ? <AddIcon /> : <LockIcon />}
                      onClick={handleOpenDialog}
                      disabled={isAddButtonDisabled && !user?.is_admin}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        fontSize: '0.875rem',
                        transition: 'all 0.3s ease',
                        minWidth: { xs: 'auto', sm: 180 },
                        ...(user?.is_admin ? {
                          backgroundColor: NEUTRAL_COLORS.success,
                          color: NEUTRAL_COLORS.surface,
                          boxShadow: `0 4px 12px ${alpha(NEUTRAL_COLORS.success, 0.3)}`,
                          '&:hover': {
                            backgroundColor: alpha(NEUTRAL_COLORS.success, 0.9),
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 20px ${alpha(NEUTRAL_COLORS.success, 0.4)}`,
                          }
                        } : {
                          borderColor: NEUTRAL_COLORS.border,
                          color: NEUTRAL_COLORS.textSecondary,
                          backgroundColor: alpha(NEUTRAL_COLORS.background, 0.8),
                          backdropFilter: 'blur(8px)',
                          '&:hover': {
                            borderColor: NEUTRAL_COLORS.accent,
                            backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.05),
                          },
                          ...(isAddButtonDisabled && {
                            borderColor: NEUTRAL_COLORS.success,
                            color: NEUTRAL_COLORS.success,
                            backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                          })
                        })
                      }}
                    >
                      {user?.is_admin ? 'Вопрос' : (isAddButtonDisabled ? 'Скоро будет доступно!' : 'Вопрос')}
                    </Button>
                    )}
                  </Box>
                </Box>

                {/* Активные фильтры - отдельный блок под заголовком */}
                {(difficulty || categoryId || debouncedSearch || isCompletedFilter !== undefined || sortBy !== 'updated_at' || sortDir !== 'desc' || limit !== 10) && (
                  <Stack direction="row" spacing={1} sx={{ mb: 3 }} flexWrap="wrap" gap={1}>
                    {difficulty && (
                      <Chip
                        label={`Сложность: ${difficulty}`}
                        size="small"
                        onDelete={() => setDifficulty('')}
                        sx={{
                          fontWeight: 700,
                          backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                          color: NEUTRAL_COLORS.accent,
                          border: `2px solid ${alpha(NEUTRAL_COLORS.accent, 0.3)}`,
                          fontSize: '0.875rem',
                        }}
                      />
                    )}
                    {categoryId && (
                      <Chip
                        label={`Категория: ${getSelectedCategoryName() || 'Неизвестно'}`}
                        size="small"
                        onDelete={() => setCategoryId('')}
                        icon={<CategoryIcon />}
                        sx={{
                          fontWeight: 700,
                          backgroundColor: alpha(NEUTRAL_COLORS.info, 0.1),
                          color: NEUTRAL_COLORS.info,
                          border: `2px solid ${alpha(NEUTRAL_COLORS.info, 0.3)}`,
                          fontSize: '0.875rem',
                        }}
                      />
                    )}
                    {debouncedSearch && (
                      <Chip
                        label={`Поиск: "${debouncedSearch}"`}
                        size="small"
                        onDelete={() => {
                          setSearch('');
                          setDebouncedSearch('');
                        }}
                        sx={{
                          fontWeight: 700,
                          backgroundColor: alpha(NEUTRAL_COLORS.warning, 0.1),
                          color: NEUTRAL_COLORS.warning,
                          border: `2px solid ${alpha(NEUTRAL_COLORS.warning, 0.3)}`,
                          fontSize: '0.875rem',
                        }}
                      />
                    )}
                    {isCompletedFilter !== undefined && (
                      <Chip
                        label={`Выполнено: ${isCompletedFilter ? 'да' : 'нет'}`}
                        size="small"
                        onDelete={() => setIsCompletedFilter(undefined)}
                        icon={isCompletedFilter ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                        sx={{
                          fontWeight: 700,
                          backgroundColor: isCompletedFilter 
                            ? alpha(NEUTRAL_COLORS.success, 0.1) 
                            : alpha(NEUTRAL_COLORS.warning, 0.1),
                          color: isCompletedFilter ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.warning,
                          border: `2px solid ${isCompletedFilter 
                            ? alpha(NEUTRAL_COLORS.success, 0.3) 
                            : alpha(NEUTRAL_COLORS.warning, 0.3)}`,
                          fontSize: '0.875rem',
                        }}
                      />
                    )}
                    {sortBy !== 'updated_at' && (
                      <Chip
                        label={`Сортировка: ${getSortLabel(sortBy)}`}
                        size="small"
                        onDelete={() => setSortBy('updated_at')}
                        sx={{
                          fontWeight: 700,
                          backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                          color: NEUTRAL_COLORS.success,
                          border: `2px solid ${alpha(NEUTRAL_COLORS.success, 0.3)}`,
                          fontSize: '0.875rem',
                        }}
                      />
                    )}
                    {limit !== 10 && (
                      <Chip
                        label={`На странице: ${limit}`}
                        size="small"
                        onDelete={() => setLimit(10)}
                        sx={{
                          fontWeight: 700,
                          backgroundColor: alpha(NEUTRAL_COLORS.warning, 0.1),
                          color: NEUTRAL_COLORS.warning,
                          border: `2px solid ${alpha(NEUTRAL_COLORS.warning, 0.3)}`,
                          fontSize: '0.875rem',
                        }}
                      />
                    )}
                  </Stack>
                )}

                {/* Список вопросов (вертикальный) */}
                <Box sx={{ mb: 4 }}>
                  {filteredQuestions.map((question, index) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      onClick={() => navigate(`/questions/${question.id}`)}
                      index={(page - 1) * limit + index}
                      categories={categories}
                      onCompletionChange={refreshStats}
                      currentUserId={user?.id || undefined} // Передаем ID пользователя
                    />
                  ))}
                </Box>

                {/* Пагинация */}
                {totalPages > 1 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: `2px solid ${NEUTRAL_COLORS.border}`,
                      backgroundColor: NEUTRAL_COLORS.surface,
                      width: '100%',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                        shape="rounded"
                        size="large"
                        sx={{
                          '& .MuiPaginationItem-root': {
                            fontWeight: 600,
                            fontSize: '1rem',
                            color: NEUTRAL_COLORS.textSecondary,
                            border: `2px solid ${NEUTRAL_COLORS.border}`,
                            minWidth: 44,
                            height: 44,
                            '&:hover': {
                              backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.08),
                              borderColor: NEUTRAL_COLORS.accent,
                              color: NEUTRAL_COLORS.accent,
                            },
                            '&.Mui-selected': {
                              backgroundColor: NEUTRAL_COLORS.accent,
                              color: NEUTRAL_COLORS.surface,
                              borderColor: NEUTRAL_COLORS.accent,
                              '&:hover': {
                                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.9),
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                )}
              </>
            )}
          </Box>
        </Box>
      </Container>

      {/* Модалка добавления вопроса (по аналогии с админкой) */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          Создать новый вопрос
          {dialogError && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(NEUTRAL_COLORS.error, 0.2)}`,
              }}
              onClose={() => setDialogError(null)}
            >
              {dialogError}
            </Alert>
          )}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Tabs 
            value={contentTab} 
            onChange={(e, v) => setContentTab(v)}
            sx={{ mb: 3 }}
          >
            <Tab label="Основная информация" />
            <Tab label="Содержание" />
          </Tabs>
          
          {contentTab === 0 ? (
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Название вопроса *"
                value={formData.title}
                onChange={handleTitleChange}
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
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
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
                  value={formData.category_id}
                  label="Категория *"
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  disabled={isLoadingCategories}
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
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {isLoadingCategories && (
                  <CircularProgress 
                    size={20} 
                    sx={{ 
                      position: 'absolute', 
                      right: 40, 
                      top: '50%', 
                      transform: 'translateY(-50%)' 
                    }} 
                  />
                )}
              </FormControl>

              <FormControl fullWidth size="medium">
                <InputLabel>Сложность</InputLabel>
                <Select
                  value={formData.difficulty}
                  label="Сложность"
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
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
              content={content}
              onChange={setContent}
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
            onClick={handleCloseDialog}
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
            onClick={handleSave}
            disabled={!formData.category_id || !formData.title.trim() || !formData.slug.trim() || isSaving}
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
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
            {isSaving ? 'Сохранение...' : 'Создать вопрос'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Плавающая кнопка обратной связи */}
      <FeedbackFab />
    </Box>
  );
};