import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Button,
  InputAdornment,
  TextField,
  Chip,
  Stack,
  alpha,
  IconButton,
  Fade,
  Avatar,
  AvatarGroup,
  Tooltip,
  LinearProgress,
  Pagination,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import InterpreterModeIcon from '@mui/icons-material/InterpreterMode';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import StorageIcon from '@mui/icons-material/Storage';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FeedbackFab } from '../components/FeedbackFab';
import { NavigationBar } from '../components/NavigationBar';
import { useTheme } from '../context/ThemeContext';
import { companyService } from '../services/companyService';
import type { Company } from '../types';

// Получение цветов в зависимости от темы
const getGlassColors = (mode: 'light' | 'dark') => {
  if (mode === 'dark') {
    return {
      primary: 'rgba(0, 212, 255, 0.9)',
      secondary: 'rgba(138, 43, 226, 0.8)',
      accent: 'rgba(0, 255, 200, 0.9)',
      background: 'rgba(20, 20, 40, 0.6)',
      surface: 'rgba(30, 30, 60, 0.7)',
      surfaceDark: 'rgba(40, 40, 80, 0.8)',
      textPrimary: 'rgba(255, 255, 255, 0.95)',
      textSecondary: 'rgba(180, 180, 200, 0.7)',
      border: 'rgba(0, 212, 255, 0.3)',
      borderGlow: 'rgba(0, 212, 255, 0.6)',
      success: 'rgba(0, 228, 91, 0.9)',
      error: 'rgba(255, 50, 100, 0.9)',
      warning: 'rgba(255, 150, 0, 0.9)',
      info: 'rgba(90, 200, 250, 0.8)',
      purple: 'rgba(200, 100, 255, 0.9)',
      blue: 'rgba(0, 180, 255, 0.9)',
      gradientStart: 'rgba(0, 212, 255, 0.2)',
      gradientEnd: 'rgba(138, 43, 226, 0.1)',
      glassOverlay: 'rgba(0, 212, 255, 0.1)',
      glassHighlight: 'rgba(0, 212, 255, 0.2)',
      mainColor: 'linear-gradient(135deg, #464646ff 0%, #292929ff 50%, #000000ff 100%)',
    };
  }

  // Light mode
  return {
    primary: 'rgba(10, 132, 255, 0.8)',
    secondary: 'rgba(94, 92, 230, 0.75)',
    accent: 'rgba(90, 200, 250, 0.9)',
    background: 'rgba(240, 244, 250, 0.4)',
    surface: 'rgba(255, 255, 255, 0.6)',
    surfaceDark: 'rgba(255, 255, 255, 0.8)',
    textPrimary: 'rgba(0, 0, 0, 0.8)',
    textSecondary: 'rgba(60, 60, 67, 0.6)',
    border: 'rgba(255, 255, 255, 0.5)',
    borderGlow: 'rgba(255, 255, 255, 0.8)',
    success: 'rgba(52, 199, 89, 0.8)',
    error: 'rgba(255, 59, 48, 0.8)',
    warning: 'rgba(255, 149, 0, 0.8)',
    info: 'rgba(90, 200, 250, 0.8)',
    purple: 'rgba(175, 82, 222, 0.8)',
    blue: 'rgba(0, 122, 255, 0.8)',
    gradientStart: 'rgba(255, 255, 255, 0.3)',
    gradientEnd: 'rgba(255, 255, 255, 0.1)',
    glassOverlay: 'rgba(255, 255, 255, 0.2)',
    glassHighlight: 'rgba(255, 255, 255, 0.5)',
    mainColor: 'linear-gradient(135deg, #E0F0FF 0%, #D0E4FF 50%, #B8D8FF 100%)',
  };
};

// Получение иконки для сложности
const getDifficultyIcon = (difficulty: string) => {
  switch (difficulty) {
    case 'junior':
      return '💡';
    case 'middle':
      return '🛠️';
    case 'senior':
      return '🔥';
    default:
      return '❓';
  }
};

// Получение цвета для сложности
const getDifficultyColor = (difficulty: string, colors: any) => {
  switch (difficulty) {
    case 'junior':
      return colors.success;
    case 'middle':
      return colors.warning;
    case 'senior':
      return colors.error;
    default:
      return colors.primary;
  }
};

// Получение тренда популярности
const getPopularityTrend = () => {
  // Здесь можно добавить реальную логику на основе данных
  const trends = ['up', 'down', 'stable'];
  return trends[Math.floor(Math.random() * trends.length)];
};

