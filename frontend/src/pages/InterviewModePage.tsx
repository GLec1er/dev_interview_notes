import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Fade,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Stack,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FeedbackFab } from '../components/FeedbackFab';
import { useTheme } from '../context/ThemeContext';
import { companyService } from '../services/companyService';
import { ContentRenderer } from '../components/ContentRenderer';
import type { Question } from '../types';

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

export const InterviewModePage: React.FC = () => {
  const navigate = useNavigate();
  const { companyId, questionIndex } = useParams<{ companyId: string; questionIndex: string }>();
  const { mode: themeMode } = useTheme();
  const GLASS_COLORS = getGlassColors(themeMode);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const currentIndex = parseInt(questionIndex || '0', 10);
  const currentQuestion = questions[currentIndex];

  // Загрузка данных
  const loadData = useCallback(async () => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      const questionsData = await companyService.getCompanyQuestions(companyId, 1, 1000);
      setQuestions(questionsData.items || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Сброс состояния при смене вопроса
  useEffect(() => {
    setShowAnswer(false);
    setIsAnswered(false);
    setRatingSubmitted(false);
    setUserRating(null);
  }, [currentIndex]);

  const handleSubmitRating = () => {
    if (userRating !== null) {
      setRatingSubmitted(true);
      setTimeout(() => {
        setRatingDialogOpen(false);
        // Переход к следующему вопросу или завершение
        if (currentIndex < questions.length - 1) {
          navigate(`/companies/${companyId}/interview/${currentIndex + 1}`);
        } else {
          navigate(`/companies/${companyId}/results`);
        }
      }, 1000);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      navigate(`/companies/${companyId}/interview/${currentIndex + 1}`);
    } else {
      setRatingDialogOpen(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      navigate(`/companies/${companyId}/interview/${currentIndex - 1}`);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: GLASS_COLORS.mainColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: GLASS_COLORS.primary }} />
      </Box>
    );
  }

  if (!currentQuestion) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: GLASS_COLORS.mainColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container>
          <Typography variant="h6" sx={{ color: GLASS_COLORS.textSecondary, textAlign: 'center' }}>
            Вопрос не найден
          </Typography>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              onClick={() => navigate(`/companies/${companyId}/questions`)}
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${alpha(GLASS_COLORS.primary, 0.7)})`,
                borderRadius: 3,
              }}
            >
              Вернуться к списку
            </Button>
          </Box>
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
      }}
    >
      <Header />
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
        {/* Заголовок и навигация */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/companies/${companyId}/questions`)}
              sx={{
                borderRadius: 3,
                borderWidth: 2,
                borderColor: alpha(GLASS_COLORS.primary, 0.3),
                color: GLASS_COLORS.primary,
                fontWeight: 600,
                background: GLASS_COLORS.surface,
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderColor: GLASS_COLORS.primary,
                  background: alpha(GLASS_COLORS.primary, 0.1),
                },
              }}
            >
              Назад
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary, fontWeight: 500 }}>
                Вопрос {currentIndex + 1} из {questions.length}
              </Typography>
            </Box>
          </Box>

          {/* Прогресс-бар */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              background: GLASS_COLORS.surface,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: GLASS_COLORS.border,
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(GLASS_COLORS.border, 0.5),
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  height: '100%',
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${GLASS_COLORS.primary}, ${GLASS_COLORS.success})`,
                  transition: 'width 0.6s ease-out',
                }}
              />
            </Box>
          </Paper>
        </Box>

        {/* Основной контент */}
        <Fade in={true}>
          <Box>
            {/* Карточка вопроса */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                background: GLASS_COLORS.surface,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: GLASS_COLORS.border,
                mb: 4,
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: GLASS_COLORS.textPrimary,
                    mb: 2,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {currentQuestion.title}
                </Typography>

                {/* Теги */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {currentQuestion.category && (
                    <Box
                      sx={{
                        px: 2,
                        py: 0.75,
                        borderRadius: 2,
                        background: alpha(GLASS_COLORS.secondary, 0.15),
                        border: '1px solid',
                        borderColor: alpha(GLASS_COLORS.secondary, 0.3),
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: GLASS_COLORS.secondary,
                      }}
                    >
                      {currentQuestion.category.name}
                    </Box>
                  )}
                  <Box
                    sx={{
                      px: 2,
                      py: 0.75,
                      borderRadius: 2,
                      background:
                        currentQuestion.difficulty === 'easy'
                          ? alpha(GLASS_COLORS.success, 0.15)
                          : currentQuestion.difficulty === 'medium'
                          ? alpha(GLASS_COLORS.warning, 0.15)
                          : alpha(GLASS_COLORS.error, 0.15),
                      border: '1px solid',
                      borderColor:
                        currentQuestion.difficulty === 'easy'
                          ? alpha(GLASS_COLORS.success, 0.3)
                          : currentQuestion.difficulty === 'medium'
                          ? alpha(GLASS_COLORS.warning, 0.3)
                          : alpha(GLASS_COLORS.error, 0.3),
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color:
                        currentQuestion.difficulty === 'easy'
                          ? GLASS_COLORS.success
                          : currentQuestion.difficulty === 'medium'
                          ? GLASS_COLORS.warning
                          : GLASS_COLORS.error,
                    }}
                  >
                    {getDifficultyLabel(currentQuestion.difficulty)}
                  </Box>
                </Box>
              </Box>

              {/* Текст вопроса */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: alpha(GLASS_COLORS.info, 0.1),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha(GLASS_COLORS.info, 0.3),
                  mb: 3,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: GLASS_COLORS.info,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <AssignmentRoundedIcon sx={{ fontSize: '1rem' }} />
                  Вопрос
                </Typography>
                <Box sx={{ color: GLASS_COLORS.textPrimary }}>
                  {currentQuestion.content && currentQuestion.content.length > 0 ? (
                    <ContentRenderer blocks={currentQuestion.content} />
                  ) : (
                    <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
                      Текст вопроса не загружен
                    </Typography>
                  )}
                </Box>
              </Paper>

              {/* Кнопка показать ответ */}
              <Button
                onClick={() => {
                  setShowAnswer(!showAnswer);
                  if (!showAnswer && !isAnswered) {
                    setIsAnswered(true);
                  }
                }}
                variant="contained"
                startIcon={showAnswer ? <CloseIcon /> : <CheckCircleIcon />}
                sx={{
                  background: showAnswer
                    ? `linear-gradient(135deg, ${GLASS_COLORS.success}, ${alpha(GLASS_COLORS.success, 0.7)})`
                    : `linear-gradient(135deg, ${GLASS_COLORS.warning}, ${alpha(GLASS_COLORS.warning, 0.7)})`,
                  borderRadius: 3,
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  mb: 3,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 16px ${alpha(
                      showAnswer ? GLASS_COLORS.success : GLASS_COLORS.warning,
                      0.3
                    )}`,
                  },
                }}
              >
                {showAnswer ? 'Скрыть ответ' : 'Открыть ответ'}
              </Button>

              {/* Ответ */}
              {showAnswer && (
                <Fade in={showAnswer}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: alpha(GLASS_COLORS.success, 0.1),
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: alpha(GLASS_COLORS.success, 0.3),
                      mb: 3,
                      animation: 'slideInUp 0.4s ease-out',
                      '@keyframes slideInUp': {
                        from: {
                          opacity: 0,
                          transform: 'translateY(20px)',
                        },
                        to: {
                          opacity: 1,
                          transform: 'translateY(0)',
                        },
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CheckCircleIcon sx={{ fontSize: '1.25rem', color: GLASS_COLORS.success }} />
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: GLASS_COLORS.success,
                        }}
                      >
                        Рекомендуемый ответ
                      </Typography>
                      {isAnswered && (
                        <Box
                          sx={{
                            ml: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 2,
                            py: 0.5,
                            borderRadius: 2,
                            background: alpha(GLASS_COLORS.success, 0.2),
                            animation: 'slideInRight 0.6s ease-out',
                            '@keyframes slideInRight': {
                              from: {
                                opacity: 0,
                                transform: 'translateX(-20px)',
                              },
                              to: {
                                opacity: 1,
                                transform: 'translateX(0)',
                              },
                            },
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: '0.9rem', color: GLASS_COLORS.success }} />
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: GLASS_COLORS.success,
                              fontSize: '0.8rem',
                              letterSpacing: '0.5px',
                            }}
                          >
                            ВОПРОС ОТВЕЧЕН
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ color: GLASS_COLORS.textPrimary }}>
                      {currentQuestion.answers && currentQuestion.answers.length > 0 && currentQuestion.answers[0].content && currentQuestion.answers[0].content.length > 0 ? (
                        <ContentRenderer blocks={currentQuestion.answers[0].content} />
                      ) : (
                        <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
                          Ответ не добавлен. Проведи поиск в интернете для получения рекомендуемого ответа.
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Fade>
              )}
            </Paper>

            {/* Навигация между вопросами */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
              <Button
                onClick={handlePreviousQuestion}
                disabled={currentIndex === 0}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  borderWidth: 2,
                  borderColor: alpha(GLASS_COLORS.primary, 0.3),
                  color: GLASS_COLORS.primary,
                  fontWeight: 600,
                  background: GLASS_COLORS.surface,
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    borderColor: GLASS_COLORS.primary,
                    background: alpha(GLASS_COLORS.primary, 0.1),
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  },
                }}
              >
                ← Предыдущий
              </Button>

              <Button
                onClick={handleNextQuestion}
                variant="contained"
                sx={{
                  background: `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${alpha(GLASS_COLORS.primary, 0.7)})`,
                  borderRadius: 3,
                  fontWeight: 600,
                  px: 4,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 16px ${alpha(GLASS_COLORS.primary, 0.3)}`,
                  },
                }}
              >
                {currentIndex === questions.length - 1 ? 'Завершить' : 'Следующий →'}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Container>

      {/* Диалог оценки */}
      <Dialog
        open={ratingDialogOpen}
        onClose={() => setRatingDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: GLASS_COLORS.surfaceDark,
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid',
            borderColor: GLASS_COLORS.border,
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: '1px solid',
            borderColor: GLASS_COLORS.border,
            pb: 2,
            fontWeight: 600,
            color: GLASS_COLORS.textPrimary,
            fontSize: '1.25rem',
            letterSpacing: '-0.01em',
          }}
        >
          {!ratingSubmitted ? 'Оцените вашу подготовку' : 'Спасибо за оценку!'}
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {!ratingSubmitted ? (
            <Stack spacing={3}>
              <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
                Как, по вашему мнению, вы ответили на все вопросы этой компании?
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Rating
                  value={userRating}
                  onChange={(_, newValue) => setUserRating(newValue)}
                  size="large"
                  sx={{
                    '& .MuiRating-iconFilled': {
                      color: GLASS_COLORS.warning,
                    },
                    '& .MuiRating-iconEmpty': {
                      color: alpha(GLASS_COLORS.border, 0.5),
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: alpha(GLASS_COLORS.info, 0.1),
                  border: '1px solid',
                  borderColor: alpha(GLASS_COLORS.info, 0.3),
                }}
              >
                <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary }}>
                  {userRating === 1 && 'Нужна больше практики - рекомендуем пересмотреть теорию'}
                  {userRating === 2 && 'Есть пробелы - продолжайте практиковаться'}
                  {userRating === 3 && 'Хороший уровень - нужна шлифовка'}
                  {userRating === 4 && 'Отличная подготовка - осталось совсем чуть-чуть'}
                  {userRating === 5 && 'Превосходно! Вы готовы к собеседованию 🎉'}
                  {!userRating && 'Выберите оценку вашей подготовки'}
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: GLASS_COLORS.success, mb: 2 }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: GLASS_COLORS.textPrimary,
                  mb: 1,
                }}
              >
                Ваша оценка: {userRating} / 5
              </Typography>
              <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
                Результаты сохранены. Переходим к результатам...
              </Typography>
            </Box>
          )}
        </DialogContent>

        {!ratingSubmitted && (
          <DialogActions sx={{ borderTop: '1px solid', borderColor: GLASS_COLORS.border, pt: 2, px: 3, pb: 3 }}>
            <Button
              onClick={() => setRatingDialogOpen(false)}
              variant="outlined"
              sx={{
                borderRadius: 3,
                borderColor: GLASS_COLORS.border,
                color: GLASS_COLORS.textPrimary,
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmitRating}
              disabled={userRating === null}
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${GLASS_COLORS.success}, ${alpha(GLASS_COLORS.success, 0.7)})`,
                borderRadius: 3,
                fontWeight: 600,
              }}
            >
              Сохранить оценку
            </Button>
          </DialogActions>
        )}
      </Dialog>

      <FeedbackFab />
      <Footer />
    </Box>
  );
};
