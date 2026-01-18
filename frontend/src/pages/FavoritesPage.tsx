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
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenInNewIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  KeyboardArrowUp as ScrollTopIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  Category as CategoryIcon,
  Speed as SpeedIcon,
  Bolt as BoltIcon,
  EmojiEvents as TrophyIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
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
      p: 3,
      borderRadius: 2,
      backgroundColor: alpha(color, 0.05),
      border: `1px solid ${alpha(color, 0.2)}`,
      height: '100%',
      minWidth: 250,
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 24px ${alpha(color, 0.15)}`,
        borderColor: alpha(color, 0.4),
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Box
        sx={{
          p: 1.5,
          borderRadius: '50%',
          backgroundColor: alpha(color, 0.1),
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          color: NEUTRAL_COLORS.textPrimary,
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
        mb: 1,
        fontSize: { xs: '2rem', md: '2.5rem' },
        background: percentage ? `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)` : 'none',
        backgroundClip: percentage ? 'text' : 'none',
        WebkitBackgroundClip: percentage ? 'text' : 'none',
        WebkitTextFillColor: percentage ? 'transparent' : 'inherit',
      }}
    >
      {percentage ? `${value}%` : value}
    </Typography>

    <Typography
      variant="body2"
      sx={{
        color: NEUTRAL_COLORS.textSecondary,
        flexGrow: 1,
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

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statsExpanded, setStatsExpanded] = useState(true);

  const ITEMS_PER_PAGE = 12;

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

      // Используем правильный endpoint
      const response = await favoriteService.getFavorites(page, ITEMS_PER_PAGE);
      setFavorites(response.items);
      setTotal(response.total);

      // Загрузим статус выполнения для каждого вопроса
      const completedSet = new Set<string>();
      for (const favorite of response.items) {
        const completion = await questionCompletionService.isQuestionCompleted(favorite.question_id);
        if (completion.is_completed) {
          completedSet.add(favorite.question_id);
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
  }, [page]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Удаление из избранного
  const handleRemoveFavorite = async (questionId: string) => {
    try {
      await favoriteService.removeFromFavorites(questionId);
      setFavorites(favorites.filter(f => f.question_id !== questionId));
      setTotal(Math.max(0, total - 1));
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
            <Box sx={{ mb: 4}}>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Всего вопросов"
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

          {/* Сетка вопросов */}
          {!isLoading && favorites.length > 0 && (
            <Fade in={true}>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: NEUTRAL_COLORS.textPrimary,
                    mb: 3,
                  }}
                >
                  Ваши избранные вопросы ({total})
                </Typography>

                {/* Grid с одинаковыми карточками */}
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
                {total > ITEMS_PER_PAGE && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
                        border: `1px solid ${alpha(NEUTRAL_COLORS.border, 0.3)}`,
                      }}
                    >
                      <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="center">
                        <Button
                          disabled={page === 1}
                          onClick={() => setPage(page - 1)}
                          variant="outlined"
                          startIcon={<ArrowBackIcon />}
                          sx={{
                            borderColor: NEUTRAL_COLORS.border,
                            color: NEUTRAL_COLORS.textSecondary,
                            '&:hover': {
                              borderColor: NEUTRAL_COLORS.accent,
                              color: NEUTRAL_COLORS.accent,
                            },
                          }}
                        >
                          Предыдущая
                        </Button>

                        <Pagination
                          count={Math.ceil(total / ITEMS_PER_PAGE)}
                          page={page}
                          onChange={(_, value) => setPage(value)}
                          color="primary"
                          sx={{
                            '& .MuiPaginationItem-root': {
                              color: NEUTRAL_COLORS.textSecondary,
                              '&.Mui-selected': {
                                backgroundColor: NEUTRAL_COLORS.accent,
                                color: NEUTRAL_COLORS.surface,
                                fontWeight: 700,
                              },
                              '&:hover': {
                                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                              },
                            },
                          }}
                        />

                        <Button
                          disabled={page >= Math.ceil(total / ITEMS_PER_PAGE)}
                          onClick={() => setPage(page + 1)}
                          variant="outlined"
                          endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
                          sx={{
                            borderColor: NEUTRAL_COLORS.border,
                            color: NEUTRAL_COLORS.textSecondary,
                            '&:hover': {
                              borderColor: NEUTRAL_COLORS.accent,
                              color: NEUTRAL_COLORS.accent,
                            },
                          }}
                        >
                          Следующая
                        </Button>
                      </Stack>

                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          textAlign: 'center',
                          mt: 2,
                          color: NEUTRAL_COLORS.textSecondary,
                        }}
                      >
                        Страница {page} из {Math.ceil(total / ITEMS_PER_PAGE)}
                      </Typography>
                    </Paper>
                  </Box>
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