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
  useTheme as useMuiTheme,
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
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme as useThemeContext } from '../context/ThemeContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { NavigationBar } from '../components/NavigationBar';


// Стеклянная цветовая палитра iOS 26 Liquid Glass - теперь реагирует на смену темы
const getGlassColors = (mode: 'light' | 'dark') => {
  if (mode === 'dark') {
    return {
      primary: 'rgba(0, 212, 255, 0.9)', // Яркий киберпанк голубой
      secondary: 'rgba(138, 43, 226, 0.8)', // Яркий фиолетовый
      accent: 'rgba(0, 255, 200, 0.9)', // Киберпанк аква
      background: 'rgba(20, 20, 40, 0.6)', // Тёмный фон
      surface: 'rgba(30, 30, 60, 0.7)', // Тёмная поверхность
      surfaceDark: 'rgba(40, 40, 80, 0.8)', // Ещё темнее
      textPrimary: 'rgba(255, 255, 255, 0.95)',
      textSecondary: 'rgba(180, 180, 200, 0.7)',
      border: 'rgba(0, 212, 255, 0.3)', // Тёмная граница
      borderGlow: 'rgba(0, 212, 255, 0.6)',
      success: 'rgba(0, 228, 91, 0.9)', // Яркий зеленый
      error: 'rgba(255, 50, 100, 0.9)', // Яркий красный
      warning: 'rgba(255, 150, 0, 0.9)', // Яркий оранжевый
      info: 'rgba(90, 200, 250, 0.8)',
      purple: 'rgba(200, 100, 255, 0.9)', // Яркий фиолетовый
      blue: 'rgba(0, 180, 255, 0.9)', // Яркий голубой
      gradientStart: 'rgba(0, 212, 255, 0.2)',
      gradientEnd: 'rgba(138, 43, 226, 0.1)',
      glassOverlay: 'rgba(0, 212, 255, 0.1)',
      glassHighlight: 'rgba(0, 212, 255, 0.2)',
      mainColor: 'linear-gradient(135deg, #464646ff 0%, #292929ff 50%, #000000ff 100%)',
      gold: 'rgba(212, 175, 55, 0.8)',
      silver: 'rgba(107, 107, 107, 0.7)',
      bronze: 'rgba(205, 127, 50, 0.7)',
      easy: 'rgba(52, 199, 89, 0.8)',
      medium: 'rgba(255, 149, 0, 0.8)',
      hard: 'rgba(255, 59, 48, 0.8)',
    };
  }
  
  // Light mode
  return {
    primary: 'rgba(10, 132, 255, 0.8)', // iOS синий с прозрачностью
    secondary: 'rgba(94, 92, 230, 0.75)', // Фиолетово-синий
    accent: 'rgba(90, 200, 250, 0.9)', // Голубой акцент
    background: 'rgba(240, 244, 250, 0.4)', // Полупрозрачный фон
    surface: 'rgba(255, 255, 255, 0.6)', // Стеклянная поверхность
    surfaceDark: 'rgba(255, 255, 255, 0.8)', // Более плотное стекло
    textPrimary: 'rgba(0, 0, 0, 0.8)',
    textSecondary: 'rgba(60, 60, 67, 0.6)',
    border: 'rgba(255, 255, 255, 0.5)', // Стеклянная граница
    borderGlow: 'rgba(255, 255, 255, 0.8)',
    success: 'rgba(52, 199, 89, 0.8)', // iOS зеленый
    error: 'rgba(255, 59, 48, 0.8)', // iOS красный
    warning: 'rgba(255, 149, 0, 0.8)', // iOS оранжевый
    info: 'rgba(90, 200, 250, 0.8)',
    purple: 'rgba(175, 82, 222, 0.8)', // iOS фиолетовый
    blue: 'rgba(0, 122, 255, 0.8)', // iOS синий
    gradientStart: 'rgba(255, 255, 255, 0.3)',
    gradientEnd: 'rgba(255, 255, 255, 0.1)',
    glassOverlay: 'rgba(255, 255, 255, 0.2)',
    glassHighlight: 'rgba(255, 255, 255, 0.5)',
    mainColor: 'linear-gradient(135deg, #E0F0FF 0%, #D0E4FF 50%, #B8D8FF 100%)',
    gold: 'rgba(212, 175, 55, 0.8)',
    silver: 'rgba(107, 107, 107, 0.7)',
    bronze: 'rgba(205, 127, 50, 0.7)',
    easy: 'rgba(52, 199, 89, 0.8)',
    medium: 'rgba(255, 149, 0, 0.8)',
    hard: 'rgba(255, 59, 48, 0.8)',
  };
};

