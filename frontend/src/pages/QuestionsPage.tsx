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
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  QuestionAnswer as QuestionIcon,
  TrendingUp as DifficultyIcon,
  Numbers as NumbersIcon,
  CheckCircle as PublishedIcon,
  RadioButtonUnchecked as DraftIcon,
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
} from '@mui/icons-material';
import { questionService } from '../services/questionService';
import { categoryService } from '../services/categoryService';
import type { Question, Category } from '../types';

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

const ITEMS_PER_PAGE = 10;

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
}

const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color,
  total,
  percentage,
  isActive,
  onClick
}) => {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
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
  activeFilter: string;
}> = ({ total, easy, medium, hard, onFilterSelect, activeFilter }) => {
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
  ];

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
            <Grid item xs={12} sm={6} lg={3} key={stat.title}>
              <EnhancedStatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                total={total}
                percentage={stat.percentage}
                isActive={activeFilter === stat.filter}
                onClick={() => onFilterSelect(stat.filter)}
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
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick, index, categories }) => {
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

  const categoryName = getCategoryName(question);

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
      onClick={onClick}
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
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              {/* Сложность */}
              <Chip
                label={question.difficulty}
                size="small"
                icon={<BoltIcon sx={{ fontSize: '0.875rem !important' }} />}
                sx={{
                  fontWeight: 700,
                  backgroundColor: alpha(getDifficultyColor(question.difficulty), 0.1),
                  color: getDifficultyColor(question.difficulty),
                  border: `2px solid ${alpha(getDifficultyColor(question.difficulty), 0.2)}`,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  height: 28,
                  '& .MuiChip-icon': {
                    color: getDifficultyColor(question.difficulty),
                    ml: 0.5,
                  },
                }}
              />

              {/* Категория */}
              {categoryName && (
                <Chip
                  icon={<CategoryIcon />}
                  label={categoryName}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    backgroundColor: alpha(NEUTRAL_COLORS.info, 0.1),
                    color: NEUTRAL_COLORS.info,
                    border: `2px solid ${alpha(NEUTRAL_COLORS.info, 0.2)}`,
                    fontSize: '0.75rem',
                    height: 28,
                    '& .MuiChip-icon': {
                      fontSize: '0.875rem',
                      color: NEUTRAL_COLORS.info,
                      ml: 0.5,
                    },
                  }}
                />
              )}
            </Stack>
          </Box>
        </Box>

        {/* Правая часть - стрелка */}
        <Box
          className="arrow-icon"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: NEUTRAL_COLORS.textSecondary,
            transition: 'transform 0.2s',
            ml: 2,
            flexShrink: 0,
          }}
        >
          <ArrowRightIcon />
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

