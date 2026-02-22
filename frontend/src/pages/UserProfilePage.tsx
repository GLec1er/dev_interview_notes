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
  useMediaQuery,
  useTheme as useMuiTheme,
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
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme as useThemeContext } from '../context/ThemeContext';

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

// Компонент ачивки в стеклянном стиле
const GlassAchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.5,
      borderRadius: 3,
      background: GLASS_COLORS.surface,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1.5px solid',
      borderColor: achievement.unlocked ? alpha(achievement.color, 0.5) : GLASS_COLORS.border,
      height: '100%',
      minHeight: 180,
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
        background: `radial-gradient(circle at 30% 30%, ${achievement.color} 0%, transparent 70%)`,
        opacity: achievement.unlocked ? 0.2 : 0,
        zIndex: -1,
        filter: 'blur(30px)',
        transition: 'opacity 0.4s ease',
      },
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 16px 32px ${alpha(achievement.unlocked ? achievement.color : GLASS_COLORS.primary, 0.15)}`,
        borderColor: achievement.unlocked ? achievement.color : GLASS_COLORS.borderGlow,
        '&::before': {
          opacity: 1,
        },
        '&::after': {
          opacity: 0.3,
        },
      },
    }}
  >
    {/* Иконка ачивки */}
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
          background: achievement.unlocked
            ? alpha(achievement.color, 0.15)
            : alpha(GLASS_COLORS.background, 0.5),
          backdropFilter: 'blur(10px)',
          border: '2px solid',
          borderColor: achievement.unlocked ? achievement.color : alpha(GLASS_COLORS.textSecondary, 0.3),
          position: 'relative',
        }}
      >
        <Box
          sx={{
            fontSize: 22,
            color: achievement.unlocked ? achievement.color : GLASS_COLORS.textSecondary,
          }}
        >
          {achievement.icon}
        </Box>

        {/* Индикатор разблокировки */}
        {achievement.unlocked && (
          <Box
            sx={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${GLASS_COLORS.gold}, ${alpha(GLASS_COLORS.gold, 0.7)})`,
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: alpha('#FFFFFF', 0.3),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              zIndex: 2,
            }}
          >
            <StarIcon sx={{ fontSize: 10, color: 'white' }} />
          </Box>
        )}
      </Box>
    </Box>

    {/* Название и описание */}
    <Box sx={{ flex: 1, mb: 1.5 }}>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          color: achievement.unlocked ? GLASS_COLORS.textPrimary : GLASS_COLORS.textSecondary,
          textAlign: 'center',
          mb: 0.5,
          fontSize: '0.85rem',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
        }}
      >
        {achievement.title}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          color: achievement.unlocked ? alpha(GLASS_COLORS.textSecondary, 0.8) : alpha(GLASS_COLORS.textSecondary, 0.6),
          textAlign: 'center',
          display: 'block',
          fontSize: '0.7rem',
          lineHeight: 1.3,
        }}
      >
        {achievement.description}
      </Typography>
    </Box>

    {/* Прогресс */}
    <Box sx={{ mt: 'auto' }}>
      <Box sx={{ mb: 0.75 }}>
        <Typography
          variant="caption"
          sx={{
            color: achievement.unlocked ? achievement.color : GLASS_COLORS.textSecondary,
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
            backgroundColor: alpha(GLASS_COLORS.border, 0.5),
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box
            sx={{
              width: `${(achievement.progress / achievement.target) * 100}%`,
              height: '100%',
              borderRadius: 2,
              background: `linear-gradient(90deg, ${achievement.unlocked ? achievement.color : GLASS_COLORS.primary}, ${alpha(achievement.unlocked ? achievement.color : GLASS_COLORS.primary, 0.6)})`,
              transition: 'width 0.6s ease-out',
              boxShadow: `0 2px 8px ${alpha(achievement.unlocked ? achievement.color : GLASS_COLORS.primary, 0.3)}`,
            }}
          />
        </Box>
      </Box>
    </Box>
  </Paper>
);

// Компонент текстового поля в стеклянном стиле
const GlassInputField = ({
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
        color: GLASS_COLORS.textSecondary,
        '&.Mui-focused': {
          color: GLASS_COLORS.primary,
        },
        '&.Mui-error': {
          color: GLASS_COLORS.error,
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
        <Box sx={{ color: GLASS_COLORS.textSecondary, mr: 1 }}>
          {startIcon}
        </Box>
      ) : undefined}
      sx={{
        borderRadius: 3,
        background: readOnly ? alpha(GLASS_COLORS.background, 0.5) : GLASS_COLORS.surface,
        backdropFilter: 'blur(10px)',
        '& .MuiOutlinedInput-input': {
          color: GLASS_COLORS.textPrimary,
          '&:read-only': {
            color: GLASS_COLORS.textSecondary,
          },
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: GLASS_COLORS.border,
          borderWidth: 1.5,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: readOnly ? GLASS_COLORS.border : GLASS_COLORS.primary,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: GLASS_COLORS.primary,
          borderWidth: 2,
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: GLASS_COLORS.error,
        },
      }}
      {...props}
    />
    {helperText && (
      <Typography
        variant="caption"
        sx={{
          mt: 0.5,
          color: error ? GLASS_COLORS.error : GLASS_COLORS.textSecondary,
          fontSize: '0.75rem',
        }}
      >
        {helperText}
      </Typography>
    )}
  </FormControl>
);

// Стилизованная кнопка в стеклянном стиле
const GlassButton = ({
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
      borderRadius: 3,
      py: 1.5,
      fontSize: '1rem',
      letterSpacing: '-0.01em',
      transition: 'all 0.3s ease',
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      ...(variant === 'contained' && {
        background: `linear-gradient(135deg, ${GLASS_COLORS.primary} 0%, ${alpha(GLASS_COLORS.primary, 0.7)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: alpha('#FFFFFF', 0.3),
        boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.primary, 0.2)}`,
        '&:hover': {
          background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.primary, 0.6)})`,
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 20px ${alpha(GLASS_COLORS.primary, 0.3)}`,
        },
        '&:disabled': {
          background: alpha(GLASS_COLORS.surface, 0.5),
          color: alpha(GLASS_COLORS.textSecondary, 0.5),
        },
      }),
      ...(variant === 'outlined' && {
        borderWidth: 1.5,
        borderColor: GLASS_COLORS.border,
        color: GLASS_COLORS.textPrimary,
        background: GLASS_COLORS.surface,
        backdropFilter: 'blur(10px)',
        '&:hover': {
          borderColor: GLASS_COLORS.primary,
          background: alpha(GLASS_COLORS.primary, 0.1),
        },
      }),
      ...(variant === 'text' && {
        color: GLASS_COLORS.primary,
        '&:hover': {
          background: alpha(GLASS_COLORS.primary, 0.1),
        },
      }),
    }}
  >
    {children}
  </Button>
);

