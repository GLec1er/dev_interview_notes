import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Alert,
  Stack,
  Paper,
  alpha,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  Lightbulb as SolutionIcon,
  Description as DescriptionIcon,
  TrendingUp as DifficultyIcon,
  Visibility as PublishedIcon,
  VisibilityOff as DraftIcon,
} from '@mui/icons-material';
import { questionService } from '../services/questionService';
import { answerService } from '../services/answerService';
import { ContentRenderer } from '../components/ContentRenderer';
import type { Question, Answer } from '../types';

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
};

// SolutionCard.tsx - обновленная версия компонента
interface SolutionCardProps {
  answer: Answer;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const SolutionCard: React.FC<SolutionCardProps> = ({ answer, index, isExpanded, onToggle }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${NEUTRAL_COLORS.border}`,
        backgroundColor: NEUTRAL_COLORS.surface,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        mb: 2,
        '&:hover': {
          borderColor: alpha(NEUTRAL_COLORS.accent, 0.5),
          boxShadow: `0 4px 20px ${alpha(NEUTRAL_COLORS.accent, 0.08)}`,
        },
      }}
    >
      {/* Заголовок карточки - кликабельная область */}
      <Box
        onClick={onToggle}
        sx={{
          p: { xs: 2.5, md: 3 },
          backgroundColor: NEUTRAL_COLORS.background,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
          },
        }}
      >
        {/* Левая часть с номером и информацией */}
        <Stack direction="row" spacing={2.5} alignItems="center" sx={{ flex: 1 }}>
          {/* Номер решения */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
              color: NEUTRAL_COLORS.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.125rem',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
          >
            {index + 1}
          </Box>

          {/* Информация о решении */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: NEUTRAL_COLORS.textPrimary,
                mb: 0.5,
                fontSize: '1.125rem',
              }}
            >
              Решение {index + 1}
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography
                variant="caption"
                sx={{
                  color: NEUTRAL_COLORS.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: NEUTRAL_COLORS.success,
                    display: 'inline-block',
                  }}
                />
                Актуализация ответа: {new Date(answer.updated_at).toLocaleDateString()}
              </Typography>
              
              {answer.author && (
                <Typography
                  variant="caption"
                  sx={{
                    color: NEUTRAL_COLORS.textSecondary,
                  }}
                >
                  • By {answer.author}
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>

        {/* Правая часть с иконкой и статусом */}
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Статус Verified */}
          {answer.is_verified && (
            <Chip
              label="Verified"
              size="small"
              sx={{
                fontWeight: 600,
                backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                color: NEUTRAL_COLORS.success,
                border: `1px solid ${alpha(NEUTRAL_COLORS.success, 0.2)}`,
                fontSize: '0.75rem',
                height: 24,
              }}
            />
          )}

          {/* Иконка раскрытия */}
          <Box
            sx={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              color: NEUTRAL_COLORS.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ExpandMoreIcon />
          </Box>
        </Stack>
      </Box>

      {/* Контент решения - раскрывающаяся часть */}
      <Box
        sx={{
          maxHeight: isExpanded ? 'none' : 0,
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: NEUTRAL_COLORS.surface,
          visibility: isExpanded ? 'visible' : 'hidden',
        }}
      >
        <Box 
          sx={{ 
            p: { xs: 3, md: 4 },
            opacity: isExpanded ? 1 : 0,
            transform: isExpanded ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: isExpanded ? '0.1s' : '0s',
          }}
        >
          {/* Декоративная полоска сверху */}
          <Box
            sx={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.3),
              mb: 3,
              opacity: isExpanded ? 1 : 0,
              transform: isExpanded ? 'translateX(0)' : 'translateX(-20px)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: isExpanded ? '0.2s' : '0s',
            }}
          />

          {/* Контент решения */}
          <Box
            sx={{
              color: NEUTRAL_COLORS.textPrimary,
              lineHeight: 1.8,
              fontSize: '1.05rem',
              '& > *': {
                mb: 2,
              },
              '& p': {
                mb: 2,
              },
              '& h2, & h3, & h4': {
                color: NEUTRAL_COLORS.textPrimary,
                fontWeight: 700,
                mt: 3,
                mb: 1.5,
              },
              '& code': {
                backgroundColor: alpha(NEUTRAL_COLORS.background, 0.8),
                padding: '2px 6px',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.9em',
              },
              '& pre': {
                backgroundColor: alpha(NEUTRAL_COLORS.background, 0.9),
                padding: 3,
                borderRadius: 2,
                overflow: 'auto',
                // border: `1px solid ${NEUTRAL_COLORS.border}`,
                fontSize: '0.9rem',
                lineHeight: 1.6,
              },
              '& ul, & ol': {
                pl: 3,
                mb: 2,
              },
              '& li': {
                mb: 1,
              },
            }}
          >
            <ContentRenderer blocks={answer.content} />
          </Box>

          {/* Футер с дополнительной информацией */}
          {answer.author && (
            <Box
              sx={{
                mt: 4,
                pt: 3,
                borderTop: `1px dashed ${alpha(NEUTRAL_COLORS.border, 0.5)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                opacity: isExpanded ? 1 : 0,
                transform: isExpanded ? 'translateY(0)' : 'translateY(10px)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: isExpanded ? '0.3s' : '0s',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: NEUTRAL_COLORS.textSecondary,
                  fontSize: '0.875rem',
                  fontStyle: 'italic',
                }}
              >
                Solution provided by {answer.author}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export const QuestionDetailPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSolutions, setExpandedSolutions] = useState<number[]>([0]); // По умолчанию раскрыт первый

  const loadData = useCallback(async () => {
    if (!questionId) return;

    try {
      setIsLoading(true);
      setError(null);
      const questionData = await questionService.getQuestion(questionId);
      setQuestion(questionData);

      try {
        const answersData = await answerService.getAnswers(questionId);
        setAnswers(answersData);
      } catch (answerErr) {
        console.warn('Failed to load answers:', answerErr);
        setAnswers([]);
      }
    } catch (err) {
      console.error('Failed to load question:', err);
      setError('Failed to load question details');
    } finally {
      setIsLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return NEUTRAL_COLORS.success;
      case 'medium':
        return NEUTRAL_COLORS.warning;
      case 'hard':
        return NEUTRAL_COLORS.error;
      default:
        return NEUTRAL_COLORS.secondary;
    }
  };

  const handleSolutionToggle = (index: number) => {
    setExpandedSolutions((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${NEUTRAL_COLORS.background} 0%, ${alpha(
            NEUTRAL_COLORS.background,
            0.8
          )} 100%)`,
        }}
      >
        <CircularProgress size={48} sx={{ color: NEUTRAL_COLORS.accent }} />
      </Box>
    );
  }

  if (error || !question) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/questions')}
          sx={{ mb: 2, color: NEUTRAL_COLORS.accent }}
        >
          Back to Questions
        </Button>
        <Alert
          severity="error"
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(NEUTRAL_COLORS.error, 0.2)}`,
          }}
        >
          {error || 'Question not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${NEUTRAL_COLORS.background} 0%, ${alpha(
          NEUTRAL_COLORS.background,
          0.8
        )} 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Кнопка назад */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/questions')}
          sx={{
            mb: 3,
            color: NEUTRAL_COLORS.accent,
            '&:hover': {
              backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
            },
          }}
          variant="text"
        >
          Назад к вопросам
        </Button>

        {/* Карточка вопроса */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            mb: 4,
            borderRadius: 3,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
            backgroundColor: NEUTRAL_COLORS.surface,
          }}
        >
          <Stack spacing={4}>
            {/* Верхняя часть: статус и сложность */}
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                mb: 3,
                pb: 3,
                borderBottom: `1px solid ${alpha(NEUTRAL_COLORS.border, 0.5)}`,
              }}
            >
              {/* Сложность */}
              <Chip
                icon={<DifficultyIcon />}
                label={question.difficulty}
                size="medium"
                sx={{
                  fontWeight: 700,
                  backgroundColor: alpha(getDifficultyColor(question.difficulty), 0.1),
                  color: getDifficultyColor(question.difficulty),
                  border: `1px solid ${alpha(getDifficultyColor(question.difficulty), 0.3)}`,
                  textTransform: 'capitalize',
                  fontSize: '0.95rem',
                  px: 1,
                }}
              />
              
              {/* Статус публикации */}
              {question.is_published ? (
                <Chip
                  icon={<PublishedIcon />}
                  label="Published"
                  size="medium"
                  sx={{
                    fontWeight: 700,
                    backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                    color: NEUTRAL_COLORS.success,
                    border: `1px solid ${alpha(NEUTRAL_COLORS.success, 0.3)}`,
                    fontSize: '0.95rem',
                    px: 1,
                  }}
                />
              ) : (
                <Chip
                  icon={<DraftIcon />}
                  label="Draft"
                  size="medium"
                  sx={{
                    fontWeight: 700,
                    backgroundColor: alpha(NEUTRAL_COLORS.secondary, 0.1),
                    color: NEUTRAL_COLORS.secondary,
                    border: `1px solid ${alpha(NEUTRAL_COLORS.secondary, 0.3)}`,
                    fontSize: '0.95rem',
                    px: 1,
                  }}
                />
              )}
            </Stack>

            {/* Содержимое вопроса с иконкой слева */}
            <Stack direction="row" spacing={3} alignItems="flex-start">
              {/* Иконка вопроса */}
              <Box sx={{ flexShrink: 0 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                    color: NEUTRAL_COLORS.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 1,
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 28 }} />
                </Box>
              </Box>

              {/* Заголовок и контент вопроса */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    color: NEUTRAL_COLORS.textPrimary,
                    letterSpacing: '-0.025em',
                    mb: 2.5,
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    lineHeight: 1.2,
                  }}
                >
                  {question.title}
                </Typography>

                {/* Контент вопроса */}
                <Box
                  sx={{
                    '& > *': {
                      mb: 2.5,
                    },
                    '& p': {
                      mb: 2.5,
                    },
                  }}
                >
                  <ContentRenderer blocks={question.content} />
                </Box>
              </Box>
            </Stack>
          </Stack>
        </Paper>

        {/* Секция решений */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
            backgroundColor: NEUTRAL_COLORS.surface,
          }}
        >
          <Stack spacing={3}>
            {/* Заголовок секции решений с иконкой слева */}
            <Stack direction="row" spacing={3} alignItems="center">
              {/* Иконка решений */}
              <Box sx={{ flexShrink: 0 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                    color: NEUTRAL_COLORS.success,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SolutionIcon sx={{ fontSize: 28 }} />
                </Box>
              </Box>

              {/* Текст заголовка */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: NEUTRAL_COLORS.textPrimary,
                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                    mb: 1,
                  }}
                >
                  Варианты решения
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: NEUTRAL_COLORS.textSecondary,
                  }}
                >
                  Подробные объяснения и подходы к решению проблемы
                </Typography>
              </Box>
            </Stack>

            {/* Список решений */}
            {answers.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  borderRadius: 2,
                  border: `1px dashed ${NEUTRAL_COLORS.border}`,
                  backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '50%',
                    backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
                    display: 'inline-flex',
                    mb: 2,
                  }}
                >
                  <SolutionIcon
                    sx={{ fontSize: 48, color: NEUTRAL_COLORS.textSecondary }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: NEUTRAL_COLORS.textSecondary,
                    mb: 1,
                  }}
                >
                  No solutions available yet
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: NEUTRAL_COLORS.textSecondary,
                  }}
                >
                  Check back later or contribute a solution
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ ml: { xs: 0, md: 9 } }}>
                {answers.map((answer, index) => (
                  <SolutionCard
                    key={answer.id}
                    answer={answer}
                    index={index}
                    isExpanded={expandedSolutions.includes(index)}
                    onToggle={() => handleSolutionToggle(index)}
                  />
                ))}
              </Box>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};