// Получение времени чтения
const getReadingTime = (questionsCount: number) => {
  const avgTimePerQuestion = 7; // минут на вопрос
  const totalMinutes = questionsCount * avgTimePerQuestion;
  if (totalMinutes < 60) {
    return `${totalMinutes} мин`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} ч ${minutes} мин`;
};

// Получение процента прохождения
const getCompletionRate = (completedQuestions: number, totalQuestions: number) => {
  if (totalQuestions === 0) return 0;
  return Math.round((completedQuestions / totalQuestions) * 100);
};

interface CompanyCardProps {
  company: Company;
  averageDifficulty: string;
  onNavigate: () => void;
}

// Улучшенная карточка компании
const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  averageDifficulty,
  onNavigate,
}) => {
  const { mode: themeMode } = useTheme();
  const GLASS_COLORS = getGlassColors(themeMode);
  const [isHovered, setIsHovered] = useState(false);
  
  const difficultyColor = getDifficultyColor(company.level, GLASS_COLORS);
  const trend = getPopularityTrend();
  const completionRate = getCompletionRate(company.completed_questions_count || 0, company.questions_count || 0);
  const readingTime = getReadingTime(company.questions_count || 0);

  return (
    <Paper
      elevation={0}
      onClick={onNavigate}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        p: 4,
        borderRadius: 4,
        background: GLASS_COLORS.surface,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '2px solid',
        borderColor: GLASS_COLORS.border,
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
          background: `radial-gradient(circle at 30% 30%, ${difficultyColor} 0%, transparent 70%)`,
          opacity: 0,
          zIndex: -1,
          filter: 'blur(30px)',
          transition: 'opacity 0.4s ease',
        },
        '&:hover': {
          transform: 'translateY(-12px) scale(1.02)',
          borderColor: difficultyColor,
          boxShadow: `0 24px 48px ${alpha(difficultyColor, 0.2)}`,
          '&::before': {
            opacity: 1,
          },
          '&::after': {
            opacity: 0.3,
          },
        },
      }}
    >
      {/* Анимированный фон при наведении */}
      {isHovered && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '200%',
            height: '200%',
            background: `radial-gradient(circle at center, ${alpha(difficultyColor, 0.1)} 0%, transparent 50%)`,
            transform: 'translate(-50%, -50%)',
            animation: 'rotate 10s linear infinite',
            '@keyframes rotate': {
              '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
              '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
            },
          }}
        />
      )}

      {/* Верхняя часть */}
      <Box sx={{ position: 'relative', zIndex: 1, mb: 3 }}>
        {/* Бейдж популярности */}
        {completionRate > 70 && (
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              background: alpha(GLASS_COLORS.success, 0.2),
              border: '1px solid',
              borderColor: alpha(GLASS_COLORS.success, 0.3),
              color: GLASS_COLORS.success,
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 14 }} />
            <span>Популярное</span>
          </Box>
        )}

        {/* Иконка компании */}
        <Box
          sx={{
            display: 'inline-flex',
            p: 2,
            borderRadius: '16px',
            background: alpha(GLASS_COLORS.primary, 0.07),
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: alpha(GLASS_COLORS.primary, 0.3),
            color: GLASS_COLORS.primary,
            mb: 3,
            fontSize: '2rem',
            transition: 'all 0.3s ease',
            transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
          }}
        >
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              style={{ width: 48, height: 48, objectFit: 'contain' }}
            />
          ) : (
            <StorageIcon sx={{ fontSize: 48 }} />
          )}
        </Box>

        {/* Название компании */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: GLASS_COLORS.textPrimary,
            mb: 2,
            fontSize: '1.5rem',
            letterSpacing: '-0.01em',
          }}
        >
          {company.name}
        </Typography>

        {/* Описание */}
        {company.description && (
          <Typography
            variant="body2"
            sx={{
              color: GLASS_COLORS.textSecondary,
              lineHeight: 1.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              mb: 2,
            }}
          >
            {company.description}
          </Typography>
        )}

        {/* Теги */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            icon={<LocalFireDepartmentIcon />}
            label={`${company.questions_count || 0} вопросов`}
            size="small"
            sx={{
              backgroundColor: alpha(GLASS_COLORS.primary, 0.1),
              color: GLASS_COLORS.primary,
              border: '1px solid',
              borderColor: alpha(GLASS_COLORS.primary, 0.2),
            }}
          />
          <Chip
            icon={<ScheduleIcon />}
            label={readingTime}
            size="small"
            sx={{
              backgroundColor: alpha(GLASS_COLORS.purple, 0.1),
              color: GLASS_COLORS.purple,
              border: '1px solid',
              borderColor: alpha(GLASS_COLORS.purple, 0.2),
            }}
          />
        </Stack>
      </Box>

      {/* Нижняя часть */}
      <Box sx={{ position: 'relative', zIndex: 1, mt: 'auto' }}>
        <Stack spacing={2}>
          {/* Информация о вопросах и тренд */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: GLASS_COLORS.primary,
                  fontSize: '2rem',
                  lineHeight: 1,
                  mb: 0.5,
                }}
              >
                {company.questions_count || 0}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: GLASS_COLORS.textSecondary,
                  fontWeight: 500,
                }}
              >
                {company.questions_count === 1 ? 'вопрос' : 'вопросов'}
              </Typography>
            </Box>

            {/* Иконка тренда */}
            <Tooltip title={
              trend === 'up' ? 'Популярность растет' :
              trend === 'down' ? 'Популярность падает' :
              'Популярность стабильна'
            }>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: trend === 'up' ? GLASS_COLORS.success :
                         trend === 'down' ? GLASS_COLORS.error :
                         GLASS_COLORS.textSecondary,
                }}
              >
                {trend === 'up' && <TrendingUpIcon />}
                {trend === 'down' && <TrendingDownIcon />}
                {trend === 'stable' && <TrendingFlatIcon />}
              </Box>
            </Tooltip>
          </Box>

          {/* Прогресс прохождения */}
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary }}>
                Прохождение
              </Typography>
              <Typography variant="caption" sx={{ color: GLASS_COLORS.textPrimary, fontWeight: 600 }}>
                {completionRate}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completionRate}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(GLASS_COLORS.textSecondary, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  backgroundColor: difficultyColor,
                  backgroundImage: `linear-gradient(90deg, ${alpha(difficultyColor, 0.7)} 0%, ${difficultyColor} 100%)`,
                },
              }}
            />
          </Box>

          {/* Уровень сложности */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ fontSize: '1.5rem' }}>
                {getDifficultyIcon(averageDifficulty)}
              </Box>
              <Chip
                label={
                  averageDifficulty === 'junior'
                    ? 'Junior'
                    : averageDifficulty === 'middle'
                    ? 'Middle'
                    : 'Senior'
                }
                size="small"
                sx={{
                  fontWeight: 600,
                  backgroundColor: alpha(difficultyColor, 0.2),
                  color: difficultyColor,
                  border: '1px solid',
                  borderColor: alpha(difficultyColor, 0.3),
                }}
              />
            </Box>

            {/* Аватарки пользователей */}
            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
              <Avatar sx={{ bgcolor: GLASS_COLORS.primary }}>A</Avatar>
              <Avatar sx={{ bgcolor: GLASS_COLORS.secondary }}>B</Avatar>
              <Avatar sx={{ bgcolor: GLASS_COLORS.purple }}>C</Avatar>
            </AvatarGroup>
          </Box>

          {/* Кнопка быстрого действия */}
          <Button
            variant="contained"
            sx={{
              mt: 2,
              background: `linear-gradient(135deg, ${alpha(difficultyColor, 0.8)} 0%, ${difficultyColor} 100%)`,
              color: '#fff',
              fontWeight: 600,
              py: 1,
              borderRadius: 3,
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: `linear-gradient(135deg, ${difficultyColor} 0%, ${alpha(difficultyColor, 0.9)} 100%)`,
                boxShadow: `0 8px 24px ${alpha(difficultyColor, 0.4)}`,
              },
            }}
          >
            Начать подготовку
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export const CompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const { mode: themeMode } = useTheme();
  const GLASS_COLORS = getGlassColors(themeMode);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 6;
  const [total, setTotal] = useState(0);

  // Загрузка компаний
  const loadCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await companyService.getCompaniesWithQuestions(page, limit, false, selectedDifficulty || '');
      setCompanies(response.items);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, selectedDifficulty]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  // Дебаунс для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Фильтрация компаний по поиску
  useEffect(() => {
    let filtered = companies;

    if (debouncedSearch.trim()) {
      filtered = filtered.filter((company) =>
        company.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    setFilteredCompanies(filtered);
  }, [companies, debouncedSearch]);

  // Обработчик смены сложности
  const handleDifficultyChange = (difficulty: string | null) => {
    setSelectedDifficulty(difficulty);
    setPage(1);
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
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Панель навигации */}
        <Box sx={{ mb: 4 }}>
          <NavigationBar 
            showProfile={true}
            showQuestions={true}
            showCompanies={true}
          />
        </Box>

        {/* Hero Section */}
        <Box sx={{ mb: 6, textAlign: 'center', position: 'relative', mt: 7 }}>
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
            }}
          >
            <Box
              className="icon-wrapper"
              sx={{
                display: 'inline-flex',
                p: 3,
                borderRadius: '24px',
                background: alpha(GLASS_COLORS.primary, 0.15),
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: alpha(GLASS_COLORS.primary, 0.3),
                color: GLASS_COLORS.primary,
                boxShadow: `0 8px 32px ${alpha(GLASS_COLORS.primary, 0.2)}`,
                transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `conic-gradient(from 0deg, ${alpha(GLASS_COLORS.primary, 0.3)} 0%, transparent 30%)`,
                  opacity: 0,
                  transition: 'opacity 0.3s',
                },
                '&:hover:before': {
                  opacity: 1,
                },
              }}
            >
              <InterpreterModeIcon sx={{ fontSize: 56 }} />
            </Box>

            {/* Плавающий счетчик компаний */}
            <Box
              sx={{
                position: 'absolute',
                top: -22,
                right: -8,
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${GLASS_COLORS.success}, ${alpha(GLASS_COLORS.success, 0.7)})`,
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: alpha('#FFFFFF', 0.3),
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.125rem',
                boxShadow: `0 4px 16px ${alpha(GLASS_COLORS.success, 0.4)}`,
                opacity: 0.8,
                transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
              }}
            >
              {companies.length}
            </Box>
          </Box>

          {/* Главный заголовок */}
          <Typography
            variant="h1"
            sx={{
              fontWeight: 700,
              color: GLASS_COLORS.textPrimary,
              letterSpacing: '-0.02em',
              mb: 3,
              fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
              textShadow: '0 4px 20px rgba(255,255,255,0.5)',
            }}
          >
            Подготовка к собеседованиям
          </Typography>

          {/* Подзаголовок */}
          <Typography
            variant="h6"
            sx={{
              color: GLASS_COLORS.textSecondary,
              fontWeight: 400,
              maxWidth: '600px',
              mx: 'auto',
              mb: 4,
              fontSize: '1.1rem',
              lineHeight: 1.6,
            }}
          >
            Выберите компанию и потренируйтесь на реальных вопросах собеседования
          </Typography>
        </Box>

        {/* Поле поиска и фильтры */}
        <Box sx={{ mb: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              background: GLASS_COLORS.surface,
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid',
              borderColor: GLASS_COLORS.border,
            }}
          >
            <Stack spacing={2}>
              <TextField
                fullWidth
                placeholder="Поиск компании..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: GLASS_COLORS.textSecondary }} />
                    </InputAdornment>
                  ),
                  endAdornment: search && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearch('')}
                        sx={{ color: GLASS_COLORS.textSecondary }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    background: GLASS_COLORS.background,
                    backdropFilter: 'blur(10px)',
                    '&:hover fieldset': {
                      borderColor: GLASS_COLORS.primary,
                      borderWidth: 2,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: GLASS_COLORS.primary,
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: GLASS_COLORS.textPrimary,
                    fontWeight: 500,
                    fontSize: '1rem',
                  },
                }}
              />

              {/* Фильтры по сложности */}
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  label="Все"
                  onClick={() => handleDifficultyChange(null)}
                  color={selectedDifficulty === null ? 'primary' : 'default'}
                  sx={{
                    backgroundColor: selectedDifficulty === null ? GLASS_COLORS.primary : 'transparent',
                    color: selectedDifficulty === null ? '#fff' : GLASS_COLORS.textPrimary,
                    border: '1px solid',
                    borderColor: GLASS_COLORS.border,
                  }}
                />
                <Chip
                  icon={<span>💡</span>}
                  label="Junior"
                  onClick={() => handleDifficultyChange('junior')}
                  sx={{
                    backgroundColor: selectedDifficulty === 'junior' ? alpha(GLASS_COLORS.success, 0.2) : 'transparent',
                    color: selectedDifficulty === 'junior' ? GLASS_COLORS.success : GLASS_COLORS.textPrimary,
                    border: '1px solid',
                    borderColor: selectedDifficulty === 'junior' ? GLASS_COLORS.success : GLASS_COLORS.border,
                  }}
                />
                <Chip
                  icon={<span>🛠️</span>}
                  label="Middle"
                  onClick={() => handleDifficultyChange('middle')}
                  sx={{
                    backgroundColor: selectedDifficulty === 'middle' ? alpha(GLASS_COLORS.warning, 0.2) : 'transparent',
                    color: selectedDifficulty === 'middle' ? GLASS_COLORS.warning : GLASS_COLORS.textPrimary,
                    border: '1px solid',
                    borderColor: selectedDifficulty === 'middle' ? GLASS_COLORS.warning : GLASS_COLORS.border,
                  }}
                />
                <Chip
                  icon={<span>🔥</span>}
                  label="Senior"
                  onClick={() => handleDifficultyChange('senior')}
                  sx={{
                    backgroundColor: selectedDifficulty === 'senior' ? alpha(GLASS_COLORS.error, 0.2) : 'transparent',
                    color: selectedDifficulty === 'senior' ? GLASS_COLORS.error : GLASS_COLORS.textPrimary,
                    border: '1px solid',
                    borderColor: selectedDifficulty === 'senior' ? GLASS_COLORS.error : GLASS_COLORS.border,
                  }}
                />
              </Stack>
            </Stack>
          </Paper>
        </Box>

        {/* Список компаний */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: GLASS_COLORS.primary }} />
          </Box>
        ) : filteredCompanies.length > 0 ? (
          <Fade in={true}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                },
                gap: 3,
                mb: 6,
              }}
            >
              {filteredCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  averageDifficulty={company.level}
                  onNavigate={() => navigate(`/companies/${company.id}/questions`)}
                />
              ))}
            </Box>
          </Fade>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography
              variant="h6"
              sx={{
                color: GLASS_COLORS.textSecondary,
                fontWeight: 400,
              }}
            >
              {debouncedSearch ? 'Компании не найдены' : 'Нет доступных компаний'}
            </Typography>
          </Box>
        )}

        {/* Пагинация */}
        {Math.ceil(total / limit) > 1 && filteredCompanies.length > 0 && !debouncedSearch && (
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
              position: 'relative',
              overflow: 'hidden',
              mb: 6,
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
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(total / limit)}
                page={page}
                onChange={(_, value) => setPage(value)}
                shape="rounded"
                sx={{
                  '& .MuiPagination-ul': {
                    flexWrap: 'nowrap',
                    justifyContent: 'center',
                  },
                  '& .MuiPaginationItem-root': {
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                    color: GLASS_COLORS.textSecondary,
                    border: '1px solid',
                    borderColor: GLASS_COLORS.border,
                    background: GLASS_COLORS.surface,
                    backdropFilter: 'blur(10px)',
                    minWidth: { xs: 36, sm: 40, md: 44 },
                    height: { xs: 36, sm: 40, md: 44 },
                    margin: { xs: '0 2px', sm: '0 4px' },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: alpha(GLASS_COLORS.primary, 0.1),
                      borderColor: GLASS_COLORS.primary,
                      color: GLASS_COLORS.primary,
                      transform: 'translateY(-2px)',
                    },
                    '&.Mui-selected': {
                      background: `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${alpha(GLASS_COLORS.primary, 0.7)})`,
                      color: 'white',
                      borderColor: GLASS_COLORS.primary,
                      boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.primary, 0.3)}`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.primary, 0.6)})`,
                        transform: 'translateY(-2px)',
                      },
                    },
                    '&.Mui-disabled': {
                      opacity: 0.5,
                      background: alpha(GLASS_COLORS.surface, 0.3),
                    },
                    '&.MuiPaginationItem-previousNext': {
                      backgroundColor: alpha(GLASS_COLORS.primary, 0.05),
                      borderColor: alpha(GLASS_COLORS.primary, 0.3),
                      '&:hover': {
                        backgroundColor: alpha(GLASS_COLORS.primary, 0.15),
                        borderColor: GLASS_COLORS.primary,
                      },
                    },
                    '&.MuiPaginationItem-ellipsis': {
                      border: 'none',
                      background: 'transparent',
                      backdropFilter: 'none',
                      minWidth: { xs: 24, sm: 32, md: 36 },
                      height: { xs: 24, sm: 32, md: 36 },
                      color: GLASS_COLORS.textSecondary,
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        )}
      </Container>

      <FeedbackFab />
      <Footer />
    </Box>
  );
};