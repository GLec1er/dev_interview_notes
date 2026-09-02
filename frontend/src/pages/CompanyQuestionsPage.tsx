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
  IconButton,
  Fade,
  alpha,
  useMediaQuery,
  useTheme as useMuiTheme,
  LinearProgress,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StorageIcon from '@mui/icons-material/Storage';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FeedbackFab } from '../components/FeedbackFab';
import { useTheme } from '../context/ThemeContext';
import { companyService } from '../services/companyService';
import { questionCompletionService } from '../services/questionCompletionService';
import type { Company, Question } from '../types';

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

// Получение цвета по сложности
const getDifficultyColor = (difficulty: string, colors: any) => {
  switch (difficulty) {
    case 'easy':
      return colors.success;
    case 'medium':
      return colors.warning;
    case 'hard':
      return colors.error;
    default:
      return colors.primary;
  }
};

// Получение метки по сложности
const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'Легкий';
    case 'medium':
      return 'Средний';
    case 'hard':
      return 'Сложный';
    default:
      return 'Неизвестно';
  }
};

interface CompanyQuestionItemProps {
  question: Question;
  index: number;
  colors: any;
  onCompletionChange?: () => void;
}

// Карточка вопроса в списке компании
const CompanyQuestionItem: React.FC<CompanyQuestionItemProps> = ({
  question,
  index,
  colors,
  onCompletionChange,
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompletionLoading, setIsCompletionLoading] = useState(false);

  useEffect(() => {
    questionCompletionService.isQuestionCompleted(question.id)
      .then(result => setIsCompleted(result.is_completed))
      .catch(err => console.error('Failed to check completion status:', err));
  }, [question.id]);

  const handleToggleCompletion = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setIsCompletionLoading(true);
      if (isCompleted) {
        await questionCompletionService.unmarkQuestionComplete(question.id);
      } else {
        await questionCompletionService.markQuestionComplete(question.id);
      }
      setIsCompleted(!isCompleted);
      onCompletionChange?.();
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    } finally {
      setIsCompletionLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: colors.surface,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: isCompleted ? colors.success : colors.border,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        mb: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: `linear-gradient(135deg, ${colors.glassHighlight} 0%, transparent 100%)`,
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: isCompleted ? colors.success : colors.borderGlow,
          boxShadow: `0 12px 24px ${alpha(isCompleted ? colors.success : colors.primary, 0.15)}`,
          '&::before': {
            opacity: 1,
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
        {/* Номер */}
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            background: alpha(colors.primary, 0.15),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            color: colors.primary,
            fontSize: '0.875rem',
            flexShrink: 0,
          }}
        >
          {index + 1}
        </Box>

        {/* Названи и теги */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: isCompleted ? colors.success : colors.textPrimary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '1rem',
              mb: 1,
              textDecoration: isCompleted ? 'line-through' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {question.title}
          </Typography>

          {/* Теги */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Тег категории */}
            {question.category && (
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  background: alpha(colors.secondary, 0.15),
                  border: '1px solid',
                  borderColor: alpha(colors.secondary, 0.3),
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: colors.secondary,
                }}
              >
                {question.category.name}
              </Box>
            )}

            {/* Тег сложности */}
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                background: alpha(getDifficultyColor(question.difficulty, colors), 0.15),
                border: '1px solid',
                borderColor: alpha(getDifficultyColor(question.difficulty, colors), 0.3),
                fontSize: '0.75rem',
                fontWeight: 600,
                color: getDifficultyColor(question.difficulty, colors),
              }}
            >
              {getDifficultyLabel(question.difficulty)}
            </Box>
          </Box>
        </Box>

        {/* Кнопка отметки завершения */}
        <IconButton
          onClick={handleToggleCompletion}
          disabled={isCompletionLoading}
          sx={{
            flexShrink: 0,
            color: isCompleted ? colors.success : colors.textSecondary,
            transition: 'all 0.3s ease',
            '&:hover': {
              color: colors.success,
              transform: 'scale(1.1)',
            },
          }}
        >
          {isCompleted ? (
            <CheckCircleIcon />
          ) : (
            <CheckCircleOutlineIcon />
          )}
        </IconButton>
      </Box>
    </Paper>
  );
};

