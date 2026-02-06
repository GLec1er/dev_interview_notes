import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Stack,
  Button,
  Chip,
  alpha,
  IconButton,
  Tooltip,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Pagination,
  useTheme,
  useMediaQuery,
  Alert,
  Collapse,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenInNewIcon,
  TrendingUp as TrendingUpIcon,
  KeyboardArrowUp as ScrollTopIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { favoriteService } from '../services/favoriteService';
import { questionCompletionService } from '../services/questionCompletionService';

// Используем те же цвета, что и в профиле
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
  easy: '#38A169',
  medium: '#D69E2E',
  hard: '#E53E3E',
  gold: '#D4AF37',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};

// Тот же градиент фона, что и в профиле
const BACKGROUND_GRADIENT = `linear-gradient(135deg, ${NEUTRAL_COLORS.background} 0%, ${alpha(
  NEUTRAL_COLORS.background,
  0.8
)} 100%)`;

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return NEUTRAL_COLORS.easy;
    case 'medium':
      return NEUTRAL_COLORS.medium;
    case 'hard':
      return NEUTRAL_COLORS.hard;
    default:
      return NEUTRAL_COLORS.accent;
  }
};

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'Легкий';
    case 'medium':
      return 'Средний';
    case 'hard':
      return 'Сложный';
    default:
      return difficulty;
  }
};

// Интерфейс для данных из API
interface FavoriteItem {
  favorite_id: string;
  question_id: string;
  question_title: string;
  question_difficulty: string;
  user_id: string;
  added_at: string;
}

interface FavoritesResponse {
  items: FavoriteItem[];
  total: number;
}

// Компонент карточки вопроса в избранном
interface FavoriteQuestionCardProps {
  favorite: FavoriteItem;
  isCompleted: boolean;
  onRemove: (questionId: string) => void;
  onNavigate: (questionId: string) => void;
}

