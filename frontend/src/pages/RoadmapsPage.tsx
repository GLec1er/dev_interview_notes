import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  Divider,
  alpha,
  IconButton,
  InputAdornment,
  Grid,
  Fade,
  Tooltip,
  useTheme as useMuiTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Tabs,
  Tab,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
} from '@mui/material';
import {
  Map as MapIcon,
  ArrowForward as ArrowForwardIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  School as SchoolIcon,
  Flag as FlagIcon,
  Code as CodeIcon,
  FilterList as FilterIcon,
  TrendingFlat as TrendingFlatIcon,
  Category as CategoryIcon,
  Numbers as NumbersIcon,
  ArrowBack as ArrowBackIcon,
  AssignmentRounded as AssignmentRoundedIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  QuestionAnswer as QuestionIcon,
  Timeline as TimelineIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  PlayArrow as PlayArrowIcon,
  BarChart as BarChartIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Info as InfoIcon,
  Assessment as AssessmentIcon,
  ListAlt as ListIcon,
} from '@mui/icons-material';
import { roadmapService, type RoadmapListResponse, type RoadmapDetail } from '../services/roadmapService';
import { FeedbackFab } from '../components/FeedbackFab';
import { questionCompletionService } from '../services/questionCompletionService';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useTheme as useThemeContext } from '../context/ThemeContext';
import { NavigationBar } from '../components/NavigationBar';

// Стеклянная цветовая палитра iOS 26 Liquid Glass - реагирует на смену темы
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

