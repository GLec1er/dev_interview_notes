import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  Fade,
  FormControl,
  InputLabel,
  OutlinedInput,
  Grid,
  Collapse,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Info as InfoIcon,
  Shield as ShieldIcon,
  CheckCircle as VerifiedIcon,
  AccessTime as ClockIcon,
  Image as ImageIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  Bolt as BoltIcon,
  Category as CategoryIcon,
  Speed as SpeedIcon,
  EmojiEvents as EmojiEventsIcon,
  Star as StarIcon,
  School as SchoolIcon,
  WorkspacePremium as TrophyIcon,
  AutoAwesome as SparklesIcon,
  Psychology as BrainIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { questionCompletionService } from '../services/questionCompletionService';

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
  easy: '#38A169',
  medium: '#D69E2E',
  hard: '#E53E3E',
  gold: '#D4AF37',
  silver: '#6b6b6bff',
  bronze: '#CD7F32',
};

// Типы ачивок
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: Date;
  category?: 'progress' | 'category' | 'difficulty';
}

// Компонент ачивки с фиксированной высотой
const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.5,
      borderRadius: 2,
      border: `1.5px solid ${achievement.unlocked ? alpha(achievement.color, 0.5) : alpha(NEUTRAL_COLORS.border, 0.3)}`,
      backgroundColor: achievement.unlocked ? alpha(achievement.color, 0.04) : alpha(NEUTRAL_COLORS.background, 0.3),
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      minHeight: 180, // Уменьшенная высота
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 4px 12px ${alpha(achievement.unlocked ? achievement.color : NEUTRAL_COLORS.accent, 0.1)}`,
      },
    }}
  >
    {/* Иконка ачивки - уменьшенная */}
    <Box
      sx={{
        position: 'relative',
        mb: 1.5,
        display: 'flex',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: achievement.unlocked
            ? alpha(achievement.color, 0.1)
            : alpha(NEUTRAL_COLORS.textSecondary, 0.08),
          border: `2px solid ${achievement.unlocked ? achievement.color : alpha(NEUTRAL_COLORS.textSecondary, 0.3)}`,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            fontSize: 22,
            color: achievement.unlocked ? achievement.color : NEUTRAL_COLORS.textSecondary,
          }}
        >
          {achievement.icon}
        </Box>

        {/* Индикатор разблокировки - уменьшенный */}
        {achievement.unlocked && (
          <Box
            sx={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: NEUTRAL_COLORS.gold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${alpha(achievement.color, 0.1)}`,
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)',
              zIndex: 2,
            }}
          >
            <StarIcon sx={{ fontSize: 10, color: NEUTRAL_COLORS.surface }} />
          </Box>
        )}
      </Box>
    </Box>

    {/* Название и описание - уменьшенные */}
    <Box sx={{ flex: 1, mb: 1.5 }}>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          color: achievement.unlocked ? NEUTRAL_COLORS.textPrimary : NEUTRAL_COLORS.textSecondary,
          textAlign: 'center',
          mb: 0.5,
          fontSize: '0.85rem',
          lineHeight: 1.2,
        }}
      >
        {achievement.title}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          color: achievement.unlocked ? alpha(NEUTRAL_COLORS.textSecondary, 0.8) : alpha(NEUTRAL_COLORS.textSecondary, 0.6),
          textAlign: 'center',
          display: 'block',
          fontSize: '0.7rem',
          lineHeight: 1.3,
        }}
      >
        {achievement.description}
      </Typography>
    </Box>

    {/* Прогресс - компактный */}
    <Box sx={{ mt: 'auto' }}>
      <Box sx={{ mb: 0.75 }}>
        <Typography
          variant="caption"
          sx={{
            color: achievement.unlocked ? achievement.color : NEUTRAL_COLORS.textSecondary,
            fontWeight: 500,
            display: 'block',
            textAlign: 'center',
            fontSize: '0.65rem',
          }}
        >
          {achievement.unlocked ? 'Разблокировано!' : `${achievement.progress}/${achievement.target}`}
        </Typography>
      </Box>

      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            height: 4,
            borderRadius: 2,
            backgroundColor: alpha(NEUTRAL_COLORS.border, 0.2),
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${(achievement.progress / achievement.target) * 100}%`,
              height: '100%',
              borderRadius: 2,
              backgroundColor: achievement.unlocked ? achievement.color : NEUTRAL_COLORS.accent,
              transition: 'width 0.6s ease-out',
            }}
          />
        </Box>
      </Box>
    </Box>
  </Paper>
);

// Компонент текстового поля со стилями
const StyledInputField = ({
  label,
  type = 'text',
  value,
  onChange,
  disabled = false,
  startIcon,
  error = false,
  helperText,
  readOnly = false,
  ...props
}: any) => (
  <FormControl fullWidth variant="outlined">
    <InputLabel
      sx={{
        color: NEUTRAL_COLORS.textSecondary,
        '&.Mui-focused': {
          color: NEUTRAL_COLORS.accent,
        },
        '&.Mui-error': {
          color: NEUTRAL_COLORS.error,
        },
      }}
    >
      {label}
    </InputLabel>
    <OutlinedInput
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled || readOnly}
      error={error}
      label={label}
      readOnly={readOnly}
      startAdornment={startIcon ? (
        <Box sx={{ color: NEUTRAL_COLORS.textSecondary, mr: 1 }}>
          {startIcon}
        </Box>
      ) : undefined}
      sx={{
        borderRadius: 2,
        backgroundColor: readOnly ? alpha(NEUTRAL_COLORS.background, 0.5) : NEUTRAL_COLORS.surface,
        '& .MuiOutlinedInput-input': {
          color: NEUTRAL_COLORS.textPrimary,
          '&:read-only': {
            color: NEUTRAL_COLORS.textSecondary,
          },
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: NEUTRAL_COLORS.border,
          borderWidth: 1.5,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: readOnly ? NEUTRAL_COLORS.border : NEUTRAL_COLORS.accent,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: NEUTRAL_COLORS.accent,
          borderWidth: 2,
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: NEUTRAL_COLORS.error,
        },
      }}
      {...props}
    />
    {helperText && (
      <Typography
        variant="caption"
        sx={{
          mt: 0.5,
          color: error ? NEUTRAL_COLORS.error : NEUTRAL_COLORS.textSecondary,
          fontSize: '0.75rem',
        }}
      >
        {helperText}
      </Typography>
    )}
  </FormControl>
);

const StyledButton = ({
  children,
  variant = 'contained',
  startIcon,
  onClick,
  disabled = false,
  fullWidth = true,
  size = 'large',
  type = 'button',
  ...props
}: any) => (
  <Button
    variant={variant}
    startIcon={startIcon}
    onClick={onClick}
    disabled={disabled}
    fullWidth={fullWidth}
    size={size}
    type={type}
    {...props}
    sx={{
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: 2,
      py: 1.5,
      fontSize: '1rem',
      letterSpacing: '0.3px',
      transition: 'all 0.2s ease',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      ...(variant === 'contained' && {
        background: `linear-gradient(135deg, ${NEUTRAL_COLORS.accent} 0%, ${alpha(NEUTRAL_COLORS.accent, 0.9)} 100%)`,
        boxShadow: '0 2px 10px rgba(49, 130, 206, 0.2)',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(49, 130, 206, 0.3)',
          transform: 'translateY(-1px)',
        },
        '&:disabled': {
          background: alpha(NEUTRAL_COLORS.secondary, 0.2),
          color: alpha(NEUTRAL_COLORS.textSecondary, 0.5),
        },
      }),
      ...(variant === 'outlined' && {
        borderWidth: 1.5,
        borderColor: NEUTRAL_COLORS.border,
        color: NEUTRAL_COLORS.textPrimary,
        '&:hover': {
          borderColor: NEUTRAL_COLORS.accent,
          backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
        },
      }),
      ...(variant === 'text' && {
        color: NEUTRAL_COLORS.accent,
        '&:hover': {
          backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
        },
      }),
    }}
  >
    {children}
  </Button>
);

// Компонент для отображения информационного поля (только для чтения)
const InfoField = ({
  label,
  value,
  icon,
  verified = false,
}: {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
  verified?: boolean;
}) => (
  <Box
    sx={{
      p: 2.5,
      borderRadius: 2,
      backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
      border: `1px solid ${NEUTRAL_COLORS.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: alpha(NEUTRAL_COLORS.background, 0.8),
        borderColor: alpha(NEUTRAL_COLORS.accent, 0.3),
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
      {icon && (
        <Box
          sx={{
            p: 1,
            borderRadius: '50%',
            backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
            color: NEUTRAL_COLORS.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: NEUTRAL_COLORS.textSecondary,
            display: 'block',
            mb: 0.5,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.75rem',
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: NEUTRAL_COLORS.textPrimary,
            fontWeight: 500,
            fontSize: '1rem',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
    {verified && (
      <Tooltip title="Подтверждено">
        <VerifiedIcon
          sx={{
            color: NEUTRAL_COLORS.success,
            fontSize: 20,
            flexShrink: 0,
            ml: 1,
          }}
        />
      </Tooltip>
    )}
  </Box>
);

// Компонент статистической карточки
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  color, 
  icon,
  percentage = false 
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

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, updateProfile, error: authError, clearError } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Редактируемые поля
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  // Статистика выполнения
  const [completionStats, setCompletionStats] = useState<any>(null);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Ачивки
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalAchievements, setTotalAchievements] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState(0);
  const [isAchievementsVisible, setIsAchievementsVisible] = useState(false);

  // Функция для создания ачивок на основе статистики
  const createAchievements = useCallback((stats: any, categoryStats: any[]) => {
    const newAchievements: Achievement[] = [];
    const now = new Date();

    // Прогресс общий
    newAchievements.push({
      id: 'progress_25',
      title: 'Новичок',
      description: 'Выполните 25% всех вопросов',
      icon: <SchoolIcon />,
      color: NEUTRAL_COLORS.accent,
      progress: Math.min(stats.overall_percentage, 25),
      target: 25,
      unlocked: stats.overall_percentage >= 25,
      unlockedAt: stats.overall_percentage >= 25 ? now : undefined,
      category: 'progress',
    });

    newAchievements.push({
      id: 'progress_50',
      title: 'Знаток',
      description: 'Выполните 50% всех вопросов',
      icon: <BrainIcon />,
      color: NEUTRAL_COLORS.bronze,
      progress: Math.min(stats.overall_percentage, 50),
      target: 50,
      unlocked: stats.overall_percentage >= 50,
      unlockedAt: stats.overall_percentage >= 50 ? now : undefined,
      category: 'progress',
    });

    newAchievements.push({
      id: 'progress_75',
      title: 'Эксперт',
      description: 'Выполните 75% всех вопросов',
      icon: <TrophyIcon />,
      color: NEUTRAL_COLORS.silver,
      progress: Math.min(stats.overall_percentage, 75),
      target: 75,
      unlocked: stats.overall_percentage >= 75,
      unlockedAt: stats.overall_percentage >= 75 ? now : undefined,
      category: 'progress',
    });

    newAchievements.push({
      id: 'progress_100',
      title: 'Мастер',
      description: 'Выполните 100% всех вопросов',
      icon: <SparklesIcon />,
      color: NEUTRAL_COLORS.gold,
      progress: Math.min(stats.overall_percentage, 100),
      target: 100,
      unlocked: stats.overall_percentage >= 100,
      unlockedAt: stats.overall_percentage >= 100 ? now : undefined,
      category: 'progress',
    });

    // Сложность
    if (stats.total_easy > 0) {
      newAchievements.push({
        id: 'easy_master',
        title: 'Мастер простых',
        description: `Выполните все легкие вопросы (${stats.total_easy})`,
        icon: <BoltIcon />,
        color: NEUTRAL_COLORS.easy,
        progress: stats.easy_completed,
        target: stats.total_easy,
        unlocked: stats.easy_completed >= stats.total_easy,
        unlockedAt: stats.easy_completed >= stats.total_easy ? now : undefined,
        category: 'difficulty',
      });
    }

    if (stats.total_medium > 0) {
      newAchievements.push({
        id: 'medium_master',
        title: 'Мастер средних',
        description: `Выполните все средние вопросы (${stats.total_medium})`,
        icon: <BarChartIcon />,
        color: NEUTRAL_COLORS.medium,
        progress: stats.medium_completed,
        target: stats.total_medium,
        unlocked: stats.medium_completed >= stats.total_medium,
        unlockedAt: stats.medium_completed >= stats.total_medium ? now : undefined,
        category: 'difficulty',
      });
    }

    if (stats.total_hard > 0) {
      newAchievements.push({
        id: 'hard_master',
        title: 'Мастер сложных',
        description: `Выполните все сложные вопросы (${stats.total_hard})`,
        icon: <SpeedIcon />,
        color: NEUTRAL_COLORS.hard,
        progress: stats.hard_completed,
        target: stats.total_hard,
        unlocked: stats.hard_completed >= stats.total_hard,
        unlockedAt: stats.hard_completed >= stats.total_hard ? now : undefined,
        category: 'difficulty',
      });
    }

    // Ачивки по категориям (первые 5 категорий с наилучшим прогрессом)
    const topCategories = [...categoryStats]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5); // Изменено с 3 на 5

    topCategories.forEach((category, index) => {
      if (category.total_count > 0) {
        // Определяем цвета для 5 категорий
        const categoryColors = [
          NEUTRAL_COLORS.gold,     // 1-е место
          NEUTRAL_COLORS.silver,   // 2-е место
          NEUTRAL_COLORS.bronze,   // 3-е место
          '#2b55c1ff',               // 4-е место (сине-серый)
          '#d23d6fff',               // 5-е место (фиолетовый)
        ];
        
        // Определяем иконки для разных позиций
        const categoryIcons = [
          <TrophyIcon />,           // 1-е место
          <EmojiEventsIcon />,      // 2-е место
          <StarIcon />,             // 3-е место
          <CategoryIcon />,         // 4-е место
          <CategoryIcon />,         // 5-е место
        ];
        
        // Определяем названия для ачивок
        const achievementTitles = [
          `${category.category_name}`,    // 1-е место
          `${category.category_name}`,  // 2-е место
          `${category.category_name}`, // 3-е место
          `${category.category_name}`, // 4-е место
          `${category.category_name}`,  // 5-е место
        ];
        
        newAchievements.push({
          id: `category_top_${index + 1}`,
          title: achievementTitles[index] || `Топ ${index + 1} в ${category.category_name}`,
          description: `Достигните 100% в категории`,
          icon: categoryIcons[index] || <CategoryIcon />,
          color: categoryColors[index] || NEUTRAL_COLORS.secondary,
          progress: category.percentage,
          target: 90,
          unlocked: category.percentage >= 100,
          unlockedAt: category.percentage >= 100 ? now : undefined,
          category: 'category',
        });
      }
    });

    // Посчитаем статистику ачивок
    const unlocked = newAchievements.filter(a => a.unlocked).length;
    setUnlockedAchievements(unlocked);
    setTotalAchievements(newAchievements.length);

    return newAchievements;
  }, []);

  // Обновляем локальное состояние при изменении пользователя
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  // Загружаем статистику выполнения и создаем ачивки
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoadingStats(true);
        const stats = await questionCompletionService.getCompletionStats();
        setCompletionStats(stats);

        const categoryStatsData = await questionCompletionService.getCompletionStatsByCategory();
        setCategoryStats(categoryStatsData.items || []);

        // Создаем ачивки на основе статистики
        const newAchievements = createAchievements(stats, categoryStatsData.items || []);
        setAchievements(newAchievements);
      } catch (err) {
        console.error('Failed to load completion stats:', err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStats();
  }, [createAchievements]);

  const handleSaveChanges = useCallback(async () => {
    setLocalError('');
    setSuccessMessage('');
    clearError();

    // Валидация
    if (!firstName.trim() || !lastName.trim()) {
      setLocalError('Имя и фамилия не могут быть пустыми');
      return;
    }

    if (firstName.trim().length < 2) {
      setLocalError('Имя должно содержать минимум 2 символа');
      return;
    }

    if (lastName.trim().length < 2) {
      setLocalError('Фамилия должна содержать минимум 2 символа');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile(firstName.trim(), lastName.trim(), avatarUrl.trim() || undefined);
      setSuccessMessage('Профиль успешно обновлен');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Ошибка при обновлении профиля';
      setLocalError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  }, [firstName, lastName, avatarUrl, updateProfile, clearError]);

  const handleCancel = useCallback(() => {
    setFirstName(user?.first_name || '');
    setLastName(user?.last_name || '');
    setAvatarUrl(user?.avatar_url || '');
    setIsEditing(false);
    setLocalError('');
  }, [user]);

  if (authLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${NEUTRAL_COLORS.background} 0%, ${alpha(NEUTRAL_COLORS.background, 0.8)} 100%)`,
        }}
      >
        <CircularProgress size={48} sx={{ color: NEUTRAL_COLORS.accent }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2, color: NEUTRAL_COLORS.accent }}
        >
          Вернуться на главную
        </Button>
        
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Пользователь не найден. Пожалуйста, авторизуйтесь.
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${NEUTRAL_COLORS.background} 0%, ${alpha(NEUTRAL_COLORS.background, 0.8)} 100%)`,
        py: 4,
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        {/* Кнопка назад */}
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ 
            mb: 3,
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center'
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/questions')}
            sx={{
              borderRadius: 2,
              backgroundColor: NEUTRAL_COLORS.accent,
              color: NEUTRAL_COLORS.surface,
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.9),
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(NEUTRAL_COLORS.accent, 0.3)}`,
              },
              transition: 'all 0.2s',
            }}
            variant="contained"
          >
            К вопросам
          </Button>
          
          {/* Кнопка перехода к избранным вопросам */}
          <Button
            startIcon={<FavoriteIcon />}
            onClick={() => navigate('/favorites')}
            sx={{
              borderRadius: 2,
              backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
              color: NEUTRAL_COLORS.accent,
              border: `2px solid ${alpha(NEUTRAL_COLORS.accent, 0.3)}`,
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.2),
                borderColor: alpha(NEUTRAL_COLORS.accent, 0.6),
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(NEUTRAL_COLORS.accent, 0.2)}`,
              },
              transition: 'all 0.2s',
            }}
            variant="outlined"
          >
            Избранные вопросы
          </Button>
        </Stack>

        {/* Уведомления */}
        {(authError || localError) && (
          <Fade in>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                border: `1px solid ${alpha(NEUTRAL_COLORS.error, 0.2)}`,
              }}
              onClose={() => {
                clearError();
                setLocalError('');
              }}
            >
              {authError || localError}
            </Alert>
          </Fade>
        )}

        {successMessage && (
          <Fade in>
            <Alert
              severity="success"
              sx={{
                mb: 3,
                borderRadius: 2,
                border: `1px solid ${alpha(NEUTRAL_COLORS.success, 0.2)}`,
              }}
              onClose={() => setSuccessMessage('')}
            >
              {successMessage}
            </Alert>
          </Fade>
        )}

        {/* Кнопка для просмотра ачивок - привлекательная и мотивирующая */}
        {!isLoadingStats && achievements.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `2px solid ${alpha(NEUTRAL_COLORS.gold, 0.3)}`,
              backgroundColor: alpha(NEUTRAL_COLORS.gold, 0.05),
              mb: 3,
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(NEUTRAL_COLORS.gold, 0.15)}`,
                borderColor: alpha(NEUTRAL_COLORS.gold, 0.5),
                backgroundColor: alpha(NEUTRAL_COLORS.gold, 0.08),
              },
            }}
            onClick={() => setIsAchievementsVisible(!isAchievementsVisible)}
          >
            {/* Анимированные элементы фона */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at 30% 50%, ${alpha(NEUTRAL_COLORS.gold, 0.1)} 0%, transparent 50%),
                            radial-gradient(circle at 70% 20%, ${alpha(NEUTRAL_COLORS.silver, 0.08)} 0%, transparent 50%),
                            radial-gradient(circle at 20% 80%, ${alpha(NEUTRAL_COLORS.bronze, 0.08)} 0%, transparent 50%)`,
                zIndex: 0,
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '50%',
                      backgroundColor: alpha(NEUTRAL_COLORS.gold, 0.2),
                      color: NEUTRAL_COLORS.gold,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${alpha(NEUTRAL_COLORS.gold, 0.3)}`,
                      boxShadow: `0 0 20px ${alpha(NEUTRAL_COLORS.gold, 0.3)}`,
                    }}
                  >
                    <TrophyIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        color: NEUTRAL_COLORS.textPrimary,
                        background: `linear-gradient(90deg, ${NEUTRAL_COLORS.gold} 0%, ${NEUTRAL_COLORS.silver} 50%, ${NEUTRAL_COLORS.bronze} 100%)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: { xs: '1.4rem', md: '1.6rem' },
                      }}
                    >
                      {isAchievementsVisible ? 'Скрыть достижения' : 'Показать мои достижения'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: NEUTRAL_COLORS.textSecondary,
                        mt: 0.5,
                        fontWeight: 500,
                      }}
                    >
                      {isAchievementsVisible 
                        ? 'Нажмите, чтобы скрыть' 
                        : `У вас разблокировано ${unlockedAchievements} из ${totalAchievements} достижений!`}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {/* Индикатор прогресса */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: alpha(NEUTRAL_COLORS.background, 0.8),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${alpha(NEUTRAL_COLORS.gold, 0.3)}`,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: NEUTRAL_COLORS.gold,
                        fontSize: '1.1rem',
                      }}
                    >
                      {Math.round((unlockedAchievements / totalAchievements) * 100)}%
                    </Typography>
                    <CircularProgress
                      variant="determinate"
                      value={(unlockedAchievements / totalAchievements) * 100}
                      size={64}
                      thickness={4}
                      sx={{
                        position: 'absolute',
                        color: NEUTRAL_COLORS.gold,
                        top: -2,
                        left: -2,
                      }}
                    />
                  </Box>

                  {/* Иконка стрелки */}
                  <IconButton
                    sx={{
                      backgroundColor: alpha(NEUTRAL_COLORS.gold, 0.2),
                      color: NEUTRAL_COLORS.gold,
                      '&:hover': {
                        backgroundColor: alpha(NEUTRAL_COLORS.gold, 0.3),
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isAchievementsVisible ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Основной блок ачивок (скрыт по умолчанию) */}
        <Collapse in={isAchievementsVisible}>
          {!isLoadingStats && achievements.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                border: `1px solid ${NEUTRAL_COLORS.border}`,
                backgroundColor: NEUTRAL_COLORS.surface,
                mb: 3,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Фоновые элементы */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -60,
                  right: -60,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  backgroundColor: alpha(NEUTRAL_COLORS.gold, 0.03),
                  zIndex: 0,
                }}
              />

              {/* Заголовок с прогрессом ачивок */}
              <Box sx={{ position: 'relative', zIndex: 1, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: '50%',
                        backgroundColor: alpha(NEUTRAL_COLORS.gold, 0.1),
                        color: NEUTRAL_COLORS.gold,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TrophyIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: NEUTRAL_COLORS.textPrimary,
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                        }}
                      >
                        {unlockedAchievements} из {totalAchievements} разблокировано
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Прогресс-бар */}
                <Box sx={{ position: 'relative' }}>
                  <Box
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(NEUTRAL_COLORS.border, 0.2),
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${(unlockedAchievements / totalAchievements) * 100}%`,
                        height: '100%',
                        borderRadius: 3,
                        background: `linear-gradient(90deg, ${NEUTRAL_COLORS.bronze} 0%, ${NEUTRAL_COLORS.silver} 50%, ${NEUTRAL_COLORS.gold} 100%)`,
                        transition: 'width 1s ease-out',
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Группировка ачивок по категориям */}
              {Object.entries(
                achievements.reduce((acc, achievement) => {
                  const category = achievement.category || 'other';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(achievement);
                  return acc;
                }, {} as Record<string, Achievement[]>)
              ).map(([category, categoryAchievements]) => {
                const categoryInfo = {
                  progress: { title: 'Общий прогресс', icon: <TrendingUpIcon />, color: NEUTRAL_COLORS.success },
                  category: { title: 'По категориям - достигните 100% в каждой категории', icon: <CategoryIcon />, color: NEUTRAL_COLORS.info },
                  difficulty: { title: 'По сложности', icon: <SpeedIcon />, color: NEUTRAL_COLORS.warning },
                  other: { title: 'Другие', icon: <EmojiEventsIcon />, color: NEUTRAL_COLORS.secondary },
                }[category] || { title: category, icon: <EmojiEventsIcon />, color: NEUTRAL_COLORS.secondary };

                return (
                  <Box key={category} sx={{ mb: 3 }}>
                    {/* Заголовок категории */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mb: 1.5,
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: alpha(categoryInfo.color, 0.05),
                      }}
                    >
                      <Box
                        sx={{
                          p: 0.75,
                          borderRadius: '50%',
                          backgroundColor: alpha(categoryInfo.color, 0.1),
                          color: categoryInfo.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {categoryInfo.icon}
                      </Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: NEUTRAL_COLORS.textPrimary,
                        }}
                      >
                        {categoryInfo.title}
                      </Typography>
                      <Chip
                        label={categoryAchievements.length}
                        size="small"
                        sx={{
                          backgroundColor: alpha(categoryInfo.color, 0.1),
                          color: categoryInfo.color,
                          fontWeight: 600,
                          height: 20,
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>

                    {/* Сетка ачивок категории */}
                    {/* Сетка ачивок категории - настройка для 5 элементов */}
                    <Grid container spacing={2}>
                      {categoryAchievements.map((achievement) => (
                        <Grid 
                          item 
                          xs={6} 
                          sm={4} 
                          md={2.4} // Было 2.4 для 3 категорий, для 5 лучше использовать 2.4
                          lg={2.4} 
                          key={achievement.id}
                        >
                          <AchievementCard achievement={achievement} />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                );
              })}
            </Paper>
          )}
        </Collapse>

        {/* Основная карточка профиля */}
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
          {/* Заголовок с кнопкой редактирования */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 4,
              pb: 3,
              borderBottom: `1px solid ${alpha(NEUTRAL_COLORS.border, 0.5)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '50%',
                  backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                  color: NEUTRAL_COLORS.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonIcon sx={{ fontSize: 32 }} />
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
                  Мой профиль
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: NEUTRAL_COLORS.textSecondary,
                    mt: 0.5,
                  }}
                >
                  Управляйте информацией вашего аккаунта
                </Typography>
              </Box>
            </Box>

            {!isEditing && (
              <Tooltip title="Редактировать профиль">
                <IconButton
                  onClick={() => setIsEditing(true)}
                  sx={{
                    backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                    color: NEUTRAL_COLORS.accent,
                    '&:hover': {
                      backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.2),
                    },
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Содержимое профиля */}
          {!isEditing ? (
            // Режим просмотра
            <Stack spacing={3}>
              {/* Аватар */}
              {user.avatar_url && (
                <InfoField
                  label="Аватар"
                  value={
                    <Box
                      component="img"
                      src={user.avatar_url}
                      alt="Avatar"
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 2,
                        objectFit: 'cover',
                        border: `2px solid ${NEUTRAL_COLORS.border}`,
                      }}
                    />
                  }
                  icon={<ImageIcon />}
                />
              )}

              {/* Имя */}
              <InfoField
                label="Имя"
                value={user.first_name}
                icon={<PersonIcon />}
              />

              {/* Фамилия */}
              <InfoField
                label="Фамилия"
                value={user.last_name}
                icon={<PersonIcon />}
              />

              {/* Email */}
              <InfoField
                label="Email"
                value={user.email}
                icon={<EmailIcon />}
                verified={user.email_verified}
              />

              {/* Роль */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
                  border: `1px solid ${NEUTRAL_COLORS.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: '50%',
                      backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                      color: NEUTRAL_COLORS.success,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShieldIcon />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: NEUTRAL_COLORS.textSecondary,
                        display: 'block',
                        mb: 0.5,
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.75rem',
                      }}
                    >
                      Роль
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: NEUTRAL_COLORS.textPrimary,
                        fontWeight: 500,
                        fontSize: '1rem',
                      }}
                    >
                      {user.is_admin ? 'Администратор' : 'Пользователь'}
                    </Typography>
                  </Box>
                </Box>
                {user.is_admin && (
                  <Chip
                    label="Admin"
                    size="small"
                    sx={{
                      backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                      color: NEUTRAL_COLORS.success,
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>

              {/* Статус активности */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
                  border: `1px solid ${NEUTRAL_COLORS.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: '50%',
                      backgroundColor: alpha(
                        user.is_active ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.error,
                        0.1
                      ),
                      color: user.is_active ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.error,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <VerifiedIcon />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: NEUTRAL_COLORS.textSecondary,
                        display: 'block',
                        mb: 0.5,
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.75rem',
                      }}
                    >
                      Статус аккаунта
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: NEUTRAL_COLORS.textPrimary,
                        fontWeight: 500,
                        fontSize: '1rem',
                      }}
                    >
                      {user.is_active ? 'Активен' : 'Неактивен'}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={user.is_active ? 'Активен' : 'Неактивен'}
                  size="small"
                  sx={{
                    backgroundColor: alpha(
                      user.is_active ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.error,
                      0.1
                    ),
                    color: user.is_active ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.error,
                    fontWeight: 600,
                  }}
                />
              </Box>

              {/* Последний вход */}
              {user.last_login && (
                <InfoField
                  label="Последний вход"
                  value={new Date(user.last_login).toLocaleString('ru-RU')}
                  icon={<ClockIcon />}
                />
              )}
            </Stack>
          ) : (
            // Режим редактирования
            <Stack spacing={3}>
              <StyledInputField
                label="Имя"
                type="text"
                value={firstName}
                onChange={(e: any) => setFirstName(e.target.value)}
                disabled={isSaving}
                startIcon={<PersonIcon sx={{ color: NEUTRAL_COLORS.textSecondary }} />}
              />

              <StyledInputField
                label="Фамилия"
                type="text"
                value={lastName}
                onChange={(e: any) => setLastName(e.target.value)}
                disabled={isSaving}
                startIcon={<PersonIcon sx={{ color: NEUTRAL_COLORS.textSecondary }} />}
              />

              {/* <StyledInputField
                label="URL аватара (опционально)"
                type="url"
                value={avatarUrl}
                onChange={(e: any) => setAvatarUrl(e.target.value)}
                disabled={isSaving}
                startIcon={<ImageIcon sx={{ color: NEUTRAL_COLORS.textSecondary }} />}
                helperText="Введите полный URL изображения (например, https://example.com/avatar.jpg)"
              /> */}

              {/* Кнопки действий */}
              <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                <StyledButton
                  variant="contained"
                  startIcon={isSaving ? null : <SaveIcon />}
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  fullWidth
                >
                  {isSaving ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Сохранить изменения'
                  )}
                </StyledButton>

                <StyledButton
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={isSaving}
                  fullWidth
                >
                  Отмена
                </StyledButton>
              </Box>
            </Stack>
          )}
        </Paper>

        {/* Статистика выполнения */}
        {!isLoadingStats && completionStats && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: `1px solid ${NEUTRAL_COLORS.border}`,
              backgroundColor: NEUTRAL_COLORS.surface,
              mb: 4,
            }}
          >
            {/* Заголовок */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: `1px solid ${alpha(NEUTRAL_COLORS.border, 0.5)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                    color: NEUTRAL_COLORS.success,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <EmojiEventsIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: NEUTRAL_COLORS.textPrimary,
                      fontSize: { xs: '1.5rem', md: '2rem' },
                    }}
                  >
                    Ваша статистика
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: NEUTRAL_COLORS.textSecondary,
                      mt: 0.5,
                    }}
                  >
                    Подробная статистика выполнения вопросов
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Общие карточки статистики */}
            <Box sx={{ mb: 5 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: NEUTRAL_COLORS.textPrimary,
                  mb: 3,
                }}
              >
                Общая статистика
              </Typography>
              
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(4, 1fr)',
                  },
                  gap: 3,
                }}
              >
                <StatCard
                  title="Общий прогресс"
                  value={completionStats.overall_percentage.toFixed(1)}
                  subtitle={`${completionStats.total_completed} из ${completionStats.total} вопросов`}
                  color={NEUTRAL_COLORS.success}
                  icon={<TrendingUpIcon />}
                  percentage
                />

                <StatCard
                  title="Легкие вопросы"
                  value={completionStats.easy_completed}
                  subtitle={`из ${completionStats.total_easy} доступных`}
                  color={NEUTRAL_COLORS.easy}
                  icon={<BoltIcon />}
                />

                <StatCard
                  title="Средние вопросы"
                  value={completionStats.medium_completed}
                  subtitle={`из ${completionStats.total_medium} доступных`}
                  color={NEUTRAL_COLORS.medium}
                  icon={<BarChartIcon />}
                />

                <StatCard
                  title="Сложные вопросы"
                  value={completionStats.hard_completed}
                  subtitle={`из ${completionStats.total_hard} доступных`}
                  color={NEUTRAL_COLORS.hard}
                  icon={<SpeedIcon />}
                />
              </Box>
            </Box>
          </Paper>
        )}

        {/* Статистика по категориям */}
        {!isLoadingStats && categoryStats.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: `1px solid ${NEUTRAL_COLORS.border}`,
              backgroundColor: NEUTRAL_COLORS.surface,
              mb: 4,
            }}
          >
            {/* Заголовок */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: `1px solid ${alpha(NEUTRAL_COLORS.border, 0.5)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    backgroundColor: alpha(NEUTRAL_COLORS.info, 0.1),
                    color: NEUTRAL_COLORS.info,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CategoryIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: NEUTRAL_COLORS.textPrimary,
                      fontSize: { xs: '1.5rem', md: '2rem' },
                    }}
                  >
                    Статистика по темам
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: NEUTRAL_COLORS.textSecondary,
                      mt: 0.5,
                    }}
                  >
                    Ваш прогресс в каждой категории
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Список категорий */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
              }}
            >
              {categoryStats.map((category) => (
                <Paper
                  key={category.category_id}
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
                    border: `1px solid ${NEUTRAL_COLORS.border}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${alpha(NEUTRAL_COLORS.accent, 0.1)}`,
                      borderColor: alpha(NEUTRAL_COLORS.accent, 0.3),
                    },
                  }}
                >
                  {/* Заголовок категории */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: NEUTRAL_COLORS.textPrimary,
                        lineHeight: 1.3,
                      }}
                    >
                      {category.category_name}
                    </Typography>
                    <Chip
                      label={`${category.percentage.toFixed(1)}%`}
                      size="small"
                      sx={{
                        backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                        color: NEUTRAL_COLORS.accent,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>

                  {/* Прогресс-бар */}
                  <Box
                    sx={{
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(NEUTRAL_COLORS.border, 0.3),
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          width: `${Math.min(category.percentage, 100)}%`,
                          backgroundColor: NEUTRAL_COLORS.accent,
                          borderRadius: 4,
                          transition: 'width 0.6s ease-out',
                          backgroundImage: `linear-gradient(90deg, ${NEUTRAL_COLORS.accent} 0%, ${alpha(NEUTRAL_COLORS.accent, 0.8)} 100%)`,
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Статистика */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: NEUTRAL_COLORS.textSecondary,
                        fontWeight: 600,
                      }}
                    >
                      {category.completed_count} из {category.total_count}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: NEUTRAL_COLORS.textSecondary,
                        fontWeight: 500,
                      }}
                    >
                      вопросов выполнено
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Paper>
        )}

        {/* Итоговая информация */}
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
            <Typography
              variant="h6"
              sx={{
                color: NEUTRAL_COLORS.info,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <InfoIcon />
              Итоговая информация
            </Typography>
            {completionStats && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ color: NEUTRAL_COLORS.textPrimary, fontWeight: 500 }}
                >
                  • Всего выполнено вопросов: <strong>{completionStats.total_completed}</strong>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: NEUTRAL_COLORS.textPrimary, fontWeight: 500 }}
                >
                  • Общий прогресс: <strong>{completionStats.overall_percentage.toFixed(1)}%</strong>
                </Typography>
                {achievements.length > 0 && (
                  <Typography
                    variant="body2"
                    sx={{ color: NEUTRAL_COLORS.textPrimary, fontWeight: 500 }}
                  >
                    • Разблокировано ачивок: <strong>{unlockedAchievements}/{totalAchievements}</strong>
                  </Typography>
                )}
              </Box>
            )}
            <Typography
              variant="caption"
              sx={{
                color: NEUTRAL_COLORS.textSecondary,
                fontStyle: 'italic',
                mt: 1,
              }}
            >
              Продолжайте изучать вопросы для улучшения вашей статистики и получения новых ачивок!
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};