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
  useTheme as useMuiTheme,
  SwipeableDrawer,
  DialogActions,
  DialogContent,
  Dialog,
  InputLabel,
  DialogTitle,
  Tabs,
  Alert,
  Tab,
  Tooltip,
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
  AccountTree,
  Storage,
  Code,
  Bolt,
  Terminal,
  BubbleChart,
} from '@mui/icons-material';
import { questionService } from '../services/questionService';
import { categoryService } from '../services/categoryService';
import { questionCompletionService } from '../services/questionCompletionService';
import { FeedbackFab } from '../components/FeedbackFab';
import { ThemeToggle } from '../components/ThemeToggle';
import type { Question, Category, ContentBlock } from '../types';
import { useAuth } from '../context/AuthContext';
import { ContentEditor } from '../components/Admin/ContentEditor';
import { useTheme as useThemeContext } from '../context/ThemeContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

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
  };
};

// Старая константа оставляем для совместимости, по умолчанию light mode
const GLASS_COLORS = getGlassColors('light');

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

// Улучшенная статистическая карточка в стеклянном стиле
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

const GlassEnhancedStatCard: React.FC<EnhancedStatCardProps> = ({ 
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
          borderRadius: 4,
          background: GLASS_COLORS.surface,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '2px solid',
          borderColor: isActive ? GLASS_COLORS.success : GLASS_COLORS.border,
          height: '100%',
          transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
          cursor: 'pointer',
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
            background: `radial-gradient(circle at 30% 30%, ${GLASS_COLORS.success} 0%, transparent 70%)`,
            opacity: isActive ? 0.3 : 0,
            zIndex: -1,
            filter: 'blur(30px)',
            transition: 'opacity 0.4s ease',
          },
          '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            borderColor: isActive ? GLASS_COLORS.success : GLASS_COLORS.borderGlow,
            boxShadow: `0 16px 32px ${alpha(GLASS_COLORS.success, 0.2)}`,
            '&::before': {
              opacity: 1,
            },
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
              background: isActive ? alpha(GLASS_COLORS.success, 0.2) : alpha(GLASS_COLORS.success, 0.15),
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: alpha(GLASS_COLORS.success, 0.3),
              color: isActive ? GLASS_COLORS.success : alpha(GLASS_COLORS.success, 0.7),
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: isActive ? GLASS_COLORS.success : GLASS_COLORS.textPrimary,
                fontSize: '1.1rem',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isActive ? alpha(GLASS_COLORS.success, 0.8) : GLASS_COLORS.textSecondary,
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
            fontWeight: 700,
            color: isActive ? GLASS_COLORS.success : GLASS_COLORS.textSecondary,
            fontSize: '3rem',
            lineHeight: 1,
            textAlign: 'center',
            mb: 2,
            letterSpacing: '-0.02em',
          }}
        >
          {value}%
        </Typography>
        
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
                width: `${Math.min(percentage, 100)}%`,
                height: '100%',
                borderRadius: 3,
                background: `linear-gradient(90deg, ${GLASS_COLORS.success}, ${alpha(GLASS_COLORS.success, 0.6)})`,
                transition: 'width 1s ease-out',
                boxShadow: `0 2px 8px ${alpha(GLASS_COLORS.success, 0.3)}`,
              }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: GLASS_COLORS.textSecondary,
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
              backgroundColor: GLASS_COLORS.success,
              boxShadow: `0 0 12px ${GLASS_COLORS.success}`,
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
        borderRadius: 4,
        background: GLASS_COLORS.surface,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '2px solid',
        borderColor: isActive ? color : GLASS_COLORS.border,
        height: '100%',
        transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
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
          opacity: isActive ? 0.3 : 0,
          zIndex: -1,
          filter: 'blur(30px)',
          transition: 'opacity 0.4s ease',
        },
        '&:hover': {
          transform: 'translateY(-6px) scale(1.02)',
          borderColor: isActive ? color : GLASS_COLORS.borderGlow,
          boxShadow: `0 20px 40px ${alpha(color, 0.15)}`,
          '&::before': {
            opacity: 1,
          },
          '&::after': {
            opacity: 0.3,
          },
        },
      }}
    >
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
            background: alpha(color, isActive ? 0.25 : 0.15),
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: alpha(color, 0.3),
            color: color,
            flexShrink: 0,
            boxShadow: `0 8px 16px ${alpha(color, 0.2)}`,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: GLASS_COLORS.textPrimary,
              fontSize: '1.1rem',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: GLASS_COLORS.textSecondary,
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
              fontWeight: 700,
              color: color,
              fontSize: '3rem',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              textShadow: `0 4px 12px ${alpha(color, 0.3)}`,
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
                fontWeight: 600,
                backgroundColor: alpha(color, 0.15),
                backdropFilter: 'blur(10px)',
                color: color,
                border: '1px solid',
                borderColor: alpha(color, 0.3),
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
            backgroundColor: alpha(GLASS_COLORS.border, 0.5),
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box
            sx={{
              width: `${Math.min(percentage, 100)}%`,
              height: '100%',
              borderRadius: 3,
              background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.6)} 100%)`,
              transition: 'width 1s ease-out',
              boxShadow: `0 2px 8px ${alpha(color, 0.3)}`,
            }}
          />
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: GLASS_COLORS.textSecondary,
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

// Статистический блок с интерактивными фильтрами в стеклянном стиле
const GlassStatisticsSection: React.FC<{
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
      color: GLASS_COLORS.primary,
      filter: '',
      percentage: 100,
    },
    {
      title: 'Легкие',
      value: easy,
      icon: <SpeedIcon sx={{ fontSize: 28 }} />,
      color: GLASS_COLORS.success,
      filter: 'easy',
      percentage: total > 0 ? (easy / total) * 100 : 0,
    },
    {
      title: 'Средние',
      value: medium,
      icon: <BarChartIcon sx={{ fontSize: 28 }} />,
      color: GLASS_COLORS.warning,
      filter: 'medium',
      percentage: total > 0 ? (medium / total) * 100 : 0,
    },
    {
      title: 'Сложные',
      value: hard,
      icon: <TimelineIcon sx={{ fontSize: 28 }} />,
      color: GLASS_COLORS.error,
      filter: 'hard',
      percentage: total > 0 ? (hard / total) * 100 : 0,
    },
    {
      title: 'Выполнено',
      value: Math.round(completionPercentage),
      icon: <CheckCircleIcon sx={{ fontSize: 28 }} />,
      color: GLASS_COLORS.success,
      filter: 'completed',
      percentage: completionPercentage,
      isCompletionFilter: true,
    },
  ];

  const handleCardClick = (stat: any) => {
    if (stat.isCompletionFilter) {
      if (activeCompletionFilter === true) {
        onCompletionFilterSelect(undefined);
      } else {
        onCompletionFilterSelect(true);
      }
    } else {
      onFilterSelect(stat.filter);
    }
  };

  return (
    <Fade in={true}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: GLASS_COLORS.textPrimary,
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2.25rem' },
                letterSpacing: '-0.02em',
                textShadow: '0 2px 10px rgba(255,255,255,0.5)',
              }}
            >
              Статистика вопросов
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: GLASS_COLORS.textSecondary,
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
                    backgroundColor: alpha(GLASS_COLORS.success, 0.15),
                    backdropFilter: 'blur(10px)',
                    color: GLASS_COLORS.success,
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: alpha(GLASS_COLORS.success, 0.3),
                  }}
                />
              )}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={6} lg={stat.isCompletionFilter ? 3 : 2.25} key={stat.title}>
              <GlassEnhancedStatCard
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

        {total > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              background: GLASS_COLORS.surface,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: GLASS_COLORS.border,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: GLASS_COLORS.textPrimary,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                letterSpacing: '-0.01em',
              }}
            >
              Распределение по сложности
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: 40 }}>
              {easy > 0 && (
                <Box
                  sx={{
                    flex: easy,
                    height: 32,
                    borderRadius: 2,
                    background: `linear-gradient(90deg, ${GLASS_COLORS.success} 0%, ${alpha(GLASS_COLORS.success, 0.6)} 100%)`,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: alpha(GLASS_COLORS.success, 0.3),
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'scaleY(1.2)',
                      boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.success, 0.3)}`,
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
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    {easy} ({((easy / total) * 100).toFixed(1)}%)
                  </Typography>
                </Box>
              )}
              
              {medium > 0 && (
                <Box
                  sx={{
                    flex: medium,
                    height: 40,
                    borderRadius: 2,
                    background: `linear-gradient(90deg, ${GLASS_COLORS.warning} 0%, ${alpha(GLASS_COLORS.warning, 0.6)} 100%)`,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: alpha(GLASS_COLORS.warning, 0.3),
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'scaleY(1.2)',
                      boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.warning, 0.3)}`,
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
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    {medium} ({((medium / total) * 100).toFixed(1)}%)
                  </Typography>
                </Box>
              )}
              
              {hard > 0 && (
                <Box
                  sx={{
                    flex: hard,
                    height: 48,
                    borderRadius: 2,
                    background: `linear-gradient(90deg, ${GLASS_COLORS.error} 0%, ${alpha(GLASS_COLORS.error, 0.6)} 100%)`,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: alpha(GLASS_COLORS.error, 0.3),
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'scaleY(1.2)',
                      boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.error, 0.3)}`,
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
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    {hard} ({((hard / total) * 100).toFixed(1)}%)
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: GLASS_COLORS.success }} />
                <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary }}>
                  Легкие
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: GLASS_COLORS.warning }} />
                <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary }}>
                  Средние
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: GLASS_COLORS.error }} />
                <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary }}>
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