export const QuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [totalCounts, setTotalCounts] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });

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
          1,
          1000,
          is_published,
          difficulty || undefined,
          'updated_at',
          'desc',
          categoryId || undefined,
          true,
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
          ITEMS_PER_PAGE,
          is_published,
          difficulty || undefined,
          'updated_at',
          'desc',
          categoryId || undefined,
          true,
        );
        setQuestions(data.items);
        setTotal(data.total);

        // Загружаем статистику
        const statsData = await questionService.getQuestions(
          1,
          1000,
          is_published,
          difficulty || undefined,
          'updated_at',
          'desc',
          categoryId || undefined,
          true,
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
  }, [page, difficulty, categoryId, debouncedSearch]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    if (debouncedSearch) {
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      setFilteredQuestions(questions.slice(startIndex, endIndex));
    } else {
      setFilteredQuestions(questions);
    }
  }, [questions, page, debouncedSearch]);

  const handleResetFilters = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setDifficulty('');
    setCategoryId('');
    setPage(1);
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

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${NEUTRAL_COLORS.background} 0%, ${alpha(
          NEUTRAL_COLORS.background,
          0.8
        )} 100%)`,
        py: 4,
      }}
    >
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
            В главное меню
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
            Мой профиль
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

            {/* Статистика изучения */}
            <Paper
              elevation={0}
              sx={{
                position: 'absolute',
                right: { xs: 0, sm: -200 },
                top: '50%',
                transform: 'translateY(-50%)',
                p: 2,
                borderRadius: 3,
                border: `2px solid ${alpha(NEUTRAL_COLORS.accent, 0.2)}`,
                backgroundColor: alpha(NEUTRAL_COLORS.surface, 0.9),
                backdropFilter: 'blur(10px)',
                display: { xs: 'none', lg: 'block' },
                minWidth: 180,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress
                  variant="determinate"
                  value={total > 0 ? (totalCounts.easy / total) * 100 : 0}
                  size={40}
                  thickness={4}
                  sx={{
                    color: NEUTRAL_COLORS.success,
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    },
                  }}
                />
                <Box>
                  <Typography variant="caption" sx={{ color: NEUTRAL_COLORS.textSecondary, fontWeight: 600 }}>
                    Mastery Progress
                  </Typography>
                  <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textPrimary, fontWeight: 700 }}>
                    {total > 0 ? Math.round((totalCounts.easy / total) * 100) : 0}% Complete
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>

          {/* Описание с кнопками быстрого доступа */}
          <Box sx={{ position: 'relative', maxWidth: '600px', mx: 'auto' }}>
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

            {/* Быстрые действия */}
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
  
  {/* Простой разделитель */}
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

            {/* Индикатор активности фильтров */}
            {(difficulty || categoryId || debouncedSearch) && (
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
        <div id="statistics-section">
          <StatisticsSection
            total={total}
            easy={totalCounts.easy}
            medium={totalCounts.medium}
            hard={totalCounts.hard}
            onFilterSelect={handleStatFilterSelect}
            activeFilter={difficulty}
          />
        </div>

        {/* Основной контент - новая структура */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Левая колонка - фильтры (фиксированная ширина) */}
          <Box className="filters-column" sx={{ width: 320, flexShrink: 0 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `2px solid ${NEUTRAL_COLORS.border}`,
                backgroundColor: NEUTRAL_COLORS.surface,
                position: 'sticky',
                top: 20,
                height: 'fit-content',
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
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setPage(1);
                    }}
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
                    Выбери сложность
                  </Typography>
                  <Stack spacing={1}>
                    <FilterButton
                      active={difficulty === 'easy'}
                      onClick={() => {
                        setDifficulty('easy');
                        setPage(1);
                      }}
                      color={NEUTRAL_COLORS.success}
                    >
                      Easy
                    </FilterButton>
                    <FilterButton
                      active={difficulty === 'medium'}
                      onClick={() => {
                        setDifficulty('medium');
                        setPage(1);
                      }}
                      color={NEUTRAL_COLORS.warning}
                    >
                      Medium
                    </FilterButton>
                    <FilterButton
                      active={difficulty === 'hard'}
                      onClick={() => {
                        setDifficulty('hard');
                        setPage(1);
                      }}
                      color={NEUTRAL_COLORS.error}
                    >
                      Hard
                    </FilterButton>
                  </Stack>
                </Box>

                <Divider sx={{ borderColor: alpha(NEUTRAL_COLORS.border, 0.5) }} />

                {/* Сброс фильтров */}
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={() => {
                    // Проверяем, есть ли активные фильтры
                    if (search || difficulty || categoryId) {
                      handleResetFilters();
                    }
                  }}
                  sx={{
                    borderWidth: 2,
                    borderColor: NEUTRAL_COLORS.border,
                    color: NEUTRAL_COLORS.textPrimary,
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: '1rem',
                    '&:hover': {
                      // Показываем эффект ховера только если есть активные фильтры
                      ...((search || difficulty || categoryId) && {
                        borderColor: NEUTRAL_COLORS.accent,
                        backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
                        transform: 'translateY(-1px)',
                      }),
                      // Для неактивного состояния показываем другой эффект
                      ...(!search && !difficulty && !categoryId && {
                        cursor: 'not-allowed',
                        borderColor: alpha(NEUTRAL_COLORS.border, 0.5),
                        backgroundColor: 'transparent',
                      }),
                    },
                    // Стили для активного состояния
                    ...((search || difficulty || categoryId) && {
                      borderColor: NEUTRAL_COLORS.border,
                      color: NEUTRAL_COLORS.textPrimary,
                    }),
                    // Стили для неактивного состояния
                    ...(!search && !difficulty && !categoryId && {
                      color: NEUTRAL_COLORS.textSecondary,
                      borderColor: alpha(NEUTRAL_COLORS.border, 0.5),
                      backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
                      cursor: 'not-allowed',
                    }),
                    transition: 'all 0.2s',
                  }}
                >
                  Очистить фильтры
                </Button>
              </Stack>
            </Paper>
          </Box>

          {/* Правая колонка - вопросы (растягивается до фильтров) */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
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
                  border: `2px dashed ${alpha(NEUTRAL_COLORS.border, 0.5)}`,
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
                    Clear Search
                  </Button>
                )}
              </Paper>
            ) : (
              <>
                {/* Заголовок результатов */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: NEUTRAL_COLORS.textPrimary,
                      mb: 2,
                    }}
                  >
                    {total} Вопроса
                  </Typography>
                  {(difficulty || categoryId || debouncedSearch) && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {difficulty && (
                        <Chip
                          label={`Difficulty: ${difficulty}`}
                          size="medium"
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
                          label={`Category: ${getSelectedCategoryName() || 'Unknown'}`}
                          size="medium"
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
                          label={`Search: "${debouncedSearch}"`}
                          size="medium"
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
                    </Stack>
                  )}
                </Box>

                {/* Список вопросов (вертикальный) */}
                <Box sx={{ mb: 4 }}>
                  {filteredQuestions.map((question, index) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      onClick={() => navigate(`/questions/${question.id}`)}
                      index={(page - 1) * ITEMS_PER_PAGE + index}
                      categories={categories}
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
    </Box>
  );
};