export const CompanyQuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();
  const isMobile = useMediaQuery(useMuiTheme().breakpoints.down(1000));
  const { mode: themeMode } = useTheme();
  const GLASS_COLORS = getGlassColors(themeMode);

  const [company, setCompany] = useState<Company | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [completedCount, setCompletedCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Загрузка компании и её вопросов
  const loadData = useCallback(async () => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      const [companyData, questionsData] = await Promise.all([
        companyService.getCompany(companyId),
        companyService.getCompanyQuestions(companyId, 1, 1000),
      ]);
      setCompany(companyData);
      setQuestions(questionsData.items || []);
      setFilteredQuestions(questionsData.items || []);

      // Загружаем статистику завершения для каждого вопроса
      const completedStatuses = await Promise.all(
        (questionsData.items || []).map((q: Question) =>
          questionCompletionService.isQuestionCompleted(q.id)
            .then(result => result.is_completed)
            .catch(() => false)
        )
      );
      const completed = completedStatuses.filter(Boolean).length;
      setCompletedCount(completed);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  // Дебаунс для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Фильтрация вопросов
  useEffect(() => {
    if (debouncedSearch.trim()) {
      const filtered = questions.filter((q) =>
        q.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      setFilteredQuestions(filtered);
    } else {
      setFilteredQuestions(questions);
    }
  }, [questions, debouncedSearch]);

  const handleStartInterview = (index: number) => {
    navigate(`/companies/${companyId}/interview/${index}`);
  };

  const handleCompletionChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  const completionPercentage = questions.length > 0 ? (completedCount / questions.length) * 100 : 0;

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
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Hero Section */}
        <Box sx={{ mb: 4, position: 'relative' }}>
          {/* Кнопка назад */}
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/companies')}
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
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
                transform: 'translateX(-4px)',
                boxShadow: `0 8px 24px ${alpha(GLASS_COLORS.primary, 0.2)}`,
              },
              transition: 'all 0.3s ease',
            }}
          >
            {isMobile ? <AssignmentRoundedIcon /> : 'Назад'}
          </Button>

          {/* Мобильная кнопка */}
          <IconButton
            onClick={() => navigate('/companies')}
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
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

          {/* Заголовок компании */}
          {isLoading ? (
            <CircularProgress sx={{ color: GLASS_COLORS.primary }} />
          ) : company ? (
            <Box sx={{ textAlign: 'center', pt: 2 }}>
              <Box sx={{ display: 'inline-flex', p: 2, mb: 2, borderRadius: '12px', background: alpha(GLASS_COLORS.primary, 0.07) }}>
                {company.logo_url ? (
                  <img src={company.logo_url} alt={company.name} style={{ width: 48, height: 48, objectFit: 'contain' }} />
                ) : (
                  <StorageIcon sx={{ color: GLASS_COLORS.primary, fontSize: 40 }} />
                )}
              </Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  color: GLASS_COLORS.textPrimary,
                  mb: 1,
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  letterSpacing: '-0.02em',
                }}
              >
                {company.name}
              </Typography>
              {company.description && (
                <Typography
                  variant="body1"
                  sx={{
                    color: GLASS_COLORS.textSecondary,
                    maxWidth: '600px',
                    mx: 'auto',
                  }}
                >
                  {company.description}
                </Typography>
              )}
            </Box>
          ) : null}
        </Box>

        {/* Полоска прогресса */}
        {!isLoading && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: GLASS_COLORS.surface,
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid',
              borderColor: GLASS_COLORS.border,
              mb: 4,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: GLASS_COLORS.textPrimary,
                  letterSpacing: '-0.01em',
                }}
              >
                Ваше изучение
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: GLASS_COLORS.primary,
                }}
              >
                {completedCount} / {questions.length}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completionPercentage}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(GLASS_COLORS.border, 0.5),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${GLASS_COLORS.primary}, ${GLASS_COLORS.success})`,
                },
              }}
            />
          </Paper>
        )}

        {/* Поле поиска */}
        <Box sx={{ mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: GLASS_COLORS.surface,
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid',
              borderColor: GLASS_COLORS.border,
            }}
          >
            <TextField
              fullWidth
              placeholder="Поиск вопроса..."
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
                  borderRadius: 2,
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
          </Paper>
        </Box>

        {/* Список вопросов */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: GLASS_COLORS.primary }} />
          </Box>
        ) : filteredQuestions.length > 0 ? (
          <Fade in={true}>
            <Box sx={{ mb: 6 }}>
              {filteredQuestions.map((question, index) => (
                <CompanyQuestionItem
                  key={question.id}
                  question={question}
                  index={index}
                  colors={GLASS_COLORS}
                  onCompletionChange={handleCompletionChange}
                />
              ))}

              {/* Кнопка запуска режима собеседования */}
              <Box sx={{ mt: 6, textAlign: 'center' }}>
                <Button
                  onClick={() => handleStartInterview(0)}
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    background: `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${GLASS_COLORS.secondary})`,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1.5px solid',
                    borderColor: alpha('#FFFFFF', 0.5),
                    color: 'white',
                    borderRadius: 4,
                    fontWeight: 700,
                    px: 6,
                    py: 2,
                    fontSize: '1.1rem',
                    letterSpacing: '-0.01em',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: `0 10px 30px -5px ${alpha(GLASS_COLORS.primary, 0.4)}`,
                    transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: `0 15px 40px -5px ${alpha(GLASS_COLORS.primary, 0.5)}`,
                    },
                    '&:active': {
                      transform: 'translateY(0) scale(0.98)',
                    },
                  }}
                >
                  Начать режим собеседования
                </Button>
              </Box>
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
              {debouncedSearch ? 'Вопросы не найдены' : 'Нет доступных вопросов'}
            </Typography>
          </Box>
        )}
      </Container>

      <FeedbackFab />
      <Footer />
    </Box>
  );
};