// Компонент для отображения информационного поля в стеклянном стиле
const GlassInfoField = ({
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
      borderRadius: 3,
      background: GLASS_COLORS.surface,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid',
      borderColor: GLASS_COLORS.border,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.3s ease',
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
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
      },
      '&:hover': {
        borderColor: alpha(GLASS_COLORS.primary, 0.5),
        '&::before': {
          opacity: 1,
        },
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
      {icon && (
        <Box
          sx={{
            p: 1,
            borderRadius: '50%',
            background: alpha(GLASS_COLORS.primary, 0.15),
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: alpha(GLASS_COLORS.primary, 0.3),
            color: GLASS_COLORS.primary,
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
            color: GLASS_COLORS.textSecondary,
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
            color: GLASS_COLORS.textPrimary,
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
            color: GLASS_COLORS.success,
            fontSize: 20,
            flexShrink: 0,
            ml: 1,
          }}
        />
      </Tooltip>
    )}
  </Box>
);

// Компонент статистической карточки в стеклянном стиле
const GlassStatCard = ({ 
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
      borderRadius: 4,
      background: GLASS_COLORS.surface,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid',
      borderColor: alpha(color, 0.3),
      height: '100%',
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
        transform: 'translateY(-4px)',
        boxShadow: `0 16px 32px ${alpha(color, 0.15)}`,
        borderColor: alpha(color, 0.5),
        '&::before': {
          opacity: 1,
        },
        '&::after': {
          opacity: 0.2,
        },
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Box
        sx={{
          p: 1.5,
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
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          color: GLASS_COLORS.textPrimary,
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
        mb: 1,
        fontSize: { xs: '2rem', md: '2.5rem' },
        letterSpacing: '-0.02em',
        textShadow: `0 4px 12px ${alpha(color, 0.3)}`,
      }}
    >
      {percentage ? `${value}%` : value}
    </Typography>
    
    <Typography
      variant="body2"
      sx={{
        color: GLASS_COLORS.textSecondary,
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
  const theme = useMuiTheme();
  const isMobileFilter = useMediaQuery(theme.breakpoints.down(1000));

  const { mode: themeMode } = useThemeContext();
  const GLASS_COLORS = getGlassColors(themeMode);

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
      color: GLASS_COLORS.accent,
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
      color: GLASS_COLORS.bronze,
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
      color: GLASS_COLORS.silver,
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
      color: GLASS_COLORS.gold,
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
        color: GLASS_COLORS.easy,
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
        color: GLASS_COLORS.medium,
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
        color: GLASS_COLORS.hard,
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
      .slice(0, 5);

    topCategories.forEach((category, index) => {
      if (category.total_count > 0) {
        // Определяем цвета для 5 категорий
        const categoryColors = [
          GLASS_COLORS.gold,
          GLASS_COLORS.silver,
          GLASS_COLORS.bronze,
          'rgba(43, 85, 193, 0.7)',
          'rgba(210, 61, 111, 0.7)',
        ];
        
        // Определяем иконки для разных позиций
        const categoryIcons = [
          <TrophyIcon />,
          <EmojiEventsIcon />,
          <StarIcon />,
          <CategoryIcon />,
          <CategoryIcon />,
        ];
        
        newAchievements.push({
          id: `category_top_${index + 1}`,
          title: category.category_name,
          description: `Достигните 100% в категории`,
          icon: categoryIcons[index] || <CategoryIcon />,
          color: categoryColors[index] || GLASS_COLORS.secondary,
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
          background: 'linear-gradient(135deg, #E0F0FF 0%, #D0E4FF 50%, #B8D8FF 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <CircularProgress size={48} sx={{ color: GLASS_COLORS.primary }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #E0F0FF 0%, #D0E4FF 50%, #B8D8FF 100%)',
        py: 4,
      }}>
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ 
              mb: 2, 
              color: GLASS_COLORS.primary,
              background: GLASS_COLORS.surface,
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              border: '1px solid',
              borderColor: GLASS_COLORS.border,
              px: 3,
              py: 1,
              '&:hover': {
                background: alpha(GLASS_COLORS.primary, 0.1),
              }
            }}
          >
            Вернуться на главную
          </Button>
          
          <Alert severity="error" sx={{ 
            borderRadius: 3,
            background: alpha(GLASS_COLORS.error, 0.15),
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: alpha(GLASS_COLORS.error, 0.3),
            color: GLASS_COLORS.error,
          }}>
            Пользователь не найден. Пожалуйста, авторизуйтесь.
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: GLASS_COLORS.mainColor,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        py: 4,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(200, 220, 255, 0.5) 0%, transparent 60%)
          `,
          pointerEvents: 'none',
        },
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
              borderRadius: 3,
              background: GLASS_COLORS.surface,
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: GLASS_COLORS.border,
              color: GLASS_COLORS.primary,
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                background: alpha(GLASS_COLORS.primary, 0.1),
                borderColor: GLASS_COLORS.primary,
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
            variant="text"
          >
            Назад
          </Button>
          
          {/* Кнопка перехода к избранным вопросам */}
          <Button
            startIcon={<FavoriteIcon />}
            onClick={() => navigate('/favorites')}
            sx={{
              borderRadius: 3,
              background: GLASS_COLORS.surface,
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: alpha(GLASS_COLORS.primary, 0.5),
              color: GLASS_COLORS.primary,
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                background: alpha(GLASS_COLORS.primary, 0.1),
                borderColor: GLASS_COLORS.primary,
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.primary, 0.2)}`,
              },
              transition: 'all 0.3s ease',
            }}
            variant="outlined"
          >
            {isMobileFilter ? "Вопросы" : "Избранные вопросы"}
          </Button>
        </Stack>

        {/* Уведомления */}
        {(authError || localError) && (
          <Fade in>
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
                borderRadius: 3,
                background: alpha(GLASS_COLORS.success, 0.15),
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: alpha(GLASS_COLORS.success, 0.3),
                color: GLASS_COLORS.success,
              }}
              onClose={() => setSuccessMessage('')}
            >
              {successMessage}
            </Alert>
          </Fade>
        )}

        {/* Кнопка для просмотра ачивок в стеклянном стиле */}
        {!isMobileFilter && !isLoadingStats && achievements.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: '1px solid',
              borderColor: alpha(GLASS_COLORS.gold, 0.5),
              background: GLASS_COLORS.surface,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              mb: 3,
              position: 'relative',
              overflow: 'hidden',
              cursor: { xs: 'default', md: 'pointer' },
              transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
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
              '&::after': {
                content: '""',
                position: 'absolute',
                top: -50,
                left: -50,
                right: -50,
                bottom: -50,
                background: `radial-gradient(circle at 30% 30%, ${GLASS_COLORS.gold} 0%, transparent 70%)`,
                opacity: 0.1,
                zIndex: -1,
                filter: 'blur(50px)',
              },
              '&:hover': {
                transform: { xs: 'none', md: 'translateY(-4px)' },
                boxShadow: { 
                  xs: 'none', 
                  md: `0 16px 32px ${alpha(GLASS_COLORS.gold, 0.15)}` 
                },
                borderColor: { xs: alpha(GLASS_COLORS.gold, 0.5), md: alpha(GLASS_COLORS.gold, 0.8) },
              },
            }}
            onClick={() => {
              if (window.innerWidth >= 900) {
                setIsAchievementsVisible(!isAchievementsVisible);
              }
            }}
          >
            {/* Анимированные элементы фона */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  radial-gradient(circle at 30% 50%, ${alpha(GLASS_COLORS.gold, 0.1)} 0%, transparent 50%),
                  radial-gradient(circle at 70% 20%, ${alpha(GLASS_COLORS.silver, 0.08)} 0%, transparent 50%),
                  radial-gradient(circle at 20% 80%, ${alpha(GLASS_COLORS.bronze, 0.08)} 0%, transparent 50%)
                `,
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
                      background: alpha(GLASS_COLORS.gold, 0.15),
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: alpha(GLASS_COLORS.gold, 0.3),
                      color: GLASS_COLORS.gold,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 0 20px ${alpha(GLASS_COLORS.gold, 0.3)}`,
                    }}
                  >
                    <TrophyIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: GLASS_COLORS.textPrimary,
                        background: `linear-gradient(90deg, ${GLASS_COLORS.gold} 0%, ${GLASS_COLORS.silver} 50%, ${GLASS_COLORS.bronze} 100%)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: { xs: '1.4rem', md: '1.6rem' },
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {isAchievementsVisible && window.innerWidth >= 900 
                        ? 'Скрыть достижения' 
                        : window.innerWidth >= 900 
                          ? 'Показать мои достижения' 
                          : 'Достижения доступны в десктопной версии'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: GLASS_COLORS.textSecondary,
                        mt: 0.5,
                        fontWeight: 500,
                      }}
                    >
                      {isAchievementsVisible && window.innerWidth >= 900 
                        ? 'Нажмите, чтобы скрыть' 
                        : window.innerWidth >= 900 
                          ? `У вас разблокировано ${unlockedAchievements} из ${totalAchievements} достижений!` 
                          : 'Перейдите на компьютер, чтобы просмотреть все ваши награды'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ 
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center', 
                  gap: 2 
                }}>
                  {/* Индикатор прогресса */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: GLASS_COLORS.surface,
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid',
                      borderColor: alpha(GLASS_COLORS.gold, 0.3),
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: GLASS_COLORS.gold,
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
                        color: GLASS_COLORS.gold,
                        top: -2,
                        left: -2,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      }}
                    />
                  </Box>

                  {/* Иконка стрелки */}
                  <IconButton
                    sx={{
                      background: alpha(GLASS_COLORS.gold, 0.15),
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: alpha(GLASS_COLORS.gold, 0.3),
                      color: GLASS_COLORS.gold,
                      '&:hover': {
                        background: alpha(GLASS_COLORS.gold, 0.25),
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.3s ease',
                      display: { xs: 'none', md: 'flex' },
                    }}
                  >
                    {isAchievementsVisible ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                {/* На мобильных показываем иконку информации */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
                  <InfoIcon 
                    sx={{ 
                      color: GLASS_COLORS.gold,
                      fontSize: 32,
                    }} 
                  />
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
                borderRadius: 4,
                background: GLASS_COLORS.surface,
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid',
                borderColor: GLASS_COLORS.border,
                mb: 3,
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
              {/* Фоновые элементы */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -60,
                  right: -60,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: alpha(GLASS_COLORS.gold, 0.03),
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
                        background: alpha(GLASS_COLORS.gold, 0.15),
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: alpha(GLASS_COLORS.gold, 0.3),
                        color: GLASS_COLORS.gold,
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
                          color: GLASS_COLORS.textPrimary,
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                          letterSpacing: '-0.01em',
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
                      backgroundColor: alpha(GLASS_COLORS.border, 0.5),
                      overflow: 'hidden',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${(unlockedAchievements / totalAchievements) * 100}%`,
                        height: '100%',
                        borderRadius: 3,
                        background: `linear-gradient(90deg, ${GLASS_COLORS.bronze} 0%, ${GLASS_COLORS.silver} 50%, ${GLASS_COLORS.gold} 100%)`,
                        transition: 'width 1s ease-out',
                        boxShadow: `0 2px 8px ${alpha(GLASS_COLORS.gold, 0.3)}`,
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
                  progress: { title: 'Общий прогресс', icon: <TrendingUpIcon />, color: GLASS_COLORS.success },
                  category: { title: 'По категориям - достигните 100% в каждой категории', icon: <CategoryIcon />, color: GLASS_COLORS.info },
                  difficulty: { title: 'По сложности', icon: <SpeedIcon />, color: GLASS_COLORS.warning },
                  other: { title: 'Другие', icon: <EmojiEventsIcon />, color: GLASS_COLORS.secondary },
                }[category] || { title: category, icon: <EmojiEventsIcon />, color: GLASS_COLORS.secondary };

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
                        borderRadius: 2,
                        background: alpha(categoryInfo.color, 0.1),
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Box
                        sx={{
                          p: 0.75,
                          borderRadius: '50%',
                          background: alpha(categoryInfo.color, 0.15),
                          backdropFilter: 'blur(10px)',
                          border: '1px solid',
                          borderColor: alpha(categoryInfo.color, 0.3),
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
                          color: GLASS_COLORS.textPrimary,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {categoryInfo.title}
                      </Typography>
                      <Chip
                        label={categoryAchievements.length}
                        size="small"
                        sx={{
                          background: alpha(categoryInfo.color, 0.15),
                          backdropFilter: 'blur(10px)',
                          color: categoryInfo.color,
                          fontWeight: 600,
                          height: 20,
                          fontSize: '0.7rem',
                          border: '1px solid',
                          borderColor: alpha(categoryInfo.color, 0.3),
                        }}
                      />
                    </Box>

                    {/* Сетка ачивок категории */}
                    <Grid container spacing={2}>
                      {categoryAchievements.map((achievement) => (
                        <Grid 
                          item 
                          xs={6} 
                          sm={4} 
                          md={2.4} 
                          lg={2.4} 
                          key={achievement.id}
                        >
                          <GlassAchievementCard achievement={achievement} />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                );
              })}
            </Paper>
          )}
        </Collapse>

        {/* Основная карточка профиля в стеклянном стиле */}
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
          {/* Заголовок с кнопкой редактирования */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 4,
              pb: 3,
              borderBottom: '1px solid',
              borderColor: GLASS_COLORS.border,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '50%',
                  background: alpha(GLASS_COLORS.primary, 0.15),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha(GLASS_COLORS.primary, 0.3),
                  color: GLASS_COLORS.primary,
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
                    fontWeight: 700,
                    color: GLASS_COLORS.textPrimary,
                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                    letterSpacing: '-0.02em',
                  }}
                >
                  Мой профиль
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: GLASS_COLORS.textSecondary,
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
                <GlassInfoField
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
                        border: '1px solid',
                        borderColor: GLASS_COLORS.border,
                      }}
                    />
                  }
                  icon={<ImageIcon />}
                />
              )}

              {/* Имя */}
              <GlassInfoField
                label="Имя"
                value={user.first_name}
                icon={<PersonIcon />}
              />

              {/* Фамилия */}
              <GlassInfoField
                label="Фамилия"
                value={user.last_name}
                icon={<PersonIcon />}
              />

              {/* Email */}
              <GlassInfoField
                label="Email"
                value={user.email}
                icon={<EmailIcon />}
                verified={user.email_verified}
              />

              {/* Роль */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  background: GLASS_COLORS.surface,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid',
                  borderColor: GLASS_COLORS.border,
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
                      background: alpha(GLASS_COLORS.success, 0.15),
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: alpha(GLASS_COLORS.success, 0.3),
                      color: GLASS_COLORS.success,
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
                        color: GLASS_COLORS.textSecondary,
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
                        color: GLASS_COLORS.textPrimary,
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
                      background: alpha(GLASS_COLORS.success, 0.15),
                      backdropFilter: 'blur(10px)',
                      color: GLASS_COLORS.success,
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor: alpha(GLASS_COLORS.success, 0.3),
                    }}
                  />
                )}
              </Box>

              {/* Статус активности */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  background: GLASS_COLORS.surface,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid',
                  borderColor: GLASS_COLORS.border,
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
                      background: alpha(
                        user.is_active ? GLASS_COLORS.success : GLASS_COLORS.error,
                        0.15
                      ),
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: alpha(
                        user.is_active ? GLASS_COLORS.success : GLASS_COLORS.error,
                        0.3
                      ),
                      color: user.is_active ? GLASS_COLORS.success : GLASS_COLORS.error,
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
                        color: GLASS_COLORS.textSecondary,
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
                        color: GLASS_COLORS.textPrimary,
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
                    background: alpha(
                      user.is_active ? GLASS_COLORS.success : GLASS_COLORS.error,
                      0.15
                    ),
                    backdropFilter: 'blur(10px)',
                    color: user.is_active ? GLASS_COLORS.success : GLASS_COLORS.error,
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: alpha(
                      user.is_active ? GLASS_COLORS.success : GLASS_COLORS.error,
                      0.3
                    ),
                  }}
                />
              </Box>

              {/* Последний вход */}
              {user.last_login && (
                <GlassInfoField
                  label="Последний вход"
                  value={new Date(user.last_login).toLocaleString('ru-RU')}
                  icon={<ClockIcon />}
                />
              )}
            </Stack>
          ) : (
            // Режим редактирования
            <Stack spacing={3}>
              <GlassInputField
                label="Имя"
                type="text"
                value={firstName}
                onChange={(e: any) => setFirstName(e.target.value)}
                disabled={isSaving}
                startIcon={<PersonIcon sx={{ color: GLASS_COLORS.textSecondary }} />}
              />

              <GlassInputField
                label="Фамилия"
                type="text"
                value={lastName}
                onChange={(e: any) => setLastName(e.target.value)}
                disabled={isSaving}
                startIcon={<PersonIcon sx={{ color: GLASS_COLORS.textSecondary }} />}
              />

              {/* Кнопки действий */}
              <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                <GlassButton
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
                </GlassButton>

                <GlassButton
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={isSaving}
                  fullWidth
                >
                  Отмена
                </GlassButton>
              </Box>
            </Stack>
          )}
        </Paper>

        {/* Статистика выполнения в стеклянном стиле */}
        {!isLoadingStats && completionStats && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
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
            {/* Заголовок */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: '1px solid', borderColor: GLASS_COLORS.border }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    background: alpha(GLASS_COLORS.success, 0.15),
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: alpha(GLASS_COLORS.success, 0.3),
                    color: GLASS_COLORS.success,
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
                      fontWeight: 700,
                      color: GLASS_COLORS.textPrimary,
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Ваша статистика
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: GLASS_COLORS.textSecondary,
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
                  fontWeight: 600,
                  color: GLASS_COLORS.textPrimary,
                  mb: 3,
                  letterSpacing: '-0.01em',
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
                <GlassStatCard
                  title="Общий прогресс"
                  value={completionStats.overall_percentage.toFixed(1)}
                  subtitle={`${completionStats.total_completed} из ${completionStats.total} вопросов`}
                  color={GLASS_COLORS.success}
                  icon={<TrendingUpIcon />}
                  percentage
                />

                <GlassStatCard
                  title="Легкие вопросы"
                  value={completionStats.easy_completed}
                  subtitle={`из ${completionStats.total_easy} доступных`}
                  color={GLASS_COLORS.easy}
                  icon={<BoltIcon />}
                />

                <GlassStatCard
                  title="Средние вопросы"
                  value={completionStats.medium_completed}
                  subtitle={`из ${completionStats.total_medium} доступных`}
                  color={GLASS_COLORS.medium}
                  icon={<BarChartIcon />}
                />

                <GlassStatCard
                  title="Сложные вопросы"
                  value={completionStats.hard_completed}
                  subtitle={`из ${completionStats.total_hard} доступных`}
                  color={GLASS_COLORS.hard}
                  icon={<SpeedIcon />}
                />
              </Box>
            </Box>
          </Paper>
        )}

        {/* Статистика по категориям в стеклянном стиле */}
        {!isLoadingStats && categoryStats.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
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
            {/* Заголовок */}
            <Box sx={{ mb: 4, pb: 3, borderBottom: '1px solid', borderColor: GLASS_COLORS.border }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    background: alpha(GLASS_COLORS.info, 0.15),
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: alpha(GLASS_COLORS.info, 0.3),
                    color: GLASS_COLORS.info,
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
                      fontWeight: 700,
                      color: GLASS_COLORS.textPrimary,
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Статистика по темам
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: GLASS_COLORS.textSecondary,
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
                    borderRadius: 4,
                    background: GLASS_COLORS.surface,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid',
                    borderColor: GLASS_COLORS.border,
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
                    },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 16px 32px ${alpha(GLASS_COLORS.primary, 0.15)}`,
                      borderColor: alpha(GLASS_COLORS.primary, 0.5),
                      '&::before': {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  {/* Заголовок категории */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: GLASS_COLORS.textPrimary,
                        lineHeight: 1.3,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {category.category_name}
                    </Typography>
                    <Chip
                      label={`${category.percentage.toFixed(1)}%`}
                      size="small"
                      sx={{
                        background: alpha(GLASS_COLORS.primary, 0.15),
                        backdropFilter: 'blur(10px)',
                        color: GLASS_COLORS.primary,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        border: '1px solid',
                        borderColor: alpha(GLASS_COLORS.primary, 0.3),
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
                        backgroundColor: alpha(GLASS_COLORS.border, 0.5),
                        overflow: 'hidden',
                        backdropFilter: 'blur(10px)',
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
                          background: `linear-gradient(90deg, ${GLASS_COLORS.primary} 0%, ${alpha(GLASS_COLORS.primary, 0.6)} 100%)`,
                          borderRadius: 4,
                          transition: 'width 0.6s ease-out',
                          boxShadow: `0 2px 8px ${alpha(GLASS_COLORS.primary, 0.3)}`,
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Статистика */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: GLASS_COLORS.textSecondary,
                        fontWeight: 600,
                      }}
                    >
                      {category.completed_count} из {category.total_count}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: GLASS_COLORS.textSecondary,
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

        {/* Итоговая информация в стеклянном стиле */}
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
            <Typography
              variant="h6"
              sx={{
                color: GLASS_COLORS.info,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                letterSpacing: '-0.01em',
              }}
            >
              <InfoIcon />
              Итоговая информация
            </Typography>
            {completionStats && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ color: GLASS_COLORS.textPrimary, fontWeight: 500 }}
                >
                  • Всего выполнено вопросов: <strong>{completionStats.total_completed}</strong>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: GLASS_COLORS.textPrimary, fontWeight: 500 }}
                >
                  • Общий прогресс: <strong>{completionStats.overall_percentage.toFixed(1)}%</strong>
                </Typography>
                {achievements.length > 0 && (
                  <Typography
                    variant="body2"
                    sx={{ color: GLASS_COLORS.textPrimary, fontWeight: 500 }}
                  >
                    • Разблокировано ачивок: <strong>{unlockedAchievements}/{totalAchievements}</strong>
                  </Typography>
                )}
              </Box>
            )}
            <Typography
              variant="caption"
              sx={{
                color: GLASS_COLORS.textSecondary,
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