// Компонент полноэкранной модалки в стеклянном стиле
const GlassRoadmapModal: React.FC<{
  open: boolean;
  onClose: () => void;
  roadmap: RoadmapDetail | null;
  onItemClick: (slug: string) => void;
  onToggleCompletion: (itemId: string, completed: boolean) => void;
}> = ({ open, onClose, roadmap, onItemClick, onToggleCompletion }) => {
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [activeTab, setActiveTab] = useState(0);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [mobileNavValue, setMobileNavValue] = useState(0);
  const [infoDrawerOpen, setInfoDrawerOpen] = useState(false);
  const { mode } = useThemeContext();
  const GLASS_COLORS = getGlassColors(mode);

  if (!roadmap) return null;

  // Группировка вопросов по категориям
  const itemsByCategory = roadmap.items.reduce((acc, item) => {
    const categoryId = item.category_id || 'uncategorized';
    if (!acc[categoryId]) {
      acc[categoryId] = {
        categoryId,
        categoryName: item.category_name || 'Без категории',
        items: [],
        totalItems: 0,
        completedItems: 0,
      };
    }
    acc[categoryId].items.push(item);
    acc[categoryId].totalItems++;
    if (item.is_completed) {
      acc[categoryId].completedItems++;
    }
    return acc;
  }, {} as Record<string, { 
    categoryId: string; 
    categoryName: string; 
    items: typeof roadmap.items;
    totalItems: number;
    completedItems: number;
  }>);

  const categories = Object.values(itemsByCategory).sort((a, b) => {
    if (a.categoryId === 'uncategorized') return 1;
    if (b.categoryId === 'uncategorized') return -1;
    return a.categoryName.localeCompare(b.categoryName);
  });

  const completedItems = roadmap.items.filter(item => item.is_completed).length;
  const completionPercentage = roadmap.items.length > 0 
    ? (completedItems / roadmap.items.length) * 100 
    : 0;

  // Статистика по сложности
  const difficultyStats = roadmap.items.reduce((acc, item) => {
    acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const completedByDifficulty = roadmap.items.reduce((acc, item) => {
    if (item.is_completed) {
      acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

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

  const handleToggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleToggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Мобильная версия с нижней навигацией и выдвижной панелью информации
  if (isMobile) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen
        PaperProps={{
          sx: {
            background: GLASS_COLORS.surfaceDark,
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            position: 'relative',
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
          },
        }}
      >
        {/* Заголовок модалки для мобильных */}
        <DialogTitle
          sx={{
            borderBottom: '1px solid',
            borderColor: GLASS_COLORS.border,
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: GLASS_COLORS.background,
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <IconButton
              onClick={onClose}
              sx={{
                background: alpha(GLASS_COLORS.accent, 0.15),
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: alpha(GLASS_COLORS.accent, 0.3),
                color: GLASS_COLORS.accent,
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: GLASS_COLORS.textPrimary,
                  fontSize: '1.1rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {roadmap.title}
              </Typography>
              <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary, display: 'block' }}>
                {roadmap.profession}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Контент в зависимости от выбранной вкладки нижней навигации */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, pb: 8 }}>
            {mobileNavValue === 0 && (
              /* Вкладка "Вопросы" */
              <Box>
                {/* Прогресс-бар сверху */}
                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    background: GLASS_COLORS.surface,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: GLASS_COLORS.border,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary }}>
                      Общий прогресс
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: GLASS_COLORS.success }}>
                      {Math.round(completionPercentage)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={completionPercentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(GLASS_COLORS.border, 0.5),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${GLASS_COLORS.success} 0%, ${alpha(GLASS_COLORS.success, 0.6)} 100%)`,
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary, mt: 1, display: 'block' }}>
                    {completedItems} из {roadmap.items.length} выполнено
                  </Typography>
                </Paper>

                {/* Вопросы по категориям */}
                {categories.map((category) => (
                  <Box key={category.categoryId} sx={{ mb: 2 }}>
                    {/* Заголовок категории */}
                    <Paper
                      sx={{
                        p: 1.5,
                        mb: 1,
                        borderRadius: 2,
                        background: GLASS_COLORS.background,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: expandedCategories.has(category.categoryId) ? GLASS_COLORS.purple : GLASS_COLORS.border,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleToggleCategory(category.categoryId)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CategoryIcon sx={{ color: GLASS_COLORS.purple, fontSize: 20 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary }}>
                            {category.categoryName}
                          </Typography>
                          <Chip
                            label={`${category.completedItems}/${category.totalItems}`}
                            size="small"
                            sx={{
                              background: alpha(GLASS_COLORS.purple, 0.15),
                              color: GLASS_COLORS.purple,
                              fontWeight: 600,
                              fontSize: '0.6rem',
                              height: 18,
                            }}
                          />
                        </Box>
                        <IconButton size="small">
                          {expandedCategories.has(category.categoryId) ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />}
                        </IconButton>
                      </Box>
                    </Paper>

                    {/* Вопросы категории */}
                    {expandedCategories.has(category.categoryId) && (
                      <List sx={{ ml: 1 }}>
                        {category.items
                          .sort((a, b) => a.order - b.order)
                          .map((item, index) => (
                            <Paper
                              key={item.id}
                              sx={{
                                mb: 1,
                                borderRadius: 2,
                                background: alpha(item.is_completed ? GLASS_COLORS.success : GLASS_COLORS.background, 0.13),
                                backdropFilter: 'blur(10px)',
                                border: '1px solid',
                                borderColor: expandedItems.has(item.id) ? GLASS_COLORS.accent : GLASS_COLORS.border,
                              }}
                            >
                              <ListItem
                                button
                                onClick={() => handleToggleExpand(item.id)}
                                sx={{ py: 1, px: 1.5 }}
                              >
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <Avatar
                                    sx={{
                                      width: 24,
                                      height: 24,
                                      background: alpha(getDifficultyColor(item.difficulty), 0.15),
                                      border: '1px solid',
                                      borderColor: alpha(getDifficultyColor(item.difficulty), 0.3),
                                      color: getDifficultyColor(item.difficulty),
                                      fontWeight: 600,
                                      fontSize: '0.65rem',
                                    }}
                                  >
                                    {index + 1}
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 600,
                                        color: GLASS_COLORS.textPrimary,
                                        fontSize: '0.85rem',
                                      }}
                                    >
                                      {item.title.length > 30 
                                        ? `${item.title.substring(0, 30)}...` 
                                        : item.title
                                      }
                                    </Typography>
                                  }
                                />
                                <Stack direction="row" spacing={0.5}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleCompletion(item.id, !item.is_completed);
                                    }}
                                    sx={{
                                      color: item.is_completed ? GLASS_COLORS.success : GLASS_COLORS.textSecondary,
                                      border: '1px solid',
                                      borderColor: item.is_completed ? alpha(GLASS_COLORS.success, 0.3) : GLASS_COLORS.border,
                                      p: 0.5,
                                    }}
                                  >
                                    {item.is_completed ? 
                                      <CheckCircleIcon fontSize="small" sx={{ fontSize: 18 }} /> : 
                                      <RadioButtonUncheckedIcon fontSize="small" sx={{ fontSize: 18 }} />
                                    }
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onItemClick(item.slug);
                                    }}
                                    sx={{
                                      color: GLASS_COLORS.accent,
                                      background: alpha(GLASS_COLORS.accent, 0.15),
                                      border: '1px solid',
                                      borderColor: alpha(GLASS_COLORS.accent, 0.3),
                                      p: 0.5,
                                    }}
                                  >
                                    <ArrowForwardIcon fontSize="small" sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Stack>
                              </ListItem>
                              
                              {/* Расширенное содержимое */}
                              {expandedItems.has(item.id) && (
                                <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5 }}>
                                  <Divider sx={{ mb: 1, borderColor: GLASS_COLORS.border }} />
                                  <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary, display: 'block', mb: 1 }}>
                                    <Chip
                                      label={item.difficulty}
                                      size="small"
                                      sx={{
                                        fontWeight: 600,
                                        background: alpha(getDifficultyColor(item.difficulty), 0.15),
                                        color: getDifficultyColor(item.difficulty),
                                        fontSize: '0.6rem',
                                        height: 18,
                                        mr: 1,
                                      }}
                                    />
                                    Порядок: {item.order}
                                  </Typography>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    fullWidth
                                    onClick={() => onItemClick(item.slug)}
                                    startIcon={<QuestionIcon />}
                                    sx={{
                                      background: `linear-gradient(135deg, ${GLASS_COLORS.accent} 0%, ${alpha(GLASS_COLORS.accent, 0.6)} 100%)`,
                                      borderRadius: 2,
                                      fontSize: '0.75rem',
                                      py: 0.5,
                                    }}
                                  >
                                    Перейти к вопросу
                                  </Button>
                                </Box>
                              )}
                            </Paper>
                          ))}
                      </List>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {mobileNavValue === 1 && (
              /* Вкладка "Прогресс" */
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: GLASS_COLORS.textPrimary }}>
                  Детальный прогресс
                </Typography>

                {/* Общий прогресс */}
                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    background: GLASS_COLORS.surface,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: GLASS_COLORS.border,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary, mb: 1 }}>
                    Общий
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={completionPercentage}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: alpha(GLASS_COLORS.border, 0.5),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            background: `linear-gradient(90deg, ${GLASS_COLORS.success} 0%, ${alpha(GLASS_COLORS.success, 0.6)} 100%)`,
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: GLASS_COLORS.success }}>
                      {Math.round(completionPercentage)}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary }}>
                    {completedItems} из {roadmap.items.length} вопросов выполнено
                  </Typography>
                </Paper>

                {/* Прогресс по категориям */}
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary, mb: 1 }}>
                  По категориям
                </Typography>
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  {categories.map((category) => (
                    <Paper
                      key={category.categoryId}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: GLASS_COLORS.surface,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: GLASS_COLORS.border,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary }}>
                          {category.categoryName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary }}>
                          {category.completedItems}/{category.totalItems}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(category.completedItems / category.totalItems) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: alpha(GLASS_COLORS.border, 0.5),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: `linear-gradient(90deg, ${GLASS_COLORS.purple} 0%, ${alpha(GLASS_COLORS.purple, 0.6)} 100%)`,
                          },
                        }}
                      />
                    </Paper>
                  ))}
                </Stack>

                {/* Прогресс по сложности */}
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary, mb: 1 }}>
                  По сложности
                </Typography>
                <Paper
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: GLASS_COLORS.surface,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: GLASS_COLORS.border,
                  }}
                >
                  <Stack spacing={1.5}>
                    {['easy', 'medium', 'hard'].map((difficulty) => {
                      const total = difficultyStats[difficulty] || 0;
                      const completed = completedByDifficulty[difficulty] || 0;
                      if (total === 0) return null;

                      return (
                        <Box key={difficulty}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Chip
                              label={difficulty === 'easy' ? 'Легкие' : difficulty === 'medium' ? 'Средние' : 'Сложные'}
                              size="small"
                              sx={{
                                background: alpha(getDifficultyColor(difficulty), 0.15),
                                color: getDifficultyColor(difficulty),
                                fontWeight: 600,
                                fontSize: '0.6rem',
                                height: 18,
                              }}
                            />
                            <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary }}>
                              {completed}/{total} • {Math.round((completed / total) * 100)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(completed / total) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: alpha(GLASS_COLORS.border, 0.5),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                background: `linear-gradient(90deg, ${getDifficultyColor(difficulty)} 0%, ${alpha(getDifficultyColor(difficulty), 0.6)} 100%)`,
                              },
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>
              </Box>
            )}

            {mobileNavValue === 2 && (
              /* Вкладка "Информация" */
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: GLASS_COLORS.textPrimary }}>
                  Информация
                </Typography>

                {/* Описание */}
                {roadmap.description && (
                  <Paper
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      background: GLASS_COLORS.surface,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: GLASS_COLORS.border,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary, mb: 1 }}>
                      Описание
                    </Typography>
                    <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary, lineHeight: 1.5 }}>
                      {roadmap.description}
                    </Typography>
                  </Paper>
                )}

                {/* Статистика */}
                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    background: GLASS_COLORS.surface,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: GLASS_COLORS.border,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary, mb: 1 }}>
                    Статистика
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
                        Всего вопросов:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary }}>
                        {roadmap.items.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
                        Категорий:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: GLASS_COLORS.purple }}>
                        {categories.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
                        Профессия:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: GLASS_COLORS.info }}>
                        {roadmap.profession}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                {/* Распределение по сложности */}
                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    background: GLASS_COLORS.surface,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: GLASS_COLORS.border,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary, mb: 1 }}>
                    Распределение по сложности
                  </Typography>
                  <Stack spacing={1}>
                    {['easy', 'medium', 'hard'].map((difficulty) => {
                      const total = difficultyStats[difficulty] || 0;
                      if (total === 0) return null;

                      return (
                        <Box key={difficulty} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Chip
                            label={difficulty === 'easy' ? 'Легкие' : difficulty === 'medium' ? 'Средние' : 'Сложные'}
                            size="small"
                            sx={{
                              background: alpha(getDifficultyColor(difficulty), 0.15),
                              color: getDifficultyColor(difficulty),
                              fontWeight: 600,
                              fontSize: '0.6rem',
                              height: 18,
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary }}>
                            {total} ({Math.round((total / roadmap.items.length) * 100)}%)
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>
              </Box>
            )}
          </Box>

          {/* Нижняя навигация для мобильных */}
          <Paper
            sx={{
              position: 'sticky',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1,
              borderTop: '1px solid',
              borderColor: GLASS_COLORS.border,
              background: GLASS_COLORS.surface,
              backdropFilter: 'blur(20px)',
            }}
            elevation={0}
          >
            <BottomNavigation
              value={mobileNavValue}
              onChange={(event, newValue) => setMobileNavValue(newValue)}
              showLabels
              sx={{
                background: 'transparent',
                '& .MuiBottomNavigationAction-root': {
                  color: GLASS_COLORS.textSecondary,
                  '&.Mui-selected': {
                    color: GLASS_COLORS.accent,
                  },
                },
              }}
            >
              <BottomNavigationAction label="Вопросы" icon={<ListIcon />} />
              <BottomNavigationAction label="Прогресс" icon={<AssessmentIcon />} />
              <BottomNavigationAction label="Инфо" icon={<InfoIcon />} />
            </BottomNavigation>
          </Paper>
        </DialogContent>

        {/* Выдвижная панель с информацией для мобильных */}
        <SwipeableDrawer
          anchor="bottom"
          open={infoDrawerOpen}
          onClose={() => setInfoDrawerOpen(false)}
          onOpen={() => {}}
          disableSwipeToOpen={false}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              background: GLASS_COLORS.surfaceDark,
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: GLASS_COLORS.textPrimary }}>
                Дорожная карта
              </Typography>
              <IconButton onClick={() => setInfoDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary, mb: 1 }}>
              {roadmap.title}
            </Typography>
            <Chip
              icon={<FlagIcon />}
              label={roadmap.profession}
              size="small"
              sx={{
                background: alpha(GLASS_COLORS.info, 0.15),
                color: GLASS_COLORS.info,
                fontWeight: 600,
                mb: 2,
              }}
            />
            <Divider sx={{ mb: 2, borderColor: GLASS_COLORS.border }} />
            
            {/* Краткая статистика в панели */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary, mb: 1 }}>
              Быстрая статистика
            </Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
                  Прогресс:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: GLASS_COLORS.success }}>
                  {Math.round(completionPercentage)}%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
                  Выполнено:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary }}>
                  {completedItems}/{roadmap.items.length}
                </Typography>
              </Box>
            </Stack>

            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                const firstUncompleted = roadmap.items.find(item => !item.is_completed);
                if (firstUncompleted) {
                  onItemClick(firstUncompleted.slug);
                  setInfoDrawerOpen(false);
                }
              }}
              disabled={completedItems === roadmap.items.length}
              startIcon={<PlayArrowIcon />}
              sx={{
                background: `linear-gradient(135deg, ${GLASS_COLORS.success} 0%, ${alpha(GLASS_COLORS.success, 0.6)} 100%)`,
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              {completedItems === roadmap.items.length ? 'Все выполнено' : 'Продолжить обучение'}
            </Button>
          </Box>
        </SwipeableDrawer>
      </Dialog>
    );
  }

  // Десктопная и планшетная версия (двухпанельная)
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: GLASS_COLORS.surfaceDark,
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid',
          borderColor: GLASS_COLORS.border,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
          maxHeight: '90vh',
          overflow: 'hidden',
          position: 'relative',
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
        },
      }}
    >
      {/* Заголовок модалки для десктопа */}
      <DialogTitle
        sx={{
          borderBottom: '1px solid',
          borderColor: GLASS_COLORS.border,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: GLASS_COLORS.background,
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <IconButton
            onClick={onClose}
            sx={{
              background: alpha(GLASS_COLORS.accent, 0.15),
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: alpha(GLASS_COLORS.accent, 0.3),
              color: GLASS_COLORS.accent,
              '&:hover': {
                background: alpha(GLASS_COLORS.accent, 0.25),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: GLASS_COLORS.textPrimary,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                letterSpacing: '-0.01em',
              }}
            >
              <MapIcon sx={{ color: GLASS_COLORS.accent }} />
              {roadmap.title}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Chip
                icon={<FlagIcon />}
                label={roadmap.profession}
                size="small"
                sx={{
                  background: alpha(GLASS_COLORS.info, 0.15),
                  backdropFilter: 'blur(10px)',
                  color: GLASS_COLORS.info,
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: alpha(GLASS_COLORS.info, 0.3),
                }}
              />
              <Chip
                label={`${roadmap.items.length} вопросов`}
                size="small"
                icon={<NumbersIcon />}
                sx={{
                  background: alpha(GLASS_COLORS.accent, 0.15),
                  backdropFilter: 'blur(10px)',
                  color: GLASS_COLORS.accent,
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: alpha(GLASS_COLORS.accent, 0.3),
                }}
              />
              <Chip
                label={`${categories.length} категорий`}
                size="small"
                icon={<CategoryIcon />}
                sx={{
                  background: alpha(GLASS_COLORS.purple, 0.15),
                  backdropFilter: 'blur(10px)',
                  color: GLASS_COLORS.purple,
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: alpha(GLASS_COLORS.purple, 0.3),
                }}
              />
            </Stack>
          </Box>
        </Box>
      </DialogTitle>

      {/* Контент модалки для десктопа */}
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', height: '100%' }}>
          {/* Левая панель - обзор и статистика */}
          <Box
            sx={{
              width: isTablet ? 280 : 320,
              borderRight: '1px solid',
              borderColor: GLASS_COLORS.border,
              background: GLASS_COLORS.background,
              backdropFilter: 'blur(10px)',
              p: 3,
              overflowY: 'auto',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100%',
                background: `linear-gradient(135deg, ${GLASS_COLORS.glassHighlight} 0%, transparent 100%)`,
                opacity: 0.2,
                pointerEvents: 'none',
              },
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              orientation="vertical"
              sx={{
                '& .MuiTab-root': {
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: GLASS_COLORS.textSecondary,
                  borderRadius: 2,
                  minHeight: 48,
                  '&.Mui-selected': {
                    color: GLASS_COLORS.accent,
                    background: alpha(GLASS_COLORS.accent, 0.15),
                    backdropFilter: 'blur(10px)',
                  },
                },
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimelineIcon fontSize="small" />
                    <span>Обзор</span>
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon fontSize="small" />
                    <span>Прогресс</span>
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BarChartIcon fontSize="small" />
                    <span>Статистика</span>
                  </Box>
                } 
              />
            </Tabs>

            <Divider sx={{ my: 2, borderColor: GLASS_COLORS.border }} />

            {activeTab === 0 && (
              <>
                {/* Общая информация */}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: GLASS_COLORS.textPrimary, letterSpacing: '-0.01em' }}>
                  Общая информация
                </Typography>
                
                {/* Прогресс */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary, mb: 1, display: 'block' }}>
                    Общий прогресс
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ flex: 1, position: 'relative' }}>
                      <LinearProgress
                        variant="determinate"
                        value={completionPercentage}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: alpha(GLASS_COLORS.border, 0.5),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            background: `linear-gradient(90deg, ${GLASS_COLORS.success} 0%, ${alpha(GLASS_COLORS.success, 0.6)} 100%)`,
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: GLASS_COLORS.textPrimary }}>
                      {Math.round(completionPercentage)}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary }}>
                    {completedItems} из {roadmap.items.length} вопросов выполнено
                  </Typography>
                </Box>

                {/* Статистика по категориям */}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: GLASS_COLORS.textPrimary, letterSpacing: '-0.01em' }}>
                  Категории
                </Typography>
                <Stack spacing={1.5} sx={{ mb: 3 }}>
                  {categories.map((category) => (
                    <Box key={category.categoryId}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary }}>
                          {category.categoryName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary }}>
                          {category.completedItems}/{category.totalItems}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(category.completedItems / category.totalItems) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: alpha(GLASS_COLORS.border, 0.5),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: `linear-gradient(90deg, ${GLASS_COLORS.purple} 0%, ${alpha(GLASS_COLORS.purple, 0.6)} 100%)`,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </>
            )}

            {activeTab === 1 && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 3, color: GLASS_COLORS.textPrimary, letterSpacing: '-0.01em' }}>
                  Детальный прогресс
                </Typography>

                {/* Прогресс по категориям */}
                <Stack spacing={2}>
                  {categories.map((category) => (
                    <Paper
                      key={category.categoryId}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: GLASS_COLORS.surface,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: GLASS_COLORS.border,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary, mb: 1 }}>
                        {category.categoryName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(category.completedItems / category.totalItems) * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: alpha(GLASS_COLORS.border, 0.5),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: `linear-gradient(90deg, ${GLASS_COLORS.purple} 0%, ${alpha(GLASS_COLORS.purple, 0.6)} 100%)`,
                              },
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary }}>
                          {Math.round((category.completedItems / category.totalItems) * 100)}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary }}>
                        {category.completedItems} из {category.totalItems} выполнено
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </>
            )}

            {activeTab === 2 && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 3, color: GLASS_COLORS.textPrimary, letterSpacing: '-0.01em' }}>
                  Статистика
                </Typography>

                {/* Статистика по сложности */}
                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    background: GLASS_COLORS.surface,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: GLASS_COLORS.border,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary, mb: 2 }}>
                    По сложности
                  </Typography>
                  <Stack spacing={2}>
                    {['easy', 'medium', 'hard'].map((difficulty) => {
                      const total = difficultyStats[difficulty] || 0;
                      const completed = completedByDifficulty[difficulty] || 0;
                      if (total === 0) return null;

                      return (
                        <Box key={difficulty}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={difficulty === 'easy' ? 'Легкие' : difficulty === 'medium' ? 'Средние' : 'Сложные'}
                                size="small"
                                sx={{
                                  background: alpha(getDifficultyColor(difficulty), 0.15),
                                  color: getDifficultyColor(difficulty),
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: 24,
                                }}
                              />
                              <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary }}>
                                {completed}/{total}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary }}>
                              {Math.round((completed / total) * 100)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(completed / total) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: alpha(GLASS_COLORS.border, 0.5),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                background: `linear-gradient(90deg, ${getDifficultyColor(difficulty)} 0%, ${alpha(getDifficultyColor(difficulty), 0.6)} 100%)`,
                              },
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>

                {/* Общая статистика */}
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: GLASS_COLORS.surface,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: GLASS_COLORS.border,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary, mb: 2 }}>
                    Общая
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
                        Всего вопросов:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary }}>
                        {roadmap.items.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
                        Выполнено:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: GLASS_COLORS.success }}>
                        {completedItems}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
                        Осталось:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: GLASS_COLORS.error }}>
                        {roadmap.items.length - completedItems}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
                        Категорий:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: GLASS_COLORS.purple }}>
                        {categories.length}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </>
            )}
          </Box>

          {/* Основной контент - вопросы по категориям */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 3, background: GLASS_COLORS.surface, backdropFilter: 'blur(10px)' }}>
            {/* Описание */}
            {roadmap.description && (
              <Paper
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 3,
                  background: GLASS_COLORS.surface,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: GLASS_COLORS.border,
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
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: GLASS_COLORS.textPrimary, letterSpacing: '-0.01em' }}>
                  Описание
                </Typography>
                <Typography variant="body1" sx={{ color: GLASS_COLORS.textSecondary, lineHeight: 1.6 }}>
                  {roadmap.description}
                </Typography>
              </Paper>
            )}

            {/* Вопросы по категориям */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: GLASS_COLORS.textPrimary, letterSpacing: '-0.01em' }}>
              Вопросы ({roadmap.items.length})
            </Typography>

            {categories.map((category) => (
              <Box key={category.categoryId} sx={{ mb: 3 }}>
                {/* Заголовок категории */}
                <Paper
                  sx={{
                    p: 2,
                    mb: 1,
                    borderRadius: 2,
                    background: GLASS_COLORS.background,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: expandedCategories.has(category.categoryId) ? GLASS_COLORS.purple : GLASS_COLORS.border,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: GLASS_COLORS.purple,
                      background: alpha(GLASS_COLORS.purple, 0.05),
                    },
                  }}
                  onClick={() => handleToggleCategory(category.categoryId)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CategoryIcon sx={{ color: GLASS_COLORS.purple }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary }}>
                        {category.categoryName}
                      </Typography>
                      <Chip
                        label={`${category.completedItems}/${category.totalItems}`}
                        size="small"
                        sx={{
                          background: alpha(GLASS_COLORS.purple, 0.15),
                          color: GLASS_COLORS.purple,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 20,
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 100 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(category.completedItems / category.totalItems) * 100}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: alpha(GLASS_COLORS.border, 0.5),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              background: `linear-gradient(90deg, ${GLASS_COLORS.purple} 0%, ${alpha(GLASS_COLORS.purple, 0.6)} 100%)`,
                            },
                          }}
                        />
                      </Box>
                      <IconButton size="small">
                        {expandedCategories.has(category.categoryId) ? <ArrowUpIcon /> : <ArrowDownIcon />}
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>

                {/* Вопросы категории */}
                {expandedCategories.has(category.categoryId) && (
                  <List sx={{ ml: 2 }}>
                    {category.items
                      .sort((a, b) => a.order - b.order)
                      .map((item, index) => (
                        <Paper
                          key={item.id}
                          sx={{
                            mb: 1,
                            borderRadius: 2,
                            background: alpha(item.is_completed ? GLASS_COLORS.success : GLASS_COLORS.background, 0.13),
                            backdropFilter: 'blur(10px)',
                            border: '1px solid',
                            borderColor: expandedItems.has(item.id) ? GLASS_COLORS.accent : GLASS_COLORS.border,
                            transition: 'all 0.2s ease',
                            overflow: 'hidden',
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '100%',
                              background: `linear-gradient(135deg, ${GLASS_COLORS.glassHighlight} 0%, transparent 100%)`,
                              opacity: 0,
                              transition: 'opacity 0.2s ease',
                              pointerEvents: 'none',
                            },
                            '&:hover': {
                              borderColor: GLASS_COLORS.accent,
                              boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.accent, 0.1)}`,
                              '&::before': {
                                opacity: 0.3,
                              },
                            },
                          }}
                        >
                          <ListItem
                            button
                            onClick={() => handleToggleExpand(item.id)}
                            sx={{
                              py: 1.5,
                              px: 2,
                              '&:hover': {
                                background: 'transparent',
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Avatar
                                sx={{
                                  width: 28,
                                  height: 28,
                                  background: alpha(getDifficultyColor(item.difficulty), 0.15),
                                  border: '1px solid',
                                  borderColor: alpha(getDifficultyColor(item.difficulty), 0.3),
                                  color: getDifficultyColor(item.difficulty),
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                }}
                              >
                                {index + 1}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: GLASS_COLORS.textPrimary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  {item.title.length > 40 
                                    ? `${item.title.substring(0, 40)}...` 
                                    : item.title
                                  }
                                  <Chip
                                    label={item.difficulty}
                                    size="small"
                                    sx={{
                                      fontWeight: 600,
                                      background: alpha(getDifficultyColor(item.difficulty), 0.15),
                                      color: getDifficultyColor(item.difficulty),
                                      fontSize: '0.6rem',
                                      height: 18,
                                      '& .MuiChip-label': {
                                        px: 0.5,
                                      },
                                    }}
                                  />
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary }}>
                                  Порядок: {item.order}
                                </Typography>
                              }
                            />
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleCompletion(item.id, !item.is_completed);
                                }}
                                sx={{
                                  color: item.is_completed ? GLASS_COLORS.success : GLASS_COLORS.textSecondary,
                                  border: '1px solid',
                                  borderColor: item.is_completed ? alpha(GLASS_COLORS.success, 0.3) : GLASS_COLORS.border,
                                  '&:hover': {
                                    background: alpha(GLASS_COLORS.success, 0.1),
                                  },
                                }}
                              >
                                {item.is_completed ? <CheckCircleIcon fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" />}
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onItemClick(item.slug);
                                }}
                                sx={{
                                  color: GLASS_COLORS.accent,
                                  background: alpha(GLASS_COLORS.accent, 0.15),
                                  border: '1px solid',
                                  borderColor: alpha(GLASS_COLORS.accent, 0.3),
                                  '&:hover': {
                                    background: alpha(GLASS_COLORS.accent, 0.25),
                                  },
                                }}
                              >
                                <ArrowForwardIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </ListItem>
                          
                          {/* Расширенное содержимое */}
                          {expandedItems.has(item.id) && (
                            <Box sx={{ px: 2, pb: 2, pt: 1 }}>
                              <Divider sx={{ mb: 1.5, borderColor: GLASS_COLORS.border }} />
                              <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary, display: 'block', mb: 1 }}>
                                Чтобы увидеть подробности и перейти к вопросу, нажмите на кнопку ниже.
                              </Typography>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => onItemClick(item.slug)}
                                startIcon={<QuestionIcon />}
                                sx={{
                                  background: `linear-gradient(135deg, ${GLASS_COLORS.accent} 0%, ${alpha(GLASS_COLORS.accent, 0.6)} 100%)`,
                                  borderRadius: 2,
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                }}
                              >
                                Перейти к вопросу
                              </Button>
                            </Box>
                          )}
                        </Paper>
                      ))}
                  </List>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>

      {/* Футер модалки для десктопа */}
      <DialogActions
        sx={{
          borderTop: '1px solid',
          borderColor: GLASS_COLORS.border,
          p: 2,
          background: GLASS_COLORS.background,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderColor: GLASS_COLORS.border,
            color: GLASS_COLORS.textPrimary,
            fontWeight: 600,
            borderRadius: 3,
            background: GLASS_COLORS.surface,
            backdropFilter: 'blur(10px)',
            '&:hover': {
              borderColor: GLASS_COLORS.accent,
              background: alpha(GLASS_COLORS.accent, 0.1),
            },
          }}
        >
          Закрыть
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            const firstUncompleted = roadmap.items.find(item => !item.is_completed);
            if (firstUncompleted) {
              onItemClick(firstUncompleted.slug);
            }
          }}
          disabled={completedItems === roadmap.items.length}
          startIcon={<PlayArrowIcon />}
          sx={{
            background: `linear-gradient(135deg, ${GLASS_COLORS.success} 0%, ${alpha(GLASS_COLORS.success, 0.6)} 100%)`,
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: alpha('#FFFFFF', 0.3),
            borderRadius: 3,
            fontWeight: 600,
            '&:hover': {
              background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.success, 0.9)}, ${alpha(GLASS_COLORS.success, 0.5)})`,
            },
            '&.Mui-disabled': {
              background: alpha(GLASS_COLORS.surface, 0.5),
              color: GLASS_COLORS.textSecondary,
            },
          }}
        >
          {completedItems === roadmap.items.length ? 'Все выполнено' : 'Продолжить обучение'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const RoadmapsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { mode } = useThemeContext();
  const GLASS_COLORS = getGlassColors(mode);

  const [roadmaps, setRoadmaps] = useState<RoadmapListResponse[]>([]);
  const [filteredRoadmaps, setFilteredRoadmaps] = useState<RoadmapListResponse[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Фильтры
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfession, setSelectedProfession] = useState<string>('');

  // Модалка
  const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  // Загружаем роадмапы при загрузке страницы
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [roadmapsData, professionsData] = await Promise.all([
          roadmapService.getAllRoadmaps(),
          roadmapService.getProfessions(),
        ]);
        
        setRoadmaps(roadmapsData);
        setFilteredRoadmaps(roadmapsData);
        setProfessions(professionsData || []);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Ошибка при загрузке роадмапов. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Фильтрация роадмапов
  useEffect(() => {
    let filtered = roadmaps;

    if (selectedProfession) {
      filtered = filtered.filter(
        (rm) => rm.profession.toLowerCase() === selectedProfession.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (rm) =>
          rm.title.toLowerCase().includes(query) ||
          rm.profession.toLowerCase().includes(query) ||
          (rm.description && rm.description.toLowerCase().includes(query))
      );
    }

    setFilteredRoadmaps(filtered);
  }, [searchQuery, selectedProfession, roadmaps]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedProfession('');
  };

  const handleOpenRoadmap = async (slug: string) => {
    try {
      setLoadingRoadmap(true);
      const roadmap = await roadmapService.getRoadmapDetailBySlug(slug);
      
      const itemsWithCompletion = await Promise.all(
        roadmap.items.map(async (item) => {
          try {
            const completion = await questionCompletionService.isQuestionCompleted(item.id);
            return {
              ...item,
              is_completed: completion.is_completed,
            };
          } catch (err) {
            console.error(`Error checking completion for item ${item.id}:`, err);
            return {
              ...item,
              is_completed: false,
            };
          }
        })
      );
      
      setSelectedRoadmap({
        ...roadmap,
        items: itemsWithCompletion,
      });
      setModalOpen(true);
    } catch (err) {
      console.error('Ошибка при загрузке роадмапа:', err);
      setError('Не удалось загрузить роадмап. Пожалуйста, попробуйте позже.');
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRoadmap(null);
  };

  const handleItemClick = (slug: string) => {
    handleCloseModal();
    navigate(`/questions/${slug}`);
  };

  const handleToggleCompletion = async (itemId: string, completed: boolean) => {
    if (!selectedRoadmap) return;

    try {
      if (completed) {
        await questionCompletionService.markQuestionComplete(itemId);
      } else {
        await questionCompletionService.unmarkQuestionComplete(itemId);
      }

      setSelectedRoadmap(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          items: prev.items.map(item => 
            item.id === itemId 
              ? { ...item, is_completed: completed }
              : item
          ),
        };
      });
    } catch (err) {
      console.error('Ошибка при изменении статуса выполнения:', err);
    }
  };

  const handleBackToQuestions = () => {
    navigate('/questions');
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: GLASS_COLORS.mainColor,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <Header />
        <Container maxWidth="xl" sx={{ py: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress sx={{ color: GLASS_COLORS.accent }} />
          </Box>
        </Container>
        <Footer />
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
      }}
    >
      <Header />
      <Container maxWidth="xl" sx={{ py: 4, pb: 8, position: 'relative', zIndex: 1 }}>
        {/* Панель навигации */}
        <Box sx={{ mb: 4 }}>
          <NavigationBar 
            showProfile={true}
            showQuestions={true}
            showCompanies={true}
          />
         </Box>
        {/* Заголовок */}
        <Box sx={{ mb: 6, textAlign: 'center', position: 'relative' }}>
          {/* Основная иконка */}
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
                background: alpha(GLASS_COLORS.accent, 0.15),
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: alpha(GLASS_COLORS.accent, 0.3),
                color: GLASS_COLORS.accent,
                boxShadow: `0 8px 32px ${alpha(GLASS_COLORS.accent, 0.2)}`,
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
                  background: `conic-gradient(from 0deg, ${alpha(GLASS_COLORS.accent, 0.3)} 0%, transparent 30%)`,
                  opacity: 0,
                  transition: 'opacity 0.3s',
                },
                '&:hover:before': {
                  opacity: 1,
                },
              }}
              onClick={handleClearFilters}
            >
              <MapIcon sx={{ fontSize: 56 }} />
            </Box>
          </Box>

          {/* Заголовок */}
          <Box
            sx={{
              position: 'relative',
              display: 'inline-block',
              mb: 2,
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
                textShadow: mode === 'dark' ? '0 0 20px rgba(0,212,255,0.3)' : '0 4px 20px rgba(255,255,255,0.5)',
                position: 'relative',
                display: 'inline-block',
                ml: 4
              }}
            >
              Дорожные карты
            </Typography>
            
            {/* Подчеркивание */}
            <Box
              sx={{
                position: 'absolute',
                bottom: -10,
                left: 0,
                width: '60%',
                height: 4,
                borderRadius: 2,
                background: `linear-gradient(90deg, ${GLASS_COLORS.accent} 0%, ${GLASS_COLORS.success} 100%)`,
                transition: 'width 0.6s cubic-bezier(0.2, 0, 0, 1)',
                ml: 4
              }}
            />
          </Box>

          {/* Описание */}
          <Typography
            variant="h6"
            sx={{
              color: GLASS_COLORS.textSecondary,
              fontWeight: 400,
              lineHeight: 1.6,
              fontSize: { xs: '1rem', sm: '1.125rem' },
              mb: 3,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Выберите дорожную карту для структурированного изучения. Каждая карта содержит подобранные вопросы по темам в определённом порядке.
          </Typography>
        </Box>

        {/* Ошибка */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              borderRadius: 3,
              background: alpha(GLASS_COLORS.error, 0.15),
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: alpha(GLASS_COLORS.error, 0.3),
              color: GLASS_COLORS.error,
            }}
          >
            {error}
          </Alert>
        )}

        {/* Фильтры */}
        <Fade in={true}>
          <Paper
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 4,
              background: GLASS_COLORS.surface,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: GLASS_COLORS.border,
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <FilterIcon sx={{ color: GLASS_COLORS.accent }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: GLASS_COLORS.textPrimary,
                  letterSpacing: '-0.01em',
                }}
              >
                Фильтры
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
              {/* Поиск */}
              <Box>
                <TextField
                  fullWidth
                  placeholder="Поиск по названию или профессии..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="outlined"
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: GLASS_COLORS.textSecondary }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearchQuery('')}
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
                        borderColor: GLASS_COLORS.accent,
                        borderWidth: 2,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: GLASS_COLORS.accent,
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: GLASS_COLORS.textPrimary,
                      fontWeight: 500,
                    },
                    '& .MuiOutlinedInput-input::placeholder': {
                      color: GLASS_COLORS.textSecondary,
                      opacity: 1,
                    },
                  }}
                />
              </Box>

              {/* Фильтр по профессии */}
              <Box>
                <FormControl fullWidth size="medium">
                  <InputLabel sx={{ color: GLASS_COLORS.textSecondary }}>Профессия</InputLabel>
                  <Select
                    value={selectedProfession}
                    onChange={(e) => setSelectedProfession(e.target.value)}
                    label="Профессия"
                    sx={{
                      borderRadius: 3,
                      '& .MuiOutlinedInput-root': {
                        background: GLASS_COLORS.background,
                        backdropFilter: 'blur(10px)',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: GLASS_COLORS.accent,
                          borderWidth: 2,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: GLASS_COLORS.accent,
                          borderWidth: 2,
                        },
                      },
                      '& .MuiSelect-select': {
                        color: GLASS_COLORS.textPrimary,
                      },
                    }}
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <CategoryIcon sx={{ color: GLASS_COLORS.textSecondary, fontSize: '1rem' }} />
                            <Typography sx={{ color: GLASS_COLORS.textSecondary }}>
                              Все профессии
                            </Typography>
                          </Stack>
                        );
                      }
                      return (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CategoryIcon sx={{ color: GLASS_COLORS.info, fontSize: '1rem' }} />
                          <Typography sx={{ color: GLASS_COLORS.textPrimary, fontWeight: 600 }}>
                            {selected}
                          </Typography>
                        </Stack>
                      );
                    }}
                  >
                    <MenuItem value="">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CategoryIcon sx={{ color: GLASS_COLORS.textSecondary, fontSize: '1rem' }} />
                        <Typography sx={{ color: GLASS_COLORS.textSecondary }}>
                          Все профессии
                        </Typography>
                      </Stack>
                    </MenuItem>
                    {professions.map((profession) => (
                      <MenuItem key={profession} value={profession}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CategoryIcon sx={{ color: GLASS_COLORS.info, fontSize: '1rem' }} />
                          <Typography>{profession}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Кнопка очистить фильтры */}
            {(searchQuery || selectedProfession) && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="medium"
                  variant="outlined"
                  onClick={handleClearFilters}
                  startIcon={<ClearIcon />}
                  sx={{
                    borderWidth: 2,
                    borderRadius: 3,
                    borderColor: GLASS_COLORS.border,
                    color: GLASS_COLORS.textPrimary,
                    background: GLASS_COLORS.surface,
                    backdropFilter: 'blur(10px)',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: GLASS_COLORS.accent,
                      background: alpha(GLASS_COLORS.accent, 0.1),
                    },
                  }}
                >
                  Очистить фильтры
                </Button>
              </Box>
            )}
          </Paper>
        </Fade>

        {/* Результаты */}
        {filteredRoadmaps.length === 0 ? (
          <Fade in={true}>
            <Paper
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
                <SchoolIcon sx={{ fontSize: 64, color: GLASS_COLORS.textSecondary }} />
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
                Дорожные карты не найдены
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: GLASS_COLORS.textSecondary,
                  mb: 4,
                }}
              >
                Попробуйте изменить фильтры или параметры поиска
              </Typography>
              {(searchQuery || selectedProfession) && (
                <Button
                  variant="contained"
                  onClick={handleClearFilters}
                  sx={{
                    background: `linear-gradient(135deg, ${GLASS_COLORS.accent} 0%, ${alpha(GLASS_COLORS.accent, 0.6)} 100%)`,
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
                      background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.accent, 0.9)}, ${alpha(GLASS_COLORS.accent, 0.5)})`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 16px ${alpha(GLASS_COLORS.accent, 0.3)}`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Очистить фильтры
                </Button>
              )}
            </Paper>
          </Fade>
        ) : (
          <Grid container spacing={3}>
            {filteredRoadmaps.map((roadmap) => (
              <Grid item xs={12} sm={6} md={4} key={roadmap.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    background: GLASS_COLORS.surface,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid',
                    borderColor: GLASS_COLORS.border,
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
                      pointerEvents: 'none',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: -20,
                      left: -20,
                      right: -20,
                      bottom: -20,
                      background: `radial-gradient(circle at 30% 30%, ${GLASS_COLORS.accent} 0%, transparent 70%)`,
                      opacity: 0,
                      zIndex: -1,
                      filter: 'blur(30px)',
                      transition: 'opacity 0.4s ease',
                    },
                    '&:hover': {
                      borderColor: GLASS_COLORS.accent,
                      boxShadow: `0 16px 32px ${alpha(GLASS_COLORS.accent, 0.15)}`,
                      transform: 'translateY(-4px)',
                      '&::before': {
                        opacity: 1,
                      },
                      '&::after': {
                        opacity: 0.2,
                      },
                    },
                  }}
                  onClick={() => handleOpenRoadmap(roadmap.slug)}
                >
                  {/* Заголовок карточки */}
                  <CardContent sx={{ flexGrow: 1, pb: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          background: alpha(GLASS_COLORS.accent, 0.15),
                          backdropFilter: 'blur(10px)',
                          border: '1px solid',
                          borderColor: alpha(GLASS_COLORS.accent, 0.3),
                          color: GLASS_COLORS.accent,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: `0 8px 16px ${alpha(GLASS_COLORS.accent, 0.2)}`,
                        }}
                      >
                        <CodeIcon />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: GLASS_COLORS.textPrimary,
                            mb: 1,
                            lineHeight: 1.3,
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {roadmap.title}
                        </Typography>
                        <Chip
                          icon={<FlagIcon sx={{ fontSize: 16 }} />}
                          label={roadmap.profession}
                          size="small"
                          sx={{
                            background: alpha(GLASS_COLORS.info, 0.15),
                            backdropFilter: 'blur(10px)',
                            color: GLASS_COLORS.info,
                            fontWeight: 600,
                            border: '1px solid',
                            borderColor: alpha(GLASS_COLORS.info, 0.3),
                            fontSize: '0.75rem',
                            height: 28,
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Описание */}
                    {roadmap.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 2,
                          lineHeight: 1.5,
                          color: GLASS_COLORS.textSecondary,
                        }}
                      >
                        {roadmap.description.length > 50 
                          ? `${roadmap.description.substring(0, 50)}...` 
                          : roadmap.description
                        }
                      </Typography>
                    )}

                    <Divider sx={{ my: 2, borderColor: GLASS_COLORS.border }} />

                    {/* Информация */}
                    <Stack direction="row" spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary }}>
                          Шагов в карте
                        </Typography>
                        <Stack direction="row" alignItems="baseline" spacing={1}>
                          <Tooltip title="Общее количество шагов в карте" arrow>
                            <NumbersIcon sx={{ fontSize: 16, color: GLASS_COLORS.accent, textShadow: `0 4px 12px ${alpha(GLASS_COLORS.accent, 0.3)}` }} />
                          </Tooltip>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 700,
                              color: GLASS_COLORS.accent,
                              fontSize: '1.5rem',
                              letterSpacing: '-0.02em',
                              textShadow: `0 4px 12px ${alpha(GLASS_COLORS.accent, 0.3)}`,
                            }}
                          >
                            {roadmap.items_count}
                          </Typography>
                        </Stack>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary, mr: 1 }}>
                          Статус
                        </Typography>
                        <Chip
                          label={roadmap.is_active ? 'Активна' : 'Неактивна'}
                          size="small"
                          sx={{
                            background: roadmap.is_active
                              ? alpha(GLASS_COLORS.success, 0.15)
                              : alpha(GLASS_COLORS.error, 0.15),
                            backdropFilter: 'blur(10px)',
                            color: roadmap.is_active ? GLASS_COLORS.success : GLASS_COLORS.error,
                            fontWeight: 600,
                            border: '1px solid',
                            borderColor: roadmap.is_active
                              ? alpha(GLASS_COLORS.success, 0.3)
                              : alpha(GLASS_COLORS.error, 0.3),
                          }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>

                  {/* Действия */}
                  <CardActions sx={{ pt: 2, pb: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      endIcon={loadingRoadmap ? <CircularProgress size={20} color="inherit" /> : <TrendingFlatIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRoadmap(roadmap.slug);
                      }}
                      disabled={loadingRoadmap}
                      sx={{
                        background: `linear-gradient(135deg, ${GLASS_COLORS.accent} 0%, ${alpha(GLASS_COLORS.accent, 0.6)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: alpha('#FFFFFF', 0.3),
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 3,
                        py: 1.5,
                        fontSize: '1rem',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.accent, 0.9)}, ${alpha(GLASS_COLORS.accent, 0.5)})`,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 20px ${alpha(GLASS_COLORS.accent, 0.4)}`,
                        },
                        '&:disabled': {
                          background: alpha(GLASS_COLORS.surface, 0.5),
                          color: GLASS_COLORS.textSecondary,
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {loadingRoadmap ? 'Загрузка...' : 'Открыть'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Кнопка "Назад к вопросам" */}
        <Fade in={true}>
          <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: GLASS_COLORS.border }}>
            <Button
              variant="outlined"
              onClick={handleBackToQuestions}
              startIcon={<ArrowBackIcon />}
              sx={{
                borderWidth: 2,
                borderRadius: 3,
                borderColor: GLASS_COLORS.border,
                color: GLASS_COLORS.textPrimary,
                textTransform: 'none',
                fontWeight: 600,
                background: GLASS_COLORS.surface,
                backdropFilter: 'blur(10px)',
                px: 4,
                py: 1.5,
                '&:hover': {
                  borderColor: GLASS_COLORS.accent,
                  background: alpha(GLASS_COLORS.accent, 0.1),
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Назад к вопросам
            </Button>
          </Box>
        </Fade>

        {/* Модалка с роадмапом */}
        <GlassRoadmapModal
          open={modalOpen}
          onClose={handleCloseModal}
          roadmap={selectedRoadmap}
          onItemClick={handleItemClick}
          onToggleCompletion={handleToggleCompletion}
        />

        <FeedbackFab />
      </Container>
      <Footer />
    </Box>
  );
};