const FavoriteQuestionCard: React.FC<FavoriteQuestionCardProps> = ({
  favorite,
  isCompleted,
  onRemove,
  onNavigate,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <Paper
        elevation={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          p: 3,
          borderRadius: 3,
          border: `1px solid ${NEUTRAL_COLORS.border}`,
          backgroundColor: NEUTRAL_COLORS.surface,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          width: '340px', // Фиксированная высота
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            borderColor: alpha(NEUTRAL_COLORS.accent, 0.5),
            boxShadow: `0 12px 32px ${alpha(NEUTRAL_COLORS.accent, 0.1)}`,
            transform: 'translateY(-4px)',
            '& .card-title': {
              color: NEUTRAL_COLORS.accent,
            },
          },
        }}
      >
        {/* Верхняя полоска сложности */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${getDifficultyColor(favorite.question_difficulty)} 0%, ${alpha(
              getDifficultyColor(favorite.question_difficulty),
              0.5
            )} 100%)`,
            borderRadius: '3px 3px 0 0',
          }}
        />

        {/* Иконка закладки в углу */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1,
          }}
        >
          <BookmarkIcon sx={{ color: NEUTRAL_COLORS.warning, fontSize: 24 }} />
        </Box>

        {/* Содержимое карточки */}
        <Box sx={{ flex: 1, mb: 3, display: 'flex', flexDirection: 'column' }}>
          {/* Заголовок вопроса - фиксированная высота */}
          <Box sx={{ flexShrink: 0, mb: 2, minHeight: '64px' }}>
            <Typography
              className="card-title"
              variant="h6"
              onClick={() => onNavigate(favorite.question_id)}
              sx={{
                fontWeight: 700,
                color: NEUTRAL_COLORS.textPrimary,
                fontSize: '1.125rem',
                lineHeight: 1.4,
                transition: 'color 0.3s',
                pr: 4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                wordBreak: 'break-word',
              }}
            >
              {favorite.question_title}
            </Typography>
          </Box>

          {/* Теги вопроса - фиксированная высота */}
          <Box sx={{ flexShrink: 0, mb: 2, minHeight: '32px' }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              {/* Сложность */}
              <Chip
                size="small"
                label={getDifficultyLabel(favorite.question_difficulty)}
                sx={{
                  fontWeight: 700,
                  backgroundColor: alpha(getDifficultyColor(favorite.question_difficulty), 0.1),
                  color: getDifficultyColor(favorite.question_difficulty),
                  border: `1px solid ${alpha(getDifficultyColor(favorite.question_difficulty), 0.3)}`,
                  fontSize: '0.75rem',
                }}
              />

              {/* Статус выполнения */}
              {isCompleted && (
                <Chip
                  icon={<StarIcon sx={{ fontSize: 14 }} />}
                  size="small"
                  label="Выполнено"
                  sx={{
                    fontWeight: 700,
                    backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                    color: NEUTRAL_COLORS.success,
                    border: `1px solid ${alpha(NEUTRAL_COLORS.success, 0.3)}`,
                    fontSize: '0.75rem',
                  }}
                />
              )}
            </Stack>
          </Box>

          {/* Информация о дате добавления - фиксированное положение */}
          <Box sx={{ mt: 'auto', flexShrink: 0 }}>
            <Typography
              variant="caption"
              sx={{
                color: NEUTRAL_COLORS.textSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <HistoryIcon fontSize="small" />
              Добавлено: {new Date(favorite.added_at).toLocaleDateString('ru-RU')}
            </Typography>
          </Box>
        </Box>

        {/* Кнопки действий - фиксированное положение внизу */}
        <Box sx={{ flexShrink: 0 }}>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Tooltip title="Открыть вопрос">
              <Button
                variant="contained"
                size="small"
                endIcon={<OpenInNewIcon />}
                onClick={() => onNavigate(favorite.question_id)}
                sx={{
                  background: `linear-gradient(135deg, ${NEUTRAL_COLORS.accent} 0%, ${alpha(NEUTRAL_COLORS.accent, 0.8)} 100%)`,
                  '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(NEUTRAL_COLORS.accent, 0.3)}`,
                  },
                }}
              >
                Открыть
              </Button>
            </Tooltip>
            <Tooltip title="Удалить из избранного">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(true);
                }}
                sx={{
                  backgroundColor: alpha(NEUTRAL_COLORS.error, 0.1),
                  color: NEUTRAL_COLORS.error,
                  '&:hover': {
                    backgroundColor: alpha(NEUTRAL_COLORS.error, 0.2),
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Paper>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        PaperProps={{
          sx: {
            backgroundColor: NEUTRAL_COLORS.background,
            borderRadius: 3,
            border: `1px solid ${alpha(NEUTRAL_COLORS.error, 0.2)}`,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: NEUTRAL_COLORS.error }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon />
            Удалить из избранного?
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: NEUTRAL_COLORS.textPrimary }}>
            Вы уверены, что хотите удалить вопрос <strong>"{favorite.question_title}"</strong> из избранного?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmDelete(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              borderColor: NEUTRAL_COLORS.border,
              color: NEUTRAL_COLORS.textSecondary,
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={() => {
              setConfirmDelete(false);
              onRemove(favorite.question_id);
            }}
            variant="contained"
            sx={{
              borderRadius: 2,
              background: `linear-gradient(135deg, ${NEUTRAL_COLORS.error} 0%, ${alpha(NEUTRAL_COLORS.error, 0.8)} 100%)`,
              '&:hover': {
                boxShadow: `0 8px 24px ${alpha(NEUTRAL_COLORS.error, 0.3)}`,
              },
            }}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Компонент статистики (похож на профиль)
const StatCard = ({
  title,
  value,
  subtitle,
  color,
  icon,
  percentage = false,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
  percentage?: boolean;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, sm: 3 }, // Меньший padding на мобильных
      borderRadius: 2,
      backgroundColor: alpha(color, 0.05),
      border: `1px solid ${alpha(color, 0.2)}`,
      height: '100%',
      minWidth: { xs: 'unset', sm: 250 }, // Убираем фиксированную минимальную ширину на мобильных
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: { xs: 'none', sm: 'translateY(-4px)' }, // Анимация только на больших экранах
        boxShadow: { 
          xs: 'none', 
          sm: `0 8px 24px ${alpha(color, 0.15)}` 
        },
        borderColor: { xs: alpha(color, 0.2), sm: alpha(color, 0.4) },
      },
      // Адаптивные стили для очень маленьких экранов
      '@media (max-width: 400px)': {
        p: 1.5,
        '& .MuiTypography-h3': {
          fontSize: '1.75rem !important',
        },
        '& .icon-container': {
          padding: '10px !important',
        }
      }
    }}
  >
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: { xs: 1.5, sm: 2 }, // Меньший gap на мобильных
        mb: { xs: 1.5, sm: 2 } 
      }}
    >
      <Box
        className="icon-container"
        sx={{
          p: { xs: 1, sm: 1.5 }, // Меньший padding для иконки
          borderRadius: '50%',
          backgroundColor: alpha(color, 0.1),
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          // Размер иконки адаптивный
          '& svg': {
            fontSize: { xs: 20, sm: 24 }
          }
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          color: NEUTRAL_COLORS.textPrimary,
          fontSize: { xs: '0.9rem', sm: '1rem' }, // Меньший шрифт на мобильных
          lineHeight: 1.3,
        }}
      >
        {title}
      </Typography>
    </Box>

    <Typography
      variant="h3"
      sx={{
        fontWeight: 800,
        color: color,
        mb: { xs: 0.5, sm: 1 },
        fontSize: { 
          xs: '1.75rem',  // Меньше на мобильных
          sm: '2rem',     // Средний размер
          md: '2.5rem'    // Полный размер на десктопе
        },
        background: percentage ? `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)` : 'none',
        backgroundClip: percentage ? 'text' : 'none',
        WebkitBackgroundClip: percentage ? 'text' : 'none',
        WebkitTextFillColor: percentage ? 'transparent' : 'inherit',
        lineHeight: 1.2,
      }}
    >
      {percentage ? `${value}%` : value}
    </Typography>

    <Typography
      variant="body2"
      sx={{
        color: NEUTRAL_COLORS.textSecondary,
        flexGrow: 1,
        fontSize: { xs: '0.8rem', sm: '0.875rem' }, // Меньший шрифт
        lineHeight: 1.4,
      }}
    >
      {subtitle}
    </Typography>
  </Paper>
);

