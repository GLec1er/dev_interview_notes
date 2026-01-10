import React, { useEffect, useState, useCallback, memo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
  alpha,
  CardActionArea,
  useScrollTrigger,
  Zoom,
  Fab,
} from '@mui/material';
import {
  ExitToApp as LogoutIcon,
  MenuBook as StartLearningIcon,
  Category as CategoryIcon,
  Lock as LoginIcon,
  TrendingUp as TrendingIcon,
  QuestionAnswer as QuestionsIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  ChevronRight as ChevronRightIcon,
  ArrowUpward as ArrowUpwardIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  Bolt as BoltIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { questionService } from '../services/questionService';
import { categoryService } from '../services/categoryService';

// Нейтральная цветовая палитра
const NEUTRAL_COLORS = {
  primary: '#2D3748', // Тёмно-серый
  secondary: '#4A5568', // Средне-серый
  accent: '#3182CE', // Приглушённый синий
  background: '#F7FAFC', // Светло-серый фон
  surface: '#FFFFFF', // Белый для поверхностей
  textPrimary: '#1A202C', // Тёмный текст
  textSecondary: '#718096', // Серый текст
  border: '#E2E8F0', // Светлая граница
  success: '#38A169', // Приглушённый зелёный
  error: '#E53E3E', // Приглушённый красный
  gradientStart: '#EDF2F7',
  gradientEnd: '#CBD5E0',
  warning: '#D69E2E', // ДОБАВЛЕНО: золотой для достижений
  purple: '#805AD5', // ДОБАВЛЕНО: фиолетовый
  blue: '#61DAFB', // ДОБАВЛЕНО: голубой
};

interface Stats {
  questions: number;
  categories: number;
}

// ДОБАВЛЕНО: Тип для категории из API
interface ApiCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  is_active: boolean;
  question_count: number;
}

// ДОБАВЛЕНО: Цвета для категорий на основе названия
const getCategoryColor = (categoryName: string): string => {
  const colorMap: Record<string, string> = {
    'javascript': NEUTRAL_COLORS.warning,
    'react': NEUTRAL_COLORS.blue,
    'typescript': NEUTRAL_COLORS.accent,
    'python': '#306998',
    'java': '#007396',
    'sql': '#F29111',
    'system design': NEUTRAL_COLORS.success,
    'algorithms': NEUTRAL_COLORS.purple,
    'data structures': '#E44D26',
    'behavioral': NEUTRAL_COLORS.error,
    'html': '#E34F26',
    'css': '#1572B6',
    'node.js': '#339933',
    'docker': '#2496ED',
    'aws': '#FF9900',
    'git': '#F05032',
  };

  const lowerName = categoryName.toLowerCase();
  for (const [key, color] of Object.entries(colorMap)) {
    if (lowerName.includes(key)) {
      return color;
    }
  }

  // Если не нашли совпадение, возвращаем цвет на основе хэша
  const colors = [
    NEUTRAL_COLORS.accent,
    NEUTRAL_COLORS.success,
    NEUTRAL_COLORS.warning,
    NEUTRAL_COLORS.error,
    NEUTRAL_COLORS.purple,
    '#61DAFB',
    '#E44D26',
    '#306998',
  ];
  
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Memoized статистическая карточка
const StatCard = memo(({ title, value, color, icon, onClick }: { 
  title: string; 
  value: number; 
  color: string; 
  icon: React.ReactNode;
  onClick?: () => void;
}) => (
  <Grow in timeout={800}>
    <Card 
      sx={{ 
        height: '100%',
        background: NEUTRAL_COLORS.surface,
        border: `1px solid ${NEUTRAL_COLORS.border}`,
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.5)} 100%)`,
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          borderColor: alpha(color, 0.5),
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, textAlign: 'center' }}>
        <Box sx={{ 
          mb: 2, 
          color: color,
          display: 'inline-flex',
          p: 1.5,
          borderRadius: '50%',
          backgroundColor: alpha(color, 0.1),
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
          }
        }}>
          {icon}
        </Box>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800,
            color: NEUTRAL_COLORS.textPrimary,
            mb: 1,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}
        >
          {value.toLocaleString()}
        </Typography>
        <Typography 
          variant="subtitle1" 
          color={NEUTRAL_COLORS.textSecondary}
          sx={{ fontWeight: 500, fontSize: '0.95rem' }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  </Grow>
));

// ДОБАВЛЕНО: Карточка категории
const CategoryCard = memo(({ category, onClick }: {
  category: ApiCategory;
  onClick: () => void;
}) => {
  const color = getCategoryColor(category.name);
  
  return (
    <Grow in timeout={1000}>
      <Card
        sx={{
          height: '100%',
          background: NEUTRAL_COLORS.surface,
          border: `1px solid ${NEUTRAL_COLORS.border}`,
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 20px ${alpha(color, 0.15)}`,
            borderColor: color,
          }
        }}
      >
        <CardActionArea onClick={onClick} sx={{ height: '100%', p: 2 }}>
          <CardContent sx={{ p: 0, textAlign: 'center' }}>
            <Box sx={{ 
              mb: 2,
              display: 'inline-flex',
              p: 2,
              borderRadius: '12px',
              backgroundColor: alpha(color, 0.1),
              color: color,
            }}>
              <CategoryIcon fontSize="large" />
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: NEUTRAL_COLORS.textPrimary,
                mb: 1,
                textTransform: 'capitalize'
              }}
            >
              {category.name}
            </Typography>
            <Typography 
              variant="body2" 
              color={NEUTRAL_COLORS.textSecondary}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
            >
              <QuestionsIcon fontSize="small" />
              {category.question_count} вопросов
            </Typography>
            {!category.is_active && (
              <Chip
                label="Неактивно"
                size="small"
                sx={{
                  mt: 1,
                  backgroundColor: alpha(NEUTRAL_COLORS.error, 0.1),
                  color: NEUTRAL_COLORS.error,
                  fontSize: '0.7rem'
                }}
              />
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    </Grow>
  );
});