// Старая константа оставляем для совместимости, по умолчанию light mode
const GLASS_COLORS = getGlassColors('light');


const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return GLASS_COLORS.easy;
    case 'medium':
      return GLASS_COLORS.medium;
    case 'hard':
      return GLASS_COLORS.hard;
    default:
      return GLASS_COLORS.accent;
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

// Компонент карточки вопроса в избранном в стеклянном стиле
interface GlassFavoriteQuestionCardProps {
  favorite: FavoriteItem;
  isCompleted: boolean;
  onRemove: (questionId: string) => void;
  onNavigate: (questionId: string) => void;
}

const GlassFavoriteQuestionCard: React.FC<GlassFavoriteQuestionCardProps> = ({
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
          borderRadius: 4,
          background: GLASS_COLORS.surface,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid',
          borderColor: GLASS_COLORS.border,
          transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
          width: '340px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: `linear-gradient(135deg, ${GLASS_COLORS.glassHighlight} 0%, transparent 100%)`,
            opacity: 0,
            transition: 'opacity 0.4s ease',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -20,
            left: -20,
            right: -20,
            bottom: -20,
            background: `radial-gradient(circle at 30% 30%, ${getDifficultyColor(favorite.question_difficulty)} 0%, transparent 70%)`,
            opacity: 0,
            zIndex: -1,
            filter: 'blur(30px)',
            transition: 'opacity 0.4s ease',
          },
          '&:hover': {
            borderColor: GLASS_COLORS.borderGlow,
            boxShadow: `0 16px 32px ${alpha(getDifficultyColor(favorite.question_difficulty), 0.15)}`,
            transform: 'translateY(-4px)',
            '&::before': {
              opacity: 1,
            },
            '&::after': {
              opacity: 0.2,
            },
            '& .card-title': {
              color: getDifficultyColor(favorite.question_difficulty),
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
            borderRadius: '4px 4px 0 0',
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
          <BookmarkIcon sx={{ color: GLASS_COLORS.warning, fontSize: 24 }} />
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
                fontWeight: 600,
                color: GLASS_COLORS.textPrimary,
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
                letterSpacing: '-0.01em',
                cursor: 'pointer',
                '&:hover': {
                  color: getDifficultyColor(favorite.question_difficulty),
                },
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
                  fontWeight: 600,
                  background: alpha(getDifficultyColor(favorite.question_difficulty), 0.15),
                  backdropFilter: 'blur(10px)',
                  color: getDifficultyColor(favorite.question_difficulty),
                  border: '1px solid',
                  borderColor: alpha(getDifficultyColor(favorite.question_difficulty), 0.3),
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
                    fontWeight: 600,
                    background: alpha(GLASS_COLORS.success, 0.15),
                    backdropFilter: 'blur(10px)',
                    color: GLASS_COLORS.success,
                    border: '1px solid',
                    borderColor: alpha(GLASS_COLORS.success, 0.3),
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
                color: GLASS_COLORS.textSecondary,
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
                  background: `linear-gradient(135deg, ${getDifficultyColor(favorite.question_difficulty)} 0%, ${alpha(getDifficultyColor(favorite.question_difficulty), 0.6)} 100%)`,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha('#FFFFFF', 0.3),
                  borderRadius: 3,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${alpha(getDifficultyColor(favorite.question_difficulty), 0.9)}, ${alpha(getDifficultyColor(favorite.question_difficulty), 0.5)})`,
                    boxShadow: `0 8px 16px ${alpha(getDifficultyColor(favorite.question_difficulty), 0.3)}`,
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
                  background: alpha(GLASS_COLORS.error, 0.15),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha(GLASS_COLORS.error, 0.3),
                  color: GLASS_COLORS.error,
                  '&:hover': {
                    background: alpha(GLASS_COLORS.error, 0.25),
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Paper>

      {/* Диалог подтверждения удаления в стеклянном стиле */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: GLASS_COLORS.surfaceDark,
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid',
            borderColor: GLASS_COLORS.border,
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
          },
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          color: GLASS_COLORS.error,
          letterSpacing: '-0.01em',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon />
            Удалить из избранного?
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: GLASS_COLORS.textPrimary }}>
            Вы уверены, что хотите удалить вопрос <strong>"{favorite.question_title}"</strong> из избранного?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmDelete(false)}
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: GLASS_COLORS.border,
              color: GLASS_COLORS.textPrimary,
              background: GLASS_COLORS.surface,
              backdropFilter: 'blur(10px)',
              '&:hover': {
                borderColor: GLASS_COLORS.primary,
                background: alpha(GLASS_COLORS.primary, 0.1),
              },
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
              borderRadius: 3,
              background: `linear-gradient(135deg, ${GLASS_COLORS.error} 0%, ${alpha(GLASS_COLORS.error, 0.6)} 100%)`,
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: alpha('#FFFFFF', 0.3),
              '&:hover': {
                background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.error, 0.9)}, ${alpha(GLASS_COLORS.error, 0.5)})`,
                boxShadow: `0 8px 16px ${alpha(GLASS_COLORS.error, 0.3)}`,
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

// Компонент статистики в стеклянном стиле
const GlassStatCard = ({
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
      p: { xs: 2, sm: 3 },
      borderRadius: 4,
      background: GLASS_COLORS.surface,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid',
      borderColor: alpha(color, 0.3),
      height: '100%',
      minWidth: { xs: 'unset', sm: 250 },
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        background: `linear-gradient(135deg, ${GLASS_COLORS.glassHighlight} 0%, transparent 100%)`,
        opacity: 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: -20,
        left: -20,
        right: -20,
        bottom: -20,
        background: `radial-gradient(circle at 30% 30%, ${color} 0%, transparent 70%)`,
        opacity: 0.1,
        zIndex: -1,
        filter: 'blur(30px)',
        transition: 'opacity 0.4s ease',
      },
      '&:hover': {
        transform: { xs: 'none', sm: 'translateY(-4px)' },
        boxShadow: { 
          xs: 'none', 
          sm: `0 16px 32px ${alpha(color, 0.15)}` 
        },
        borderColor: alpha(color, 0.5),
        '&::before': {
          opacity: 1,
        },
        '&::after': {
          opacity: 0.2,
        },
      },
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
        gap: { xs: 1.5, sm: 2 },
        mb: { xs: 1.5, sm: 2 }
      }}
    >
      <Box
        className="icon-container"
        sx={{
          p: { xs: 1, sm: 1.5 },
          borderRadius: '50%',
          background: alpha(color, 0.15),
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: alpha(color, 0.3),
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
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
          color: GLASS_COLORS.textPrimary,
          fontSize: { xs: '0.9rem', sm: '1rem' },
          lineHeight: 1.3,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </Typography>
    </Box>

    <Typography
      variant="h3"
      sx={{
        fontWeight: 700,
        color: color,
        mb: { xs: 0.5, sm: 1 },
        fontSize: { 
          xs: '1.75rem',
          sm: '2rem',
          md: '2.5rem'
        },
        letterSpacing: '-0.02em',
        textShadow: `0 4px 12px ${alpha(color, 0.3)}`,
        background: percentage ? `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.6)} 100%)` : 'none',
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
        color: GLASS_COLORS.textSecondary,
        flexGrow: 1,
        fontSize: { xs: '0.8rem', sm: '0.875rem' },
        lineHeight: 1.4,
      }}
    >
      {subtitle}
    </Typography>
  </Paper>
);

// Главный компонент страницы избранного в стеклянном стиле
export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobileFilter = useMediaQuery(theme.breakpoints.down(930));

  const { mode: themeMode } = useThemeContext();
  const GLASS_COLORS = getGlassColors(themeMode);

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

  const ITEMS_PER_PAGE = 6;

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

      const response = await favoriteService.getFavorites(
        page,
        ITEMS_PER_PAGE,
        sortBy,
        sortDir
      );
      
      setFavorites(response.items);
      setTotal(response.total);
      setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));

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
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDir('desc');
    }
    setPage(1);
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
        background: GLASS_COLORS.mainColor,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <Header />
      <Container maxWidth="lg">
        {/* Панель навигации */}
        <Box sx={{ mb: 4 }}>
          <NavigationBar 
            showProfile={true}
            showQuestions={true}
            showCompanies={true}
          />
        </Box>
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
              background: GLASS_COLORS.surface,
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: GLASS_COLORS.border,
              color: GLASS_COLORS.primary,
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                background: GLASS_COLORS.surfaceDark,
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ScrollTopIcon />
          </Fab>
        )}

        {/* Уведомления об ошибках */}
        {error && (
          <Fade in={true}>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 3,
                background: alpha(GLASS_COLORS.error, 0.15),
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: alpha(GLASS_COLORS.error, 0.3),
                color: GLASS_COLORS.error,
              }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Заголовок страницы в стеклянном стиле */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: GLASS_COLORS.surface,
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid',
            borderColor: GLASS_COLORS.border,
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '100%',
              background: `linear-gradient(135deg, ${GLASS_COLORS.glassHighlight} 0%, transparent 100%)`,
              opacity: 0.5,
              pointerEvents: 'none',
            },
          }}
        >
          {/* Заголовок с иконкой */}
          <Box sx={{ mb: 4, pb: 3, borderBottom: '1px solid', borderColor: GLASS_COLORS.border }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    background: alpha(GLASS_COLORS.warning, 0.15),
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: alpha(GLASS_COLORS.warning, 0.3),
                    color: GLASS_COLORS.warning,
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
                      fontWeight: 700,
                      color: GLASS_COLORS.textPrimary,
                      fontSize: { xs: '1.75rem', md: '2.25rem' },
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Избранные вопросы
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: GLASS_COLORS.textSecondary,
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
                    background: alpha(GLASS_COLORS.primary, 0.15),
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: alpha(GLASS_COLORS.primary, 0.3),
                    color: GLASS_COLORS.primary,
                    '&:hover': {
                      background: alpha(GLASS_COLORS.primary, 0.25),
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
                    fontWeight: 600,
                    color: GLASS_COLORS.textPrimary,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Общая статистика
                </Typography>
                <IconButton size="small" sx={{ color: GLASS_COLORS.primary }}>
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
                spacing={{ xs: 2, sm: 3 }}
                justifyContent="center"
                sx={{ 
                  mb: 3,
                  '@media (max-width: 400px)': {
                    '& .MuiGrid-item': {
                      width: '100%',
                    }
                  }
                }}
              >
                <Grid item xs={12} sm={6} md={3}>
                  <GlassStatCard
                    title={isMobileFilter ? "Вопросы" : "Всего вопросов"}
                    value={total}
                    subtitle="в избранном"
                    color={GLASS_COLORS.primary}
                    icon={<BookmarkIcon />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <GlassStatCard
                    title="Выполнено"
                    value={completedCount}
                    subtitle="вопросов"
                    color={GLASS_COLORS.success}
                    icon={<CheckCircleIcon />}
                  />
                </Grid>
                {!isMobileFilter && (
                <Grid item xs={12} sm={6} md={3}>
                  <GlassStatCard
                    title="Прогресс"
                    value={completionPercentage}
                    subtitle="от общего числа"
                    color={GLASS_COLORS.warning}
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
              <CircularProgress size={48} sx={{ color: GLASS_COLORS.primary }} />
            </Box>
          )}

          {/* Пустое состояние в стеклянном стиле */}
          {!isLoading && favorites.length === 0 && !error && (
            <Fade in={true}>
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  borderRadius: 4,
                  border: '1px dashed',
                  borderColor: alpha(GLASS_COLORS.border, 0.8),
                  background: alpha(GLASS_COLORS.background, 0.5),
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center',
                }}
              >
                <BookmarkBorderIcon
                  sx={{
                    fontSize: 64,
                    color: GLASS_COLORS.textSecondary,
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: GLASS_COLORS.textPrimary,
                    mb: 1,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Избранное пусто
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: GLASS_COLORS.textSecondary,
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
                    background: `linear-gradient(135deg, ${GLASS_COLORS.primary} 0%, ${alpha(GLASS_COLORS.primary, 0.6)} 100%)`,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: alpha('#FFFFFF', 0.3),
                    borderRadius: 3,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.primary, 0.5)})`,
                      boxShadow: `0 8px 16px ${alpha(GLASS_COLORS.primary, 0.3)}`,
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
                      fontWeight: 600,
                      color: GLASS_COLORS.textPrimary,
                      letterSpacing: '-0.01em',
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
                        background: sortBy === 'added_at' ? alpha(GLASS_COLORS.primary, 0.15) : GLASS_COLORS.surface,
                        backdropFilter: 'blur(10px)',
                        color: sortBy === 'added_at' ? GLASS_COLORS.primary : GLASS_COLORS.textSecondary,
                        border: '1px solid',
                        borderColor: sortBy === 'added_at' ? alpha(GLASS_COLORS.primary, 0.3) : GLASS_COLORS.border,
                        '&:hover': {
                          background: sortBy === 'added_at' ? alpha(GLASS_COLORS.primary, 0.25) : alpha(GLASS_COLORS.primary, 0.1),
                          borderColor: sortBy === 'added_at' ? alpha(GLASS_COLORS.primary, 0.5) : alpha(GLASS_COLORS.primary, 0.3),
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
                        background: sortBy === 'difficulty' ? alpha(GLASS_COLORS.warning, 0.15) : GLASS_COLORS.surface,
                        backdropFilter: 'blur(10px)',
                        color: sortBy === 'difficulty' ? GLASS_COLORS.warning : GLASS_COLORS.textSecondary,
                        border: '1px solid',
                        borderColor: sortBy === 'difficulty' ? alpha(GLASS_COLORS.warning, 0.3) : GLASS_COLORS.border,
                        '&:hover': {
                          background: sortBy === 'difficulty' ? alpha(GLASS_COLORS.warning, 0.25) : alpha(GLASS_COLORS.warning, 0.1),
                          borderColor: sortBy === 'difficulty' ? alpha(GLASS_COLORS.warning, 0.5) : alpha(GLASS_COLORS.warning, 0.3),
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
                        background: sortBy === 'title' ? alpha(GLASS_COLORS.success, 0.15) : GLASS_COLORS.surface,
                        backdropFilter: 'blur(10px)',
                        color: sortBy === 'title' ? GLASS_COLORS.success : GLASS_COLORS.textSecondary,
                        border: '1px solid',
                        borderColor: sortBy === 'title' ? alpha(GLASS_COLORS.success, 0.3) : GLASS_COLORS.border,
                        '&:hover': {
                          background: sortBy === 'title' ? alpha(GLASS_COLORS.success, 0.25) : alpha(GLASS_COLORS.success, 0.1),
                          borderColor: sortBy === 'title' ? alpha(GLASS_COLORS.success, 0.5) : alpha(GLASS_COLORS.success, 0.3),
                        },
                      }}
                    />
                  </Stack>
                </Box>

                {/* Сетка вопросов */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {favorites.map(favorite => (
                    <Grid item xs={12} sm={6} md={4} key={favorite.favorite_id} sx={{ display: 'flex' }}>
                      <GlassFavoriteQuestionCard
                        favorite={favorite}
                        isCompleted={completedQuestions.has(favorite.question_id)}
                        onRemove={handleRemoveFavorite}
                        onNavigate={(id) => navigate(`/questions/${id}`)}
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Пагинация в стеклянном стиле */}
                {totalPages > 1 && (
                  <Fade in={true}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 2, sm: 3 },
                          borderRadius: 4,
                          background: GLASS_COLORS.surface,
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          border: '1px solid',
                          borderColor: GLASS_COLORS.border,
                          width: '100%',
                          maxWidth: '800px',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '100%',
                            background: `linear-gradient(135deg, ${GLASS_COLORS.glassHighlight} 0%, transparent 100%)`,
                            opacity: 0.3,
                            pointerEvents: 'none',
                          },
                        }}
                      >
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
                              borderColor: GLASS_COLORS.border,
                              color: page === 1 ? GLASS_COLORS.textSecondary : GLASS_COLORS.primary,
                              background: GLASS_COLORS.surface,
                              backdropFilter: 'blur(10px)',
                              borderRadius: 3,
                              '&:hover': {
                                borderColor: GLASS_COLORS.primary,
                                background: alpha(GLASS_COLORS.primary, 0.1),
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
                            shape="rounded"
                            siblingCount={isMobile ? 0 : 1}
                            boundaryCount={isMobile ? 1 : 2}
                            sx={{
                              '& .MuiPaginationItem-root': {
                                fontWeight: 600,
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                color: GLASS_COLORS.textSecondary,
                                border: '1px solid',
                                borderColor: GLASS_COLORS.border,
                                background: GLASS_COLORS.surface,
                                backdropFilter: 'blur(10px)',
                                minWidth: { xs: 32, sm: 40 },
                                height: { xs: 32, sm: 40 },
                                margin: { xs: '0 2px', sm: '0 4px' },
                                '&.Mui-selected': {
                                  background: `linear-gradient(135deg, ${GLASS_COLORS.primary} 0%, ${alpha(GLASS_COLORS.primary, 0.6)} 100%)`,
                                  color: 'white',
                                  fontWeight: 700,
                                  borderColor: GLASS_COLORS.primary,
                                  '&:hover': {
                                    background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.primary, 0.5)})`,
                                  },
                                },
                                '&:hover': {
                                  background: alpha(GLASS_COLORS.primary, 0.1),
                                  borderColor: GLASS_COLORS.primary,
                                },
                                '&.MuiPaginationItem-ellipsis': {
                                  border: 'none',
                                  background: 'transparent',
                                  backdropFilter: 'none',
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
                              borderColor: GLASS_COLORS.border,
                              color: page >= totalPages ? GLASS_COLORS.textSecondary : GLASS_COLORS.primary,
                              background: GLASS_COLORS.surface,
                              backdropFilter: 'blur(10px)',
                              borderRadius: 3,
                              '&:hover': {
                                borderColor: GLASS_COLORS.primary,
                                background: alpha(GLASS_COLORS.primary, 0.1),
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
                            <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
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
                                  border: `1px solid ${GLASS_COLORS.border}`,
                                  borderRadius: '8px',
                                  textAlign: 'center',
                                  fontSize: '14px',
                                  color: GLASS_COLORS.textPrimary,
                                  background: GLASS_COLORS.surface,
                                  backdropFilter: 'blur(10px)',
                                }}
                              />
                              <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary, alignSelf: 'center' }}>
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

        {/* Подсказка в стеклянном стиле */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            border: '1px dashed',
            borderColor: alpha(GLASS_COLORS.info, 0.5),
            background: alpha(GLASS_COLORS.info, 0.1),
            backdropFilter: 'blur(10px)',
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ color: GLASS_COLORS.info, fontWeight: 600, letterSpacing: '-0.01em' }}>
              💡 Как использовать избранное:
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
                • Добавляйте в избранное сложные вопросы, чтобы вернуться к ним позже
              </Typography>
              <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
                • Используйте избранное для повторения важного материала
              </Typography>
              <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
                • Отслеживайте свой прогресс по выполненным вопросам
              </Typography>
              <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
                • Удаляйте вопросы из избранного, когда освоите тему
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};