// Главный компонент страницы избранного
export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobileFilter = useMediaQuery(theme.breakpoints.down(930));

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statsExpanded, setStatsExpanded] = useState(true);
  const [sortBy, setSortBy] = useState<string>('added_at');
  const [sortDir, setSortDir] = useState<string>('desc');

  const ITEMS_PER_PAGE = 6; // Количество элементов на странице

  // Отслеживание скролла
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Загрузка избранных вопросов
  const loadFavorites = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setIsRefreshing(true);
      setError(null);

      // Используем правильный endpoint с параметрами пагинации и сортировки
      const response = await favoriteService.getFavorites(
        page,
        ITEMS_PER_PAGE,
        sortBy,
        sortDir
      );
      
      setFavorites(response.items);
      setTotal(response.total);
      setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));

      // Загрузим статус выполнения для каждого вопроса
      const completedSet = new Set<string>();
      for (const favorite of response.items) {
        try {
          const completion = await questionCompletionService.isQuestionCompleted(favorite.question_id);
          if (completion.is_completed) {
            completedSet.add(favorite.question_id);
          }
        } catch (err) {
          console.warn(`Не удалось загрузить статус выполнения для вопроса ${favorite.question_id}:`, err);
        }
      }
      setCompletedQuestions(completedSet);
    } catch (err) {
      console.error('Ошибка при загрузке избранных:', err);
      setError('Не удалось загрузить избранные вопросы. Попробуйте позже.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page, sortBy, sortDir, ITEMS_PER_PAGE]);

  // Загрузка данных при изменении page или сортировки
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Обработчик изменения страницы
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Обработчик сортировки
  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      // Меняем направление сортировки, если кликнули на тот же столбец
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDir('desc'); // По умолчанию нисходящая сортировка
    }
    setPage(1); // Сбрасываем на первую страницу при изменении сортировки
  };

  // Удаление из избранного
  const handleRemoveFavorite = async (questionId: string) => {
    try {
      await favoriteService.removeFromFavorites(questionId);
      setFavorites(favorites.filter(f => f.question_id !== questionId));
      setTotal(Math.max(0, total - 1));
      setTotalPages(Math.ceil((total - 1) / ITEMS_PER_PAGE));
      setCompletedQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    } catch (err) {
      console.error('Ошибка при удалении из избранного:', err);
      setError('Не удалось удалить вопрос из избранного. Попробуйте позже.');
    }
  };

  // Обновление списка
  const handleRefresh = () => {
    loadFavorites(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completedCount = completedQuestions.size;
  const completionPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // Статистика по сложности
  const difficultyStats = {
    easy: favorites.filter(f => f.question_difficulty === 'easy').length,
    medium: favorites.filter(f => f.question_difficulty === 'medium').length,
    hard: favorites.filter(f => f.question_difficulty === 'hard').length,
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: BACKGROUND_GRADIENT,
        py: 4,
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
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

        {/* Навигация */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/profile')}
            sx={{
              color: NEUTRAL_COLORS.accent,
              '&:hover': {
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
              },
            }}
            variant="text"
          >
            Назад в профиль
          </Button>
        </Box>

        {/* Уведомления об ошибках */}
        {error && (
          <Fade in={true}>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(NEUTRAL_COLORS.error, 0.2)}`,
              }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Заголовок страницы */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
            backgroundColor: NEUTRAL_COLORS.surface,
            mb: 4,
          }}
        >
          {/* Заголовок с иконкой */}
          <Box sx={{ mb: 4, pb: 3, borderBottom: `1px solid ${alpha(NEUTRAL_COLORS.border, 0.5)}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    backgroundColor: alpha(NEUTRAL_COLORS.warning, 0.1),
                    color: NEUTRAL_COLORS.warning,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BookmarkIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: NEUTRAL_COLORS.textPrimary,
                      fontSize: { xs: '1.75rem', md: '2.25rem' },
                    }}
                  >
                    Избранные вопросы
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: NEUTRAL_COLORS.textSecondary,
                      mt: 0.5,
                    }}
                  >
                    Ваши сохраненные вопросы для изучения
                  </Typography>
                </Box>
              </Box>

              <Tooltip title="Обновить список">
                <IconButton
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  sx={{
                    backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                    color: NEUTRAL_COLORS.accent,
                    '&:hover': {
                      backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.2),
                    },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Краткая статистика */}
            <Box
              sx={{
                cursor: 'pointer',
                mt: 2,
              }}
              onClick={() => setStatsExpanded(!statsExpanded)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: NEUTRAL_COLORS.textPrimary,
                  }}
                >
                  Общая статистика
                </Typography>
                <IconButton size="small">
                  {statsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Развернутая статистика */}
          <Collapse in={statsExpanded}>
            <Box sx={{ mb: 4 }}>
              <Grid 
                container 
                spacing={{ xs: 2, sm: 3 }} // Меньший отступ на мобильных
                justifyContent="center"
                sx={{ 
                  mb: 3,
                  // На очень маленьких экранах делаем вертикальное расположение
                  '@media (max-width: 400px)': {
                    '& .MuiGrid-item': {
                      width: '100%',
                    }
                  }
                }}
              >
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title={isMobileFilter ? "Вопросы" : "Всего вопросов"}
                    value={total}
                    subtitle="в избранном"
                    color={NEUTRAL_COLORS.accent}
                    icon={<BookmarkIcon />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Выполнено"
                    value={completedCount}
                    subtitle="вопросов"
                    color={NEUTRAL_COLORS.success}
                    icon={<CheckCircleIcon />}
                  />
                </Grid>
                {!isMobileFilter && (
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Прогресс"
                    value={completionPercentage}
                    subtitle="от общего числа"
                    color={NEUTRAL_COLORS.warning}
                    icon={<TrendingUpIcon />}
                    percentage
                  />
                </Grid>
                )}
              </Grid>            
            </Box>
          </Collapse>

          {/* Состояние загрузки */}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={48} sx={{ color: NEUTRAL_COLORS.accent }} />
            </Box>
          )}

          {/* Пустое состояние */}
          {!isLoading && favorites.length === 0 && !error && (
            <Fade in={true}>
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  borderRadius: 3,
                  border: `1px dashed ${NEUTRAL_COLORS.border}`,
                  backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
                  textAlign: 'center',
                }}
              >
                <BookmarkBorderIcon
                  sx={{
                    fontSize: 64,
                    color: NEUTRAL_COLORS.textSecondary,
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: NEUTRAL_COLORS.textPrimary,
                    mb: 1,
                  }}
                >
                  Избранное пусто
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: NEUTRAL_COLORS.textSecondary,
                    mb: 3,
                    maxWidth: '400px',
                    mx: 'auto',
                  }}
                >
                  Добавляйте вопросы в избранное, чтобы вернуться к ним позже
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/questions')}
                  startIcon={<TrendingUpIcon />}
                  sx={{
                    background: `linear-gradient(135deg, ${NEUTRAL_COLORS.accent} 0%, ${alpha(
                      NEUTRAL_COLORS.accent,
                      0.8
                    )} 100%)`,
                    '&:hover': {
                      boxShadow: `0 8px 24px ${alpha(NEUTRAL_COLORS.accent, 0.3)}`,
                    },
                  }}
                >
                  Перейти к вопросам
                </Button>
              </Paper>
            </Fade>
          )}

          {/* Сетка вопросов с сортировкой */}
          {!isLoading && favorites.length > 0 && (
            <Fade in={true}>
              <Box>
                {/* Заголовок и сортировка */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  mb: 3,
                  gap: 2 
                }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: NEUTRAL_COLORS.textPrimary,
                    }}
                  >
                    Ваши избранные вопросы ({total})
                  </Typography>

                  {/* Кнопки сортировки */}
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      label="По дате добавления"
                      variant={sortBy === 'added_at' ? 'filled' : 'outlined'}
                      onClick={() => handleSortChange('added_at')}
                      icon={sortBy === 'added_at' ? 
                        (sortDir === 'desc' ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />) 
                        : undefined
                      }
                      size={isMobile ? 'small' : 'medium'}
                      sx={{
                        backgroundColor: sortBy === 'added_at' ? alpha(NEUTRAL_COLORS.accent, 0.1) : 'transparent',
                        color: sortBy === 'added_at' ? NEUTRAL_COLORS.accent : NEUTRAL_COLORS.textSecondary,
                        borderColor: sortBy === 'added_at' ? NEUTRAL_COLORS.accent : NEUTRAL_COLORS.border,
                        '&:hover': {
                          backgroundColor: sortBy === 'added_at' ? alpha(NEUTRAL_COLORS.accent, 0.15) : alpha(NEUTRAL_COLORS.accent, 0.05),
                          borderColor: sortBy === 'added_at' ? NEUTRAL_COLORS.accent : alpha(NEUTRAL_COLORS.accent, 0.3),
                        },
                      }}
                    />
                    <Chip
                      label="По сложности"
                      variant={sortBy === 'difficulty' ? 'filled' : 'outlined'}
                      onClick={() => handleSortChange('difficulty')}
                      icon={sortBy === 'difficulty' ? 
                        (sortDir === 'desc' ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />) 
                        : undefined
                      }
                      size={isMobile ? 'small' : 'medium'}
                      sx={{
                        backgroundColor: sortBy === 'difficulty' ? alpha(NEUTRAL_COLORS.warning, 0.1) : 'transparent',
                        color: sortBy === 'difficulty' ? NEUTRAL_COLORS.warning : NEUTRAL_COLORS.textSecondary,
                        borderColor: sortBy === 'difficulty' ? NEUTRAL_COLORS.warning : NEUTRAL_COLORS.border,
                        '&:hover': {
                          backgroundColor: sortBy === 'difficulty' ? alpha(NEUTRAL_COLORS.warning, 0.15) : alpha(NEUTRAL_COLORS.warning, 0.05),
                          borderColor: sortBy === 'difficulty' ? NEUTRAL_COLORS.warning : alpha(NEUTRAL_COLORS.warning, 0.3),
                        },
                      }}
                    />
                    <Chip
                      label="По названию"
                      variant={sortBy === 'title' ? 'filled' : 'outlined'}
                      onClick={() => handleSortChange('title')}
                      icon={sortBy === 'title' ? 
                        (sortDir === 'desc' ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />) 
                        : undefined
                      }
                      size={isMobile ? 'small' : 'medium'}
                      sx={{
                        backgroundColor: sortBy === 'title' ? alpha(NEUTRAL_COLORS.success, 0.1) : 'transparent',
                        color: sortBy === 'title' ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.textSecondary,
                        borderColor: sortBy === 'title' ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.border,
                        '&:hover': {
                          backgroundColor: sortBy === 'title' ? alpha(NEUTRAL_COLORS.success, 0.15) : alpha(NEUTRAL_COLORS.success, 0.05),
                          borderColor: sortBy === 'title' ? NEUTRAL_COLORS.success : alpha(NEUTRAL_COLORS.success, 0.3),
                        },
                      }}
                    />
                  </Stack>
                </Box>

                {/* Сетка вопросов */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {favorites.map(favorite => (
                    <Grid item xs={12} sm={6} md={4} key={favorite.favorite_id} sx={{ display: 'flex' }}>
                      <FavoriteQuestionCard
                        favorite={favorite}
                        isCompleted={completedQuestions.has(favorite.question_id)}
                        onRemove={handleRemoveFavorite}
                        onNavigate={(id) => navigate(`/questions/${id}`)}
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Пагинация */}
                {totalPages > 1 && (
                  <Fade in={true}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 2, sm: 3 },
                          borderRadius: 3,
                          backgroundColor: alpha(NEUTRAL_COLORS.surface, 0.8),
                          border: `1px solid ${alpha(NEUTRAL_COLORS.border, 0.5)}`,
                          backdropFilter: 'blur(10px)',
                          width: '100%',
                          maxWidth: '800px',
                        }}
                      >
                        {/* Информация о странице */}
                        {/* <Box sx={{ textAlign: 'center', mb: 2 }}>
                          <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                            Показано {((page - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(page * ITEMS_PER_PAGE, total)} из {total} вопросов
                          </Typography>
                        </Box> */}

                        {/* Основная пагинация */}
                        <Stack 
                          direction={isMobile ? 'column' : 'row'} 
                          spacing={isMobile ? 2 : 3} 
                          alignItems="center" 
                          justifyContent="center"
                        >
                          {/* Кнопка "Назад" */}
                          <Button
                            disabled={page === 1}
                            onClick={() => {
                              setPage(page - 1);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            sx={{
                              borderColor: NEUTRAL_COLORS.border,
                              color: page === 1 ? NEUTRAL_COLORS.textSecondary : NEUTRAL_COLORS.accent,
                              '&:hover': {
                                borderColor: NEUTRAL_COLORS.accent,
                                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
                              },
                              minWidth: { xs: '100%', sm: 'auto' },
                            }}
                          >
                            {isMobile ? 'Предыдущая' : 'Предыдущая страница'}
                          </Button>

                          {/* Pagination компонент */}
                          <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            siblingCount={isMobile ? 0 : 1}
                            boundaryCount={isMobile ? 1 : 2}
                            sx={{
                              '& .MuiPaginationItem-root': {
                                color: NEUTRAL_COLORS.textSecondary,
                                border: `1px solid ${NEUTRAL_COLORS.border}`,
                                backgroundColor: NEUTRAL_COLORS.surface,
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                minWidth: { xs: 32, sm: 40 },
                                height: { xs: 32, sm: 40 },
                                margin: { xs: '0 2px', sm: '0 4px' },
                                '&.Mui-selected': {
                                  backgroundColor: NEUTRAL_COLORS.accent,
                                  color: NEUTRAL_COLORS.surface,
                                  fontWeight: 700,
                                  borderColor: NEUTRAL_COLORS.accent,
                                  '&:hover': {
                                    backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.9),
                                  },
                                },
                                '&:hover': {
                                  backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                                  borderColor: NEUTRAL_COLORS.accent,
                                },
                                '&.MuiPaginationItem-ellipsis': {
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                },
                              },
                            }}
                          />

                          {/* Кнопка "Вперед" */}
                          <Button
                            disabled={page >= totalPages}
                            onClick={() => {
                              setPage(page + 1);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            variant="outlined"
                            endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
                            sx={{
                              borderColor: NEUTRAL_COLORS.border,
                              color: page >= totalPages ? NEUTRAL_COLORS.textSecondary : NEUTRAL_COLORS.accent,
                              '&:hover': {
                                borderColor: NEUTRAL_COLORS.accent,
                                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
                              },
                              minWidth: { xs: '100%', sm: 'auto' },
                            }}
                          >
                            {isMobile ? 'Следующая' : 'Следующая страница'}
                          </Button>
                        </Stack>

                        {/* Переход к странице */}
                        {!isMobile && totalPages > 5 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, gap: 1 }}>
                            <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                              Перейти к странице:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={page}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (value >= 1 && value <= totalPages) {
                                    setPage(value);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }
                                }}
                                style={{
                                  width: '60px',
                                  padding: '4px 8px',
                                  border: `1px solid ${NEUTRAL_COLORS.border}`,
                                  borderRadius: '4px',
                                  textAlign: 'center',
                                  fontSize: '14px',
                                  color: NEUTRAL_COLORS.textPrimary,
                                  backgroundColor: NEUTRAL_COLORS.surface,
                                }}
                              />
                              <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary, alignSelf: 'center' }}>
                                / {totalPages}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Paper>
                    </Box>
                  </Fade>
                )}
              </Box>
            </Fade>
          )}
        </Paper>

        {/* Подсказка */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px dashed ${NEUTRAL_COLORS.border}`,
            backgroundColor: alpha(NEUTRAL_COLORS.info, 0.05),
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ color: NEUTRAL_COLORS.info, fontWeight: 600 }}>
              💡 Как использовать избранное:
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                • Добавляйте в избранное сложные вопросы, чтобы вернуться к ним позже
              </Typography>
              <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                • Используйте избранное для повторения важного материала
              </Typography>
              <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                • Отслеживайте свой прогресс по выполненным вопросам
              </Typography>
              <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                • Удаляйте вопросы из избранного, когда освоите тему
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};