// Стилизованная карточка вопроса в стеклянном стиле
interface GlassQuestionCardProps {
  question: Question;
  onClick: () => void;
  index: number;
  categories: Category[];
  onCompletionChange?: () => void;
  currentUserId?: string;
}

const GlassQuestionCard: React.FC<GlassQuestionCardProps> = ({ 
  question, 
  onClick, 
  index, 
  categories,
  onCompletionChange,
  currentUserId,
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompletionLoading, setIsCompletionLoading] = useState(false);

  useEffect(() => {
    questionCompletionService.isQuestionCompleted(question.id)
      .then(result => setIsCompleted(result.is_completed))
      .catch(err => console.error('Failed to check completion status:', err));
  }, [question.id]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return GLASS_COLORS.success;
      case 'medium':
        return GLASS_COLORS.warning;
      case 'hard':
        return GLASS_COLORS.error;
      default:
        return GLASS_COLORS.secondary;
    }
  };

  const getCategoryName = (question: Question) => {
    if (question.category?.name) {
      return question.category.name;
    }
    
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
  const isUserIdQuestion = question.user_id === currentUserId;

  return (
    <Paper
      elevation={0}
      sx={{
        cursor: 'pointer',
        borderRadius: 4,
        background: GLASS_COLORS.surface,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: GLASS_COLORS.border,
        transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
        position: 'relative',
        overflow: 'hidden',
        mb: 2,
        width: '100%',
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
          background: `radial-gradient(circle at 30% 30%, ${isCompleted ? GLASS_COLORS.success : GLASS_COLORS.primary} 0%, transparent 70%)`,
          opacity: 0,
          zIndex: -1,
          filter: 'blur(30px)',
          transition: 'opacity 0.4s ease',
        },
        '&:hover': {
          transform: 'translateY(-3px) scale(1.01)',
          borderColor: isCompleted ? GLASS_COLORS.success : GLASS_COLORS.borderGlow,
          boxShadow: `0 16px 32px ${alpha(isCompleted ? GLASS_COLORS.success : GLASS_COLORS.primary, 0.15)}`,
          '&::before': {
            opacity: 1,
          },
          '&::after': {
            opacity: 0.3,
          },
          '& .question-title': {
            color: isCompleted ? GLASS_COLORS.success : GLASS_COLORS.primary,
          },
        },
      }}
      onClick={() => window.open(`/questions/${question.id}`, '_blank')}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '16px',
              background: alpha(GLASS_COLORS.primary, 0.15),
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: alpha(GLASS_COLORS.primary, 0.3),
              color: GLASS_COLORS.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.25rem',
              flexShrink: 0,
            }}
          >
            {index + 1}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              className="question-title"
              variant="h6"
              sx={{
                fontWeight: 600,
                color: GLASS_COLORS.textPrimary,
                mb: 1,
                fontSize: '1.125rem',
                lineHeight: 1.4,
                transition: 'color 0.2s',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
              }}
            >
              {question.title}
            </Typography>

            <Stack 
              direction="row" 
              spacing={1.5} 
              alignItems="center" 
              flexWrap="wrap" 
              useFlexGap
              sx={{
                // Добавляем небольшой контейнер для лучшей группировки
                p: 0.5,
                borderRadius: 2,
                backgroundColor: alpha(GLASS_COLORS.surface, 0.1),
                backdropFilter: 'blur(5px)',
                display: 'inline-flex',
              }}
            >
              {/* Чип сложности */}
              <Tooltip title={question.difficulty} arrow placement="top">
                <Chip
                  label={
                    <Box sx={{ 
                      display: { xs: 'none', sm: 'inline' },
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      letterSpacing: '0.3px',
                    }}>
                      {question.difficulty}
                    </Box>
                  }
                  size="small"
                  icon={<BoltIcon sx={{ 
                    fontSize: { xs: '1.2rem', sm: '0.9rem' },
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }} />}
                  sx={{
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${alpha(getDifficultyColor(question.difficulty), 0.2)} 0%, ${alpha(getDifficultyColor(question.difficulty), 0.1)} 100%)`,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    color: getDifficultyColor(question.difficulty),
                    border: '1px solid',
                    borderColor: alpha(getDifficultyColor(question.difficulty), 0.4),
                    fontSize: '0.9rem',
                    height: { xs: 32, sm: 28 },
                    width: { xs: 32, sm: 'auto' },
                    justifyContent: 'center',
                    borderRadius: '8px', // Более квадратные, как в macOS
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.3) inset',
                    transition: 'all 0.2s ease',
                    '& .MuiChip-icon': {
                      color: getDifficultyColor(question.difficulty),
                      m: 0,
                      fontSize: { xs: '1.2rem !important', sm: '0.9rem !important' },
                    },
                    '& .MuiChip-label': {
                      display: { xs: 'none', sm: 'block' },
                      px: 1.5,
                    },
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(getDifficultyColor(question.difficulty), 0.3)} 0%, ${alpha(getDifficultyColor(question.difficulty), 0.2)} 100%)`,
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 12px ${alpha(getDifficultyColor(question.difficulty), 0.2)}, 0 0 0 1px rgba(255,255,255,0.5) inset`,
                      borderColor: alpha(getDifficultyColor(question.difficulty), 0.6),
                    },
                  }}
                />
              </Tooltip>

              {/* Чип категории */}
              {categoryName && (
                <Tooltip title={categoryName} arrow placement="top">
                  <Chip
                    icon={React.createElement(categoryIconMap[categoryName] || CategoryIcon, { 
                      sx: { 
                        fontSize: { xs: '1.2rem', sm: '0.9rem' },
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      } 
                    })}
                    label={
                      <Box sx={{ 
                        display: { xs: 'none', sm: 'inline' },
                        fontWeight: 500,
                      }}>
                        {categoryName}
                      </Box>
                    }
                    size="small"
                    sx={{
                      fontWeight: 500,
                      background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.info, 0.15)} 0%, ${alpha(GLASS_COLORS.info, 0.05)} 100%)`,
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      color: GLASS_COLORS.info,
                      border: '1px solid',
                      borderColor: alpha(GLASS_COLORS.info, 0.3),
                      fontSize: '1.0rem',
                      height: { xs: 32, sm: 28 },
                      width: { xs: 32, sm: 'auto' },
                      justifyContent: 'center',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.3) inset',
                      transition: 'all 0.2s ease',
                      '& .MuiChip-icon': {
                        fontSize: { xs: '1.2rem', sm: '0.9rem' },
                        color: GLASS_COLORS.info,
                      },
                      '& .MuiChip-label': {
                        display: { xs: 'none', sm: 'block' },
                      },
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.info, 0.25)} 0%, ${alpha(GLASS_COLORS.info, 0.15)} 100%)`,
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.info, 0.15)}, 0 0 0 1px rgba(255,255,255,0.5) inset`,
                        borderColor: alpha(GLASS_COLORS.info, 0.5),
                      },
                    }}
                  />
                </Tooltip>
              )}
              
              {/* Чип "Твой вопрос" */}
              {isUserIdQuestion && (
                <Tooltip title="Твой вопрос" arrow placement="top">
                  <Chip
                    icon={<PersonIcon sx={{ 
                      fontSize: { xs: '1.2rem', sm: '0.9rem' },
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }} />}
                    label={
                      <Box sx={{ 
                        display: { xs: 'none', sm: 'inline' },
                        fontWeight: 500,
                      }}>
                        Твой вопрос
                      </Box>
                    }
                    size="small"
                    sx={{
                      fontWeight: 500,
                      background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.question, 0.15)} 0%, ${alpha(GLASS_COLORS.question, 0.05)} 100%)`,
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      color: GLASS_COLORS.question,
                      border: '1px solid',
                      borderColor: alpha(GLASS_COLORS.question, 0.3),
                      fontSize: '0.9rem',
                      height: { xs: 32, sm: 28 },
                      width: { xs: 32, sm: 'auto' },
                      justifyContent: 'center',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.3) inset',
                      transition: 'all 0.2s ease',
                      '& .MuiChip-icon': {
                        fontSize: { xs: '1.2rem', sm: '0.9rem' },
                        color: GLASS_COLORS.question,
                        m: 0,
                      },
                      '& .MuiChip-label': {
                        display: { xs: 'none', sm: 'block' },
                        px: 1.5,
                      },
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.question, 0.25)} 0%, ${alpha(GLASS_COLORS.question, 0.15)} 100%)`,
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.question, 0.15)}, 0 0 0 1px rgba(255,255,255,0.5) inset`,
                        borderColor: alpha(GLASS_COLORS.question, 0.5),
                      },
                    }}
                  />
                </Tooltip>
              )}
            </Stack>
          </Box>
        </Box>

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
              color: isCompleted ? GLASS_COLORS.success : GLASS_COLORS.textSecondary,
              backgroundColor: alpha(GLASS_COLORS.background, 0.8),
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: isCompleted ? alpha(GLASS_COLORS.success, 0.3) : GLASS_COLORS.border,
              '&:hover': {
                backgroundColor: alpha(isCompleted ? GLASS_COLORS.success : GLASS_COLORS.primary, 0.1),
                borderColor: isCompleted ? GLASS_COLORS.success : GLASS_COLORS.primary,
              },
            }}
          >
            {isCompletionLoading ? (
              <CircularProgress size={20} sx={{ color: GLASS_COLORS.primary }} />
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
              color: GLASS_COLORS.textSecondary,
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

// Стилизованная кнопка фильтров в стеклянном стиле
interface GlassFilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}

const GlassFilterButton: React.FC<GlassFilterButtonProps> = ({ active, onClick, children, color }) => (
  <Button
    variant={active ? 'contained' : 'outlined'}
    onClick={onClick}
    sx={{
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: 3,
      px: 2.5,
      py: 1,
      borderWidth: '2px',
      borderColor: active ? (color || GLASS_COLORS.primary) : GLASS_COLORS.border,
      background: active ? `linear-gradient(135deg, ${color || GLASS_COLORS.primary}, ${alpha(color || GLASS_COLORS.primary, 0.7)})` : GLASS_COLORS.surface,
      backdropFilter: 'blur(10px)',
      color: active ? 'white' : (color || GLASS_COLORS.textPrimary),
      fontSize: '0.875rem',
      '&:hover': {
        borderColor: color || GLASS_COLORS.primary,
        background: active 
          ? `linear-gradient(135deg, ${alpha(color || GLASS_COLORS.primary, 0.9)}, ${alpha(color || GLASS_COLORS.primary, 0.6)})`
          : alpha(color || GLASS_COLORS.primary, 0.1),
        transform: 'translateY(-1px)',
      },
      transition: 'all 0.3s ease',
    }}
  >
    {children}
  </Button>
);


const categoryIconMap: Record<string, React.ElementType> = {
  'Django': Code,
  'FastAPI': Bolt,
  'Python': Terminal,
  'SQL': Storage,
  'System Design': AccountTree,
  'Алгоритмы': BubbleChart,
};

// Компонент панели фильтров в стеклянном стиле
const GlassFiltersPanel: React.FC<{
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
        borderRadius: 4,
        background: GLASS_COLORS.surface,
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid',
        borderColor: GLASS_COLORS.border,
        height: 'fit-content',
        width: '100%',
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
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: GLASS_COLORS.textPrimary,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          letterSpacing: '-0.02em',
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
              },
            }}
          />
        </Box>

        <Divider sx={{ borderColor: GLASS_COLORS.border }} />
        
        <Box>
          <Stack spacing={1}>            
            <GlassFilterButton
              active={isCompletedFilter === false}
              onClick={() => setIsCompletedFilter?.(isCompletedFilter === false ? undefined : false)}
              color={GLASS_COLORS.warning}
            >
              Показать невыполненные
            </GlassFilterButton>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: GLASS_COLORS.border }} />

        {/* Категория */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: GLASS_COLORS.textPrimary,
              mb: 2,
              letterSpacing: '-0.01em',
            }}
          >
            Выберите категорию
          </Typography>
          <FormControl fullWidth size="medium">
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              displayEmpty
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: 'white',
                    },
                  },
                }}
              renderValue={(selected) => {
                if (!selected) {
                  return (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CategoryIcon sx={{ color: GLASS_COLORS.textSecondary, fontSize: '1rem' }} />
                      <Typography sx={{ color: GLASS_COLORS.textSecondary }}>
                        Все категории
                      </Typography>
                    </Stack>
                  );
                }
                const category = categories.find(c => c.id === selected);
                if (!category) {
                  return (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CategoryIcon sx={{ color: GLASS_COLORS.info, fontSize: '1rem' }} />
                      <Typography sx={{ color: GLASS_COLORS.textPrimary }}>
                        Неизвестная категория
                      </Typography>
                    </Stack>
                  );
                }

                const IconComponent = categoryIconMap[category.name] || CategoryIcon;
                return (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <IconComponent sx={{ color: GLASS_COLORS.info, fontSize: '1.2rem' }} />
                    <Typography sx={{ color: GLASS_COLORS.textPrimary, fontWeight: 600 }}>
                      {category.name}
                    </Typography>
                    {category.question_count && (
                      <Chip
                        label={category.question_count}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          backgroundColor: alpha(GLASS_COLORS.info, 0.15),
                          backdropFilter: 'blur(10px)',
                          color: GLASS_COLORS.info,
                          border: '1px solid',
                          borderColor: alpha(GLASS_COLORS.info, 0.3),
                        }}
                      />
                    )}
                  </Stack>
                );
              }}
              sx={{
                borderRadius: 3,
                background: GLASS_COLORS.background,
                backdropFilter: 'blur(10px)',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: GLASS_COLORS.primary,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: GLASS_COLORS.primary,
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
                  <CategoryIcon sx={{ color: GLASS_COLORS.textSecondary, fontSize: '1rem' }} />
                  <Typography sx={{ color: GLASS_COLORS.textSecondary }}>
                    Все категории
                  </Typography>
                </Stack>
              </MenuItem>
              {categories.map((category) => {
                const IconComponent = categoryIconMap[category.name] || CategoryIcon;

              return (
                <MenuItem key={category.id} value={category.id}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <IconComponent sx={{ color: GLASS_COLORS.textSecondary, fontSize: '1rem' }} />
                      <Typography sx={{ color: GLASS_COLORS.textSecondary }}>
                        {category.name}
                      </Typography>
                    </Stack>
                    {category.question_count && (
                      <Chip
                        label={category.question_count}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          backgroundColor: alpha(GLASS_COLORS.info, 0.15),
                          backdropFilter: 'blur(10px)',
                          color: GLASS_COLORS.info,
                          border: '1px solid',
                          borderColor: alpha(GLASS_COLORS.info, 0.3),
                        }}
                      />
                    )}
                  </Stack>
                </MenuItem>
              );
            })}
            </Select>
            {isLoadingCategories && (
              <CircularProgress 
                size={20} 
                sx={{ 
                  position: 'absolute', 
                  right: 40, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: GLASS_COLORS.primary,
                }} 
              />
            )}
          </FormControl>
        </Box>

        <Divider sx={{ borderColor: GLASS_COLORS.border }} />

        {/* Сложность */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: GLASS_COLORS.textPrimary,
              mb: 2,
              letterSpacing: '-0.01em',
            }}
          >
            Выберите сложность
          </Typography>
          <Stack spacing={1}>
            <GlassFilterButton
              active={difficulty === 'easy'}
              onClick={() => setDifficulty('easy')}
              color={GLASS_COLORS.success}
            >
              Easy
            </GlassFilterButton>
            <GlassFilterButton
              active={difficulty === 'medium'}
              onClick={() => setDifficulty('medium')}
              color={GLASS_COLORS.warning}
            >
              Medium
            </GlassFilterButton>
            <GlassFilterButton
              active={difficulty === 'hard'}
              onClick={() => setDifficulty('hard')}
              color={GLASS_COLORS.error}
            >
              Hard
            </GlassFilterButton>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: GLASS_COLORS.border }} />

        {/* Сортировка */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: GLASS_COLORS.textPrimary,
              mb: 2,
              letterSpacing: '-0.01em',
            }}
          >
            Сортировка
          </Typography>
          
          <Stack spacing={2}>
            <FormControl fullWidth size="medium">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Typography sx={{ color: GLASS_COLORS.textSecondary }}>
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
                          backgroundColor: GLASS_COLORS.primary,
                          boxShadow: `0 0 8px ${GLASS_COLORS.primary}`,
                        }}
                      />
                      <Typography sx={{ color: GLASS_COLORS.textPrimary, fontWeight: 600 }}>
                        {getSortLabel(selected)}
                      </Typography>
                    </Stack>
                  );
                }}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: alpha(GLASS_COLORS.primary, 0.3),
                  background: alpha(GLASS_COLORS.primary, 0.05),
                  backdropFilter: 'blur(10px)',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: GLASS_COLORS.primary,
                    borderWidth: 2,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: GLASS_COLORS.primary,
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
                        backgroundColor: sortBy === 'updated_at' ? GLASS_COLORS.primary : 'transparent',
                        border: `2px solid ${sortBy === 'updated_at' ? GLASS_COLORS.primary : GLASS_COLORS.border}`,
                        boxShadow: sortBy === 'updated_at' ? `0 0 6px ${GLASS_COLORS.primary}` : 'none',
                      }}
                    />
                    <Typography sx={{ fontWeight: sortBy === 'updated_at' ? 600 : 400 }}>
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
                        backgroundColor: sortBy === 'created_at' ? GLASS_COLORS.primary : 'transparent',
                        border: `2px solid ${sortBy === 'created_at' ? GLASS_COLORS.primary : GLASS_COLORS.border}`,
                        boxShadow: sortBy === 'created_at' ? `0 0 6px ${GLASS_COLORS.primary}` : 'none',
                      }}
                    />
                    <Typography sx={{ fontWeight: sortBy === 'created_at' ? 600 : 400 }}>
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
                        backgroundColor: sortBy === 'title' ? GLASS_COLORS.primary : 'transparent',
                        border: `2px solid ${sortBy === 'title' ? GLASS_COLORS.primary : GLASS_COLORS.border}`,
                        boxShadow: sortBy === 'title' ? `0 0 6px ${GLASS_COLORS.primary}` : 'none',
                      }}
                    />
                    <Typography sx={{ fontWeight: sortBy === 'title' ? 600 : 400 }}>
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
                        backgroundColor: sortBy === 'difficulty' ? GLASS_COLORS.primary : 'transparent',
                        border: `2px solid ${sortBy === 'difficulty' ? GLASS_COLORS.primary : GLASS_COLORS.border}`,
                        boxShadow: sortBy === 'difficulty' ? `0 0 6px ${GLASS_COLORS.primary}` : 'none',
                      }}
                    />
                    <Typography sx={{ fontWeight: sortBy === 'difficulty' ? 600 : 400 }}>
                      По сложности
                    </Typography>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>
            
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
                  borderRadius: 3,
                  borderColor: sortDir === 'asc' ? GLASS_COLORS.primary : GLASS_COLORS.border,
                  background: sortDir === 'asc' ? `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${alpha(GLASS_COLORS.primary, 0.7)})` : GLASS_COLORS.surface,
                  backdropFilter: 'blur(10px)',
                  color: sortDir === 'asc' ? 'white' : GLASS_COLORS.textPrimary,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: sortDir === 'asc' ? GLASS_COLORS.primary : GLASS_COLORS.primary,
                    background: sortDir === 'asc' 
                      ? `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.primary, 0.6)})`
                      : alpha(GLASS_COLORS.primary, 0.1),
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
                  borderRadius: 3,
                  borderColor: sortDir === 'desc' ? GLASS_COLORS.primary : GLASS_COLORS.border,
                  background: sortDir === 'desc' ? `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${alpha(GLASS_COLORS.primary, 0.7)})` : GLASS_COLORS.surface,
                  backdropFilter: 'blur(10px)',
                  color: sortDir === 'desc' ? 'white' : GLASS_COLORS.textPrimary,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: sortDir === 'desc' ? GLASS_COLORS.primary : GLASS_COLORS.primary,
                    background: sortDir === 'desc' 
                      ? `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.primary, 0.6)})`
                      : alpha(GLASS_COLORS.primary, 0.1),
                  },
                }}
              >
                Убывание
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: GLASS_COLORS.border }} />

        {/* Количество на странице */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: GLASS_COLORS.textPrimary,
              mb: 2,
              letterSpacing: '-0.01em',
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
                sx={{
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: limit === itemLimit ? GLASS_COLORS.primary : GLASS_COLORS.border,
                  background: limit === itemLimit 
                    ? `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${alpha(GLASS_COLORS.primary, 0.7)})`
                    : GLASS_COLORS.surface,
                  backdropFilter: 'blur(10px)',
                  color: limit === itemLimit ? 'white' : GLASS_COLORS.textPrimary,
                  '&:hover': {
                    borderColor: GLASS_COLORS.primary,
                    background: limit === itemLimit 
                      ? `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.primary, 0.6)})`
                      : alpha(GLASS_COLORS.primary, 0.1),
                  },
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ borderColor: GLASS_COLORS.border }} />

        {/* Сброс фильтров */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={handleResetFilters}
          sx={{
            borderWidth: 2,
            borderRadius: 3,
            borderColor: GLASS_COLORS.border,
            color: GLASS_COLORS.textPrimary,
            py: 1.5,
            fontWeight: 600,
            fontSize: '1rem',
            background: GLASS_COLORS.surface,
            backdropFilter: 'blur(10px)',
            '&:hover': {
              borderColor: GLASS_COLORS.primary,
              background: alpha(GLASS_COLORS.primary, 0.1),
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.3s ease',
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
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(1000));
  const isMobileFilter = useMediaQuery(theme.breakpoints.down(1000));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const { mode: themeMode } = useThemeContext();
  const GLASS_COLORS = getGlassColors(themeMode);
  
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

  const getSelectedCategoryIcon = () => {
    if (!categoryId) return CategoryIcon;
    const category = categories.find(c => c.id === categoryId);
    if (!category) return CategoryIcon;
    return categoryIconMap[category.name] || CategoryIcon;
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
        background: GLASS_COLORS.mainColor,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',

      }}
    >
      <Header />
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Hero Section в стеклянном стиле */}
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
              borderColor: alpha(GLASS_COLORS.primary, 0.3),
              color: GLASS_COLORS.primary,
              fontWeight: 600,
              px: 3,
              py: 1.5,
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 1,
              background: GLASS_COLORS.surface,
              backdropFilter: 'blur(10px)',
              '&:hover': {
                borderColor: GLASS_COLORS.primary,
                background: alpha(GLASS_COLORS.primary, 0.1),
                transform: 'translateY(-50%) translateX(-4px)',
                boxShadow: `0 8px 24px ${alpha(GLASS_COLORS.primary, 0.2)}`,
              },
              transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
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
              color: GLASS_COLORS.primary,
              backgroundColor: alpha(GLASS_COLORS.primary, 0.15),
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: alpha(GLASS_COLORS.primary, 0.3),
              '&:hover': {
                backgroundColor: alpha(GLASS_COLORS.primary, 0.25),
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
              borderColor: alpha(GLASS_COLORS.primary, 0.3),
              color: GLASS_COLORS.primary,
              fontWeight: 600,
              px: 3,
              py: 1.5,
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 1,
              background: GLASS_COLORS.surface,
              backdropFilter: 'blur(10px)',
              '&:hover': {
                borderColor: GLASS_COLORS.primary,
                background: alpha(GLASS_COLORS.primary, 0.1),
                transform: 'translateY(-50%) translateX(4px)',
                boxShadow: `0 8px 24px ${alpha(GLASS_COLORS.primary, 0.2)}`,
              },
              transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
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
              color: GLASS_COLORS.primary,
              backgroundColor: alpha(GLASS_COLORS.primary, 0.15),
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: alpha(GLASS_COLORS.primary, 0.3),
              '&:hover': {
                backgroundColor: alpha(GLASS_COLORS.primary, 0.25),
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
                transform: 'translateY(10px)',
                transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
              }}
            >
              {total}
            </Box>

            {/* Индикатор сложности */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 10,
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
                  backgroundColor: totalCounts.easy > 0 ? GLASS_COLORS.success : alpha(GLASS_COLORS.success, 0.3),
                  boxShadow: totalCounts.easy > 0 ? `0 0 8px ${GLASS_COLORS.success}` : 'none',
                  transition: 'all 0.3s',
                }}
              />
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: totalCounts.medium > 0 ? GLASS_COLORS.warning : alpha(GLASS_COLORS.warning, 0.3),
                  boxShadow: totalCounts.medium > 0 ? `0 0 8px ${GLASS_COLORS.warning}` : 'none',
                  transition: 'all 0.3s',
                }}
              />
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: totalCounts.hard > 0 ? GLASS_COLORS.error : alpha(GLASS_COLORS.error, 0.3),
                  boxShadow: totalCounts.hard > 0 ? `0 0 8px ${GLASS_COLORS.error}` : 'none',
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
                fontWeight: 700,
                color: GLASS_COLORS.textPrimary,
                letterSpacing: '-0.02em',
                mb: 3,
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                textShadow: '0 4px 20px rgba(255,255,255,0.5)',
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
                  background: `linear-gradient(90deg, ${GLASS_COLORS.primary} 0%, ${GLASS_COLORS.success} 100%)`,
                  transition: 'width 0.6s cubic-bezier(0.2, 0, 0, 1)',
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
                color: GLASS_COLORS.textSecondary,
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
                  background: `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${GLASS_COLORS.secondary})`,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha('#FFFFFF', 0.3),
                  color: 'white',
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.secondary, 0.9)})`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 16px ${alpha(GLASS_COLORS.primary, 0.3)}`,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Начни с легких вопросов
              </Button>
              
              <Typography
                variant="body2"
                sx={{
                  px: 2,
                  fontWeight: 600,
                  color: GLASS_COLORS.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  position: 'relative',
                  '&:before, &:after': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    width: 12,
                    height: 2,
                    backgroundColor: alpha(GLASS_COLORS.primary, 0.3),
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
                  borderColor: GLASS_COLORS.primary,
                  color: GLASS_COLORS.primary,
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  background: GLASS_COLORS.surface,
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    borderColor: GLASS_COLORS.primary,
                    backgroundColor: alpha(GLASS_COLORS.primary, 0.1),
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
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
                    borderRadius: 3,
                    border: '1px dashed',
                    borderColor: alpha(GLASS_COLORS.primary, 0.3),
                    background: alpha(GLASS_COLORS.primary, 0.1),
                    backdropFilter: 'blur(10px)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <FilterIcon fontSize="small" sx={{ color: GLASS_COLORS.primary }} />
                  <Typography variant="caption" sx={{ color: GLASS_COLORS.primary, fontWeight: 600 }}>
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
                      fontWeight: 600,
                      backgroundColor: alpha(GLASS_COLORS.primary, 0.2),
                      backdropFilter: 'blur(10px)',
                      color: GLASS_COLORS.primary,
                      border: '1px solid',
                      borderColor: alpha(GLASS_COLORS.primary, 0.3),
                    }}
                  />
                </Paper>
              </Fade>
            )}
          </Box>
        </Box>

        {/* Улучшенная статистика в стеклянном стиле */}
        {!isMobileFilter && (
        <div id="statistics-section">
          <GlassStatisticsSection
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
        
        {/* Drawer для мобильных фильтров в стеклянном стиле */}
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
              background: GLASS_COLORS.background,
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRight: '1px solid',
              borderColor: GLASS_COLORS.border,
            },
          }}
        >
          <GlassFiltersPanel
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

        {/* Основной контент */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Левая колонка - фильтры (фиксированная ширина) */}
          {!isMobileFilter && (
            <Box className="filters-column" sx={{ width: 320, flexShrink: 0 }}>
              <GlassFiltersPanel
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
                    borderRadius: 3,
                    borderColor: GLASS_COLORS.primary,
                    color: GLASS_COLORS.primary,
                    fontWeight: 600,
                    py: 1.5,
                    fontSize: '1rem',
                    background: GLASS_COLORS.surface,
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      backgroundColor: alpha(GLASS_COLORS.primary, 0.1),
                    },
                  }}
                >
                  Открыть фильтры
                </Button>
              </Box>
            )}

            {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 12 }}>
                <CircularProgress size={64} sx={{ color: GLASS_COLORS.primary }} />
              </Box>
            ) : filteredQuestions.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 8,
                  borderRadius: 4,
                  background: GLASS_COLORS.surface,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid',
                  borderColor: GLASS_COLORS.border,
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    borderRadius: '50%',
                    background: alpha(GLASS_COLORS.background, 0.8),
                    backdropFilter: 'blur(10px)',
                    display: 'inline-flex',
                    mb: 3,
                    border: '1px solid',
                    borderColor: GLASS_COLORS.border,
                  }}
                >
                  <QuestionIcon sx={{ fontSize: 64, color: GLASS_COLORS.textSecondary }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: GLASS_COLORS.textSecondary,
                    mb: 2,
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {debouncedSearch ? 'По вашему запросу ничего не найдено' : 'Вопросов пока нет'}
                </Typography>
                {debouncedSearch && (
                  <Button
                    variant="contained"
                    onClick={handleResetFilters}
                    sx={{
                      background: `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${alpha(GLASS_COLORS.primary, 0.7)})`,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: alpha('#FFFFFF', 0.3),
                      color: 'white',
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '1rem',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.primary, 0.6)})`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 16px ${alpha(GLASS_COLORS.primary, 0.3)}`,
                      },
                      transition: 'all 0.3s ease',
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
                        fontWeight: 700,
                        color: GLASS_COLORS.textPrimary,
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                        letterSpacing: '-0.02em',
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
                        fontWeight: 600,
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        fontSize: '0.875rem',
                        transition: 'all 0.3s ease',
                        minWidth: { xs: 'auto', sm: 180 },
                        ...(user?.is_admin ? {
                          background: `linear-gradient(135deg, ${GLASS_COLORS.success}, ${alpha(GLASS_COLORS.success, 0.7)})`,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid',
                          borderColor: alpha('#FFFFFF', 0.3),
                          color: 'white',
                          boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.success, 0.3)}`,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.success, 0.9)}, ${alpha(GLASS_COLORS.success, 0.6)})`,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 20px ${alpha(GLASS_COLORS.success, 0.4)}`,
                          }
                        } : {
                          borderColor: GLASS_COLORS.border,
                          color: GLASS_COLORS.textSecondary,
                          background: GLASS_COLORS.surface,
                          backdropFilter: 'blur(8px)',
                          '&:hover': {
                            borderColor: GLASS_COLORS.primary,
                            backgroundColor: alpha(GLASS_COLORS.primary, 0.1),
                          },
                          ...(isAddButtonDisabled && {
                            borderColor: GLASS_COLORS.success,
                            color: GLASS_COLORS.success,
                            backgroundColor: alpha(GLASS_COLORS.success, 0.1),
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
                          fontWeight: 600,
                          backgroundColor: alpha(GLASS_COLORS.primary, 0.15),
                          backdropFilter: 'blur(10px)',
                          color: GLASS_COLORS.primary,
                          border: '1px solid',
                          borderColor: alpha(GLASS_COLORS.primary, 0.3),
                          fontSize: '0.875rem',
                        }}
                      />
                    )}
                    {categoryId && (
                      <Chip
                        label={`Категория: ${getSelectedCategoryName() || 'Неизвестно'}`}
                        size="small"
                        onDelete={() => setCategoryId('')}
                        icon={React.createElement(getSelectedCategoryIcon(), { 
                          sx: { fontSize: '1rem' } 
                        })}
                        sx={{
                          fontWeight: 600,
                          backgroundColor: alpha(GLASS_COLORS.info, 0.15),
                          backdropFilter: 'blur(10px)',
                          color: GLASS_COLORS.info,
                          border: '1px solid',
                          borderColor: alpha(GLASS_COLORS.info, 0.3),
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
                          fontWeight: 600,
                          backgroundColor: alpha(GLASS_COLORS.warning, 0.15),
                          backdropFilter: 'blur(10px)',
                          color: GLASS_COLORS.warning,
                          border: '1px solid',
                          borderColor: alpha(GLASS_COLORS.warning, 0.3),
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
                          fontWeight: 600,
                          backgroundColor: isCompletedFilter 
                            ? alpha(GLASS_COLORS.success, 0.15) 
                            : alpha(GLASS_COLORS.warning, 0.15),
                          backdropFilter: 'blur(10px)',
                          color: isCompletedFilter ? GLASS_COLORS.success : GLASS_COLORS.warning,
                          border: '1px solid',
                          borderColor: isCompletedFilter 
                            ? alpha(GLASS_COLORS.success, 0.3) 
                            : alpha(GLASS_COLORS.warning, 0.3),
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
                          fontWeight: 600,
                          backgroundColor: alpha(GLASS_COLORS.success, 0.15),
                          backdropFilter: 'blur(10px)',
                          color: GLASS_COLORS.success,
                          border: '1px solid',
                          borderColor: alpha(GLASS_COLORS.success, 0.3),
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
                          fontWeight: 600,
                          backgroundColor: alpha(GLASS_COLORS.warning, 0.15),
                          backdropFilter: 'blur(10px)',
                          color: GLASS_COLORS.warning,
                          border: '1px solid',
                          borderColor: alpha(GLASS_COLORS.warning, 0.3),
                          fontSize: '0.875rem',
                        }}
                      />
                    )}
                  </Stack>
                )}

                {/* Список вопросов (вертикальный) */}
                <Box sx={{ mb: 4 }}>
                  {filteredQuestions.map((question, index) => (
                    <GlassQuestionCard
                      key={question.id}
                      question={question}
                      onClick={() => navigate(`/questions/${question.id}`)}
                      index={(page - 1) * limit + index}
                      categories={categories}
                      onCompletionChange={refreshStats}
                      currentUserId={user?.id || undefined}
                    />
                  ))}
                </Box>

                {/* Пагинация */}
                {totalPages > 1 && (
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
                        count={totalPages}
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
                            // Стили для иконок навигации
                            '&.MuiPaginationItem-previousNext': {
                              backgroundColor: alpha(GLASS_COLORS.primary, 0.05),
                              borderColor: alpha(GLASS_COLORS.primary, 0.3),
                              '&:hover': {
                                backgroundColor: alpha(GLASS_COLORS.primary, 0.15),
                                borderColor: GLASS_COLORS.primary,
                              },
                            },
                            // Стили для многоточия
                            '&.MuiPaginationItem-ellipsis': {
                              border: 'none',
                              background: 'transparent',
                              backdropFilter: 'none',
                              minWidth: { xs: 24, sm: 32, md: 36 },
                              color: GLASS_COLORS.textSecondary,
                              '&:hover': {
                                backgroundColor: 'transparent',
                                transform: 'none',
                              },
                            },
                          },
                          // Адаптивные медиа-запросы для очень маленьких экранов
                          '@media (max-width: 380px)': {
                            '& .MuiPaginationItem-root': {
                              minWidth: 32,
                              height: 32,
                              fontSize: '0.75rem',
                              margin: '0 1px',
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

      {/* Модалка добавления вопроса в стеклянном стиле */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: GLASS_COLORS.surfaceDark,
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid',
            borderColor: GLASS_COLORS.border,
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid',
          borderColor: GLASS_COLORS.border,
          pb: 2,
          fontWeight: 600,
          color: GLASS_COLORS.textPrimary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          letterSpacing: '-0.01em',
        }}>
          Создать новый вопрос
          {dialogError && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                borderRadius: 3,
                background: alpha(GLASS_COLORS.error, 0.15),
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: alpha(GLASS_COLORS.error, 0.3),
                color: GLASS_COLORS.error,
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
                    borderRadius: 3,
                    background: GLASS_COLORS.background,
                    backdropFilter: 'blur(10px)',
                    '&:hover fieldset': {
                      borderColor: GLASS_COLORS.primary,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: GLASS_COLORS.primary,
                    },
                  },
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
                    borderRadius: 3,
                    background: GLASS_COLORS.background,
                    backdropFilter: 'blur(10px)',
                    '&:hover fieldset': {
                      borderColor: GLASS_COLORS.primary,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: GLASS_COLORS.primary,
                    },
                  },
                }}
                helperText="URL-friendly версия названия (генерируется автоматически)"
                FormHelperTextProps={{
                  sx: { color: GLASS_COLORS.textSecondary }
                }}
              />
              
              {/* Категория */}
              <FormControl fullWidth size="medium">
                <InputLabel sx={{ color: GLASS_COLORS.textSecondary }}>Категория *</InputLabel>
                <Select
                  value={formData.category_id}
                  label="Категория *"
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  disabled={isLoadingCategories}
                  sx={{
                    borderRadius: 3,
                    background: GLASS_COLORS.background,
                    backdropFilter: 'blur(10px)',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: GLASS_COLORS.primary,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: GLASS_COLORS.primary,
                    },
                    '& .MuiSelect-select': {
                      color: GLASS_COLORS.textPrimary,
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Выберите категорию</em>
                  </MenuItem >
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
                      transform: 'translateY(-50%)',
                      color: GLASS_COLORS.primary,
                    }} 
                  />
                )}
              </FormControl>

              <FormControl fullWidth size="medium">
                <InputLabel sx={{ color: GLASS_COLORS.textSecondary }}>Сложность</InputLabel>
                <Select
                  value={formData.difficulty}
                  label="Сложность"
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                  sx={{
                    borderRadius: 3,
                    background: GLASS_COLORS.background,
                    backdropFilter: 'blur(10px)',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: GLASS_COLORS.primary,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: GLASS_COLORS.primary,
                    },
                    '& .MuiSelect-select': {
                      color: GLASS_COLORS.textPrimary,
                    },
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
          borderTop: '1px solid',
          borderColor: GLASS_COLORS.border,
          pt: 2,
          px: 3,
          pb: 3
        }}>
          <Button
            variant="outlined"
            onClick={handleCloseDialog}
            sx={{
              borderWidth: 2,
              borderRadius: 3,
              borderColor: GLASS_COLORS.border,
              color: GLASS_COLORS.textPrimary,
              px: 3,
              py: 1,
              fontWeight: 600,
              background: GLASS_COLORS.surface,
              backdropFilter: 'blur(10px)',
              '&:hover': {
                borderColor: GLASS_COLORS.primary,
                backgroundColor: alpha(GLASS_COLORS.primary, 0.1),
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
              background: `linear-gradient(135deg, ${GLASS_COLORS.success}, ${alpha(GLASS_COLORS.success, 0.7)})`,
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: alpha('#FFFFFF', 0.3),
              color: 'white',
              borderRadius: 3,
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.success, 0.9)}, ${alpha(GLASS_COLORS.success, 0.6)})`,
              },
              '&:disabled': {
                background: alpha(GLASS_COLORS.surface, 0.5),
                color: GLASS_COLORS.textSecondary,
              }
            }}
          >
            {isSaving ? 'Сохранение...' : 'Создать вопрос'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Плавающая кнопка обратной связи */}
      <FeedbackFab />
      <Footer />
    </Box>
  );
};