// ДОБАВЛЕНО: Кнопка для быстрого старта
const QuickStartCard = memo(() => {
  const navigate = useNavigate();
  
  return (
    <Zoom in timeout={1200}>
      <Card
        sx={{
          background: `linear-gradient(135deg, ${alpha(NEUTRAL_COLORS.accent, 0.9)} 0%, ${alpha(NEUTRAL_COLORS.accent, 0.7)} 100%)`,
          color: 'white',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: `0 10px 30px ${alpha(NEUTRAL_COLORS.accent, 0.3)}`,
          '&:hover': {
            boxShadow: `0 15px 40px ${alpha(NEUTRAL_COLORS.accent, 0.4)}`,
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BoltIcon sx={{ fontSize: 32, mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Быстрый старт
            </Typography>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.95 }}>
            Ответьте на 5 вопросов за 10 минут и проверьте свои навыки
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.5 }}>
                <TimerIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                10 минут
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                <QuestionsIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                5 вопросов
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              endIcon={<ChevronRightIcon />}
              onClick={() => navigate('/questions')}
              sx={{
                backgroundColor: 'white',
                color: NEUTRAL_COLORS.accent,
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: alpha('#FFFFFF', 0.9),
                }
              }}
            >
              Начать сейчас
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );
});

// ДОБАВЛЕНО: Кнопка скролла вверх
const ScrollToTop = memo(() => {
  const trigger = useScrollTrigger({
    threshold: 100,
  });

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <Zoom in={trigger}>
      <Fab
        size="medium"
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          backgroundColor: NEUTRAL_COLORS.surface,
          color: NEUTRAL_COLORS.accent,
          border: `1px solid ${NEUTRAL_COLORS.border}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            backgroundColor: NEUTRAL_COLORS.background,
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <ArrowUpwardIcon />
      </Fab>
    </Zoom>
  );
});

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, isAuthenticated, logout } = useAuth();
  const [stats, setStats] = useState<Stats>({ questions: 0, categories: 0 });
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  // ДОБАВЛЕНО: Функция для скролла к секции
  const scrollToFeatures = useCallback(() => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [questionsData, categoriesData] = await Promise.all([
        questionService.getQuestions(1, 1, true, undefined, undefined, undefined, undefined, true),
        categoryService.getCategories(1, 1, false),
      ]);
      
      setStats({
        questions: questionsData.total,
        categories: categoriesData.total,
      });
    } catch (err) {
      setError('Не удалось загрузить статистику');
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ДОБАВЛЕНО: Загрузка категорий
  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const categoriesData = await categoryService.getCategories(1, 10, true);
      
      // Фильтруем и сортируем категории по количеству вопросов
      const sortedCategories = (categoriesData.items as ApiCategory[])
        .filter(cat => cat.is_active) // Только активные категории
        .sort((a, b) => b.question_count - a.question_count)
        .slice(0, 5); // Берем топ-5 категорий
      
      setCategories(sortedCategories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadCategories();
  }, [loadStats, loadCategories]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      document.cookie = 'access_token=; path=/; max-age=0;';
      document.cookie = 'refresh_token=; path=/; max-age=0;';
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  }, [logout, navigate]);

  const handleNavigation = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  // ДОБАВЛЕНО: Функция для перехода к случайной категории
  const handleRandomCategory = useCallback(() => {
    if (categories.length > 0) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      navigate(`/questions?category=${randomCategory.name}`);
    } else {
      // Если категории еще не загружены, используем дефолтные
      navigate('/questions');
    }
  }, [categories, navigate]);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${NEUTRAL_COLORS.background} 0%, ${NEUTRAL_COLORS.gradientEnd} 100%)`,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 15% 50%, ${alpha(NEUTRAL_COLORS.gradientStart, 0.4)} 0%, transparent 50%),
          radial-gradient(circle at 85% 30%, ${alpha(NEUTRAL_COLORS.gradientEnd, 0.2)} 0%, transparent 50%)
        `,
      }
    }}>
      {/* Навигационная панель */}
      {isAuthenticated && (
        <Fade in>
          <AppBar 
            position="sticky" 
            elevation={0}
            sx={{ 
              backgroundColor: alpha(NEUTRAL_COLORS.surface, 0.95),
              backdropFilter: 'blur(12px)',
              borderBottom: `1px solid ${NEUTRAL_COLORS.border}`,
              transition: 'all 0.3s ease',
            }}
          >
            <Container maxWidth="lg">
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
                  onClick={() => handleNavigation('/')}
                >
                  Interview<span style={{ color: NEUTRAL_COLORS.accent }}>Box</span>
                </Typography>
                
                <Stack direction="row" spacing={1.5} alignItems="center">                  
                  {!isMobile && (
                    <>
                      <Chip 
                        label={`${user?.first_name} ${user?.last_name}`}
                        size="medium"
                        onClick={() => handleNavigation('/profile')}
                        sx={{ 
                          fontWeight: 500,
                          backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                          color: NEUTRAL_COLORS.textPrimary,
                          cursor: 'pointer',
                          '& .MuiChip-label': {
                            px: 1.5,
                          },
                          '&:hover': {
                            backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.2),
                          }
                        }}
                      />
                      {user?.is_admin && (
                        <Chip 
                          label="Admin" 
                          size="medium"
                          sx={{ 
                            fontWeight: 600,
                            backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                            color: NEUTRAL_COLORS.success,
                          }}
                        />
                      )}
                    </>
                  )}
                  
                  <IconButton
                    onClick={handleLogout}
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
      )}

      {/* Основной контент */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Герой секция */}
        <Box sx={{ 
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 6 },
          px: { xs: 2, sm: 3 },
          textAlign: 'center',
        }}>
          <Fade in timeout={600}>
            <Box sx={{ mb: 4 }}>
              <Chip 
                // icon={<TrendingIcon />}
                label="Нам доверяют опытные разработчики"
                size="medium"
                sx={{ 
                  mb: 3,
                  fontWeight: 600,
                  backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                  color: NEUTRAL_COLORS.accent,
                  fontSize: '0.875rem',
                  py: 1,
                }}
              />
              
              <Typography 
                variant={isMobile ? 'h3' : 'h1'} 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 800,
                  mb: 3,
                  color: NEUTRAL_COLORS.textPrimary,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.2,
                  fontSize: { xs: '2.5rem', md: '3.75rem' }
                }}
              >
                Успешно пройдите собеседование
                <br />
                <Box component="span" sx={{ 
                  background: `linear-gradient(135deg, ${NEUTRAL_COLORS.accent} 0%, ${alpha(NEUTRAL_COLORS.accent, 0.8)} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  с первого раза
                </Box>
              </Typography>
              
              <Typography 
                variant={isMobile ? 'h6' : 'h5'} 
                sx={{ 
                  mb: 4, 
                  color: NEUTRAL_COLORS.textSecondary,
                  maxWidth: '680px',
                  mx: 'auto',
                  lineHeight: 1.6,
                  fontWeight: 400,
                  fontSize: { xs: '1.125rem', md: '1.5rem' }
                }}
              >
                Потренируйтесь на {stats.questions}+ реальных вопросах, 
                получите персонализированную обратную связь и отслеживайте свой прогресс
              </Typography>
            </Box>
          </Fade>

          {/* Призыв к действию */}
          <Fade in timeout={900}>
            <Box sx={{ 
              display: 'flex', 
              gap: 3, 
              justifyContent: 'center', 
              mb: 8,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center'
            }}>
              {!isAuthenticated ? (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<LoginIcon />}
                    onClick={() => handleNavigation('/login')}
                    sx={{
                      px: 5,
                      py: 1.8,
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      background: `linear-gradient(135deg, ${NEUTRAL_COLORS.accent} 0%, ${alpha(NEUTRAL_COLORS.accent, 0.9)} 100%)`,
                      boxShadow: '0 4px 20px rgba(49, 130, 206, 0.3)',
                      '&:hover': {
                        boxShadow: '0 8px 30px rgba(49, 130, 206, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Начать обучение
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<QuestionsIcon />}
                    onClick={() => handleNavigation('/questions')}
                    sx={{
                      px: 5,
                      py: 1.8,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      borderWidth: 2,
                      borderColor: NEUTRAL_COLORS.border,
                      color: NEUTRAL_COLORS.textPrimary,
                      '&:hover': {
                        borderColor: NEUTRAL_COLORS.accent,
                        backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
                        borderWidth: 2,
                      }
                    }}
                  >
                    Смотреть вопросы
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<StartLearningIcon />}
                    onClick={() => navigate('/questions')}
                    sx={{
                      px: 5,
                      py: 1.8,
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      background: `linear-gradient(135deg, ${NEUTRAL_COLORS.accent} 0%, ${alpha(NEUTRAL_COLORS.accent, 0.9)} 100%)`,
                      boxShadow: '0 4px 20px rgba(49, 130, 206, 0.3)',
                      '&:hover': {
                        boxShadow: '0 8px 30px rgba(49, 130, 206, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Начать обучение
                  </Button>
                </>
              )}
            </Box>
          </Fade>

          {/* Анимированная стрелка вниз */}
          <Fade in timeout={1500}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                mt: 4,
                cursor: 'pointer',
                animation: 'bounce 2s infinite',
                '@keyframes bounce': {
                  '0%, 100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-10px)' },
                }
              }}
              onClick={scrollToFeatures}
            >
              <ArrowDownIcon sx={{ fontSize: 40, color: NEUTRAL_COLORS.accent }} />
            </Box>
          </Fade>
        </Box>

        {/* Секция статистики */}
        <Box sx={{ mb: 10, px: { xs: 2, sm: 3 } }} ref={featuresRef}>
          <Fade in timeout={1200}>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 6, 
                fontWeight: 700,
                color: NEUTRAL_COLORS.textPrimary,
                textAlign: 'center',
                fontSize: '2rem'
              }}
            >
              Почему выбрать Interview<span style={{ color: NEUTRAL_COLORS.accent }}>Box</span>?
            </Typography>
          </Fade>

          <Grid container spacing={3} justifyContent="center" sx={{ mb: 8 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Вопросов"
                value={stats.questions}
                color={NEUTRAL_COLORS.accent}
                icon={<QuestionsIcon sx={{ fontSize: 32 }} />}
                onClick={() => navigate('/questions')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Категорий"
                value={stats.categories}
                color={NEUTRAL_COLORS.success}
                icon={<CategoryIcon sx={{ fontSize: 32 }} />}
                onClick={() => navigate('/questions')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Пользователей"
                value={346}
                color={NEUTRAL_COLORS.warning}
                icon={<PeopleIcon sx={{ fontSize: 32 }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Успешность"
                value={87}
                color={NEUTRAL_COLORS.purple}
                icon={<TrendingIcon sx={{ fontSize: 32 }} />}
              />
            </Grid>
          </Grid>

          {/* Quick Start Challenge */}
          {isAuthenticated && (
            <Box sx={{ mb: 8 }}>
              <QuickStartCard />
            </Box>
          )}

          {/* Популярные категории */}
          <Box sx={{ mb: 10 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 4, 
                fontWeight: 600,
                color: NEUTRAL_COLORS.textPrimary,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <StarIcon sx={{ color: NEUTRAL_COLORS.warning }} />
              Популярные категории
            </Typography>
            
            {categoriesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: NEUTRAL_COLORS.accent }} />
              </Box>
            ) : categories.length > 0 ? (
              <Grid container spacing={2}>
                {categories.map((category) => (
                  <Grid item xs={6} sm={4} md={2.4} key={category.id}>
                    <CategoryCard
                      category={category}
                      onClick={() => navigate(`/questions?category_id=${category.id}`)}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography 
                color={NEUTRAL_COLORS.textSecondary}
                textAlign="center"
                sx={{ py: 4 }}
              >
                Категории пока не загружены
              </Typography>
            )}
          </Box>
        </Box>
      </Container>

      {/* Футер */}
      <Fade in timeout={1500}>
        <Box sx={{ 
          py: 6, 
          borderTop: `1px solid ${NEUTRAL_COLORS.border}`,
          backgroundColor: alpha(NEUTRAL_COLORS.surface, 0.97),
          backdropFilter: 'blur(8px)'
        }}>
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 900,
                    color: NEUTRAL_COLORS.textPrimary,
                    fontSize: '1.45rem',
                    cursor: 'pointer',
                    letterSpacing: '-0.025em',
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    '&:hover': { 
                      color: NEUTRAL_COLORS.accent,
                      opacity: 0.9 
                    }
                  }}
                  onClick={() => handleNavigation('/')}
                >
                  Interview<span style={{ color: NEUTRAL_COLORS.accent }}>Box</span>
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: NEUTRAL_COLORS.textSecondary, 
                    mb: 3,
                    maxWidth: '400px'
                  }}
                >
                  Лучшая платформа для подготовки к техническим собеседованиям. 
                  Присоединяйтесь к тысячам разработчиков, которые получили работу мечты.
                </Typography>
                <Button
                  variant="contained"
                  endIcon={<ChevronRightIcon />}
                  onClick={() => navigate('/questions')}
                  sx={{
                    background: `linear-gradient(135deg, ${NEUTRAL_COLORS.accent} 0%, ${alpha(NEUTRAL_COLORS.accent, 0.9)} 100%)`,
                    borderRadius: 2,
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Начни практиковаться сейчас
                </Button>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: NEUTRAL_COLORS.textSecondary, 
                    mb: 1,
                    fontSize: '0.875rem'
                  }}
                >
                  © 2026 InterviewBox. Все права защищены.
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: alpha(NEUTRAL_COLORS.textSecondary, 0.7),
                    fontSize: '0.75rem'
                  }}
                >
                  Профессиональная платформа подготовки к собеседованиям • v2.1.0
                </Typography>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Fade>

      {/* Кнопка скролла вверх */}
      <ScrollToTop />
    </Box>
  );
};
