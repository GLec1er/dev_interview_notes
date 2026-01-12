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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Paper,
  Divider,
  Collapse,
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
  Bolt as BoltIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  RestartAlt as RestartIcon,
  CheckCircle as CheckIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon2,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Psychology as PsychologyIcon,
  School as SchoolIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { questionService } from '../services/questionService';
import { categoryService } from '../services/categoryService';

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
  error: '#E53E3E',
  gradientStart: '#EDF2F7',
  gradientEnd: '#CBD5E0',
  warning: '#D69E2E',
  purple: '#805AD5',
  blue: '#61DAFB',
};

interface Stats {
  questions: number;
  categories: number;
}

interface ApiCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  is_active: boolean;
  question_count: number;
}

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

interface QuickStartModalProps {
  open: boolean;
  onClose: () => void;
}

interface Question {
  id: string;
  title: string;
  content: any[];
  difficulty: 'easy' | 'medium' | 'hard';
  category_name?: string;
}

interface Answer {
  content: any[];
  is_published: boolean;
}

const QuickStartModal: React.FC<QuickStartModalProps> = ({ open, onClose }) => {
  const [step, setStep] = useState<'level' | 'countdown' | 'questions' | 'results'>('level');
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'expert'>('beginner');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getDifficultyByLevel = (level: 'beginner' | 'intermediate' | 'expert') => {
    switch (level) {
      case 'beginner':
        return 'easy';
      case 'intermediate':
        return 'medium';
      case 'expert':
        return 'hard';
      default:
        return 'easy';
    }
  };

  const loadRandomQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const difficulty = getDifficultyByLevel(userLevel);
      
      const allQuestions = await questionService.getQuestions(
        1,
        100,
        true,
        difficulty
      );
      
      if (allQuestions.items.length === 0) {
        throw new Error(`No ${difficulty} questions available`);
      }
      
      const shuffled = [...allQuestions.items].sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, 5).map(q => ({
        id: q.id,
        title: q.title,
        content: q.content || [],
        difficulty: q.difficulty,
        category_name: q.category_name,
      }));
      
      setQuestions(selectedQuestions);
      
      const answersData: Record<string, Answer> = {};
      for (const question of selectedQuestions) {
        try {
          const answerResponse = await questionService.getQuestionAnswers(question.id);
          if (answerResponse && answerResponse.length > 0) {
            const publishedAnswer = answerResponse.find(a => a.is_published);
            if (publishedAnswer) {
              answersData[question.id] = {
                content: publishedAnswer.content || [],
                is_published: true,
              };
            }
          }
        } catch (err) {
          console.error(`Failed to load answer for question ${question.id}:`, err);
        }
      }
      
      setAnswers(answersData);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Failed to load questions:', error);
      setIsLoading(false);
    }
  }, [userLevel]);

  const handleLevelSelect = (level: 'beginner' | 'intermediate' | 'expert') => {
    setUserLevel(level);
    setTimeout(() => {
      setStep('countdown');
      loadRandomQuestions();
    }, 500);
  };

  const handleStartTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      setStep('questions');
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setStep('results');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleToggleTimer = () => {
    if (isTimerRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setStep('results');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStep('level');
    setTimeLeft(600);
    setIsTimerRunning(false);
    setQuestions([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setExpandedQuestions([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleToggleExpand = (questionId: string) => {
    setExpandedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

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

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner':
        return <SchoolIcon />;
      case 'intermediate':
        return <PsychologyIcon />;
      case 'expert':
        return <WorkIcon />;
      default:
        return <SchoolIcon />;
    }
  };

  const getLevelTitle = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Новичок';
      case 'intermediate':
        return 'Опытный';
      case 'expert':
        return 'Профессионал';
      default:
        return 'Новичок';
    }
  };

  const getLevelDescription = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Легкие вопросы для тех, кто только начинает';
      case 'intermediate':
        return 'Средние вопросы для опытных разработчиков';
      case 'expert':
        return 'Сложные вопросы для профессионалов';
      default:
        return '';
    }
  };

  const renderQuestionContent = (content: any[]) => {
    if (!content || content.length === 0) {
      return (
        <Typography variant="body2" color={NEUTRAL_COLORS.textSecondary}>
          Содержимое вопроса отсутствует
        </Typography>
      );
    }

    return content.map((block, index) => {
      switch (block.type) {
        case 'heading':
          return (
            <Typography key={index} variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {block.data?.text}
            </Typography>
          );
        case 'paragraph':
          return (
            <Typography key={index} variant="body1" paragraph>
              {block.data?.text}
            </Typography>
          );
        case 'code':
          return (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 2,
                my: 1,
                bgcolor: alpha(NEUTRAL_COLORS.textPrimary, 0.05),
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
              }}
            >
              <Typography variant="caption" color={NEUTRAL_COLORS.textSecondary} display="block" mb={0.5}>
                {block.data?.language || 'code'}
              </Typography>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {block.data?.code || block.data?.text || block.content}
              </pre>
            </Paper>
          );
        case 'info':
          return (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 2,
                my: 1,
                bgcolor: alpha(NEUTRAL_COLORS.accent, 0.1),
                borderLeft: `4px solid ${NEUTRAL_COLORS.accent}`,
                borderRadius: '0 8px 8px 0',
              }}
            >
              <Typography variant="body2">
                {block.data?.text || block.content}
              </Typography>
            </Paper>
          );
        default:
          return null;
      }
    });
  };

  const renderAnswerContent = (content: any[]) => {
    if (!content || content.length === 0) {
      return (
        <Typography variant="body2" color={NEUTRAL_COLORS.textSecondary} fontStyle="italic">
          Ответ не найден
        </Typography>
      );
    }

    return content.map((block, index) => {
      switch (block.type) {
        case 'heading':
          return (
            <Typography key={index} variant="h6" gutterBottom sx={{ fontWeight: 600, color: NEUTRAL_COLORS.success }}>
              {block.data?.text}
            </Typography>
          );
        case 'paragraph':
          return (
            <Typography key={index} variant="body1" paragraph>
              {block.data?.text}
            </Typography>
          );
        case 'code':
          return (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 2,
                my: 1,
                bgcolor: alpha(NEUTRAL_COLORS.success, 0.1),
                border: `1px solid ${alpha(NEUTRAL_COLORS.success, 0.2)}`,
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
              }}
            >
              <Typography variant="caption" color={NEUTRAL_COLORS.success} display="block" mb={0.5}>
                {block.data?.language || 'code'}
              </Typography>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {block.data?.code || block.data?.text || block.content}
              </pre>
            </Paper>
          );
        default:
          return null;
      }
    });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: NEUTRAL_COLORS.surface,
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: NEUTRAL_COLORS.accent,
        color: 'white',
        py: 3,
        position: 'relative',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BoltIcon />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {step === 'level' && 'Быстрый старт'}
              {step === 'countdown' && 'Приготовьтесь!'}
              {step === 'questions' && 'Вопросы'}
              {step === 'results' && 'Результаты'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {step !== 'results' && (
          <LinearProgress 
            variant="determinate" 
            value={
              step === 'level' ? 25 :
              step === 'countdown' ? 50 :
              step === 'questions' ? 75 : 100
            }
            sx={{ 
              height: 4,
              '& .MuiLinearProgress-bar': {
                bgcolor: NEUTRAL_COLORS.accent,
              }
            }}
          />
        )}

        {step === 'level' && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom align="center" sx={{ mb: 4 }}>
              Выберите ваш уровень, чтобы получить подходящие вопросы
            </Typography>
            
            <Grid container spacing={3}>
              {['beginner', 'intermediate', 'expert'].map((level) => (
                <Grid item xs={12} sm={4} key={level}>
                  <Card
                    elevation={userLevel === level ? 4 : 0}
                    sx={{
                      cursor: 'pointer',
                      border: `2px solid ${userLevel === level ? NEUTRAL_COLORS.accent : NEUTRAL_COLORS.border}`,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: NEUTRAL_COLORS.accent,
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => handleLevelSelect(level as any)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Box sx={{ 
                        mb: 2,
                        color: userLevel === level ? NEUTRAL_COLORS.accent : NEUTRAL_COLORS.textSecondary,
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: '50%',
                        bgcolor: userLevel === level ? alpha(NEUTRAL_COLORS.accent, 0.1) : alpha(NEUTRAL_COLORS.border, 0.3),
                      }}>
                        {getLevelIcon(level)}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {getLevelTitle(level)}
                      </Typography>
                      <Typography variant="body2" color={NEUTRAL_COLORS.textSecondary} sx={{ mb: 2 }}>
                        {getLevelDescription(level)}
                      </Typography>
                      <Chip
                        label={getDifficultyByLevel(level as any).toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: alpha(getDifficultyColor(getDifficultyByLevel(level as any)), 0.1),
                          color: getDifficultyColor(getDifficultyByLevel(level as any)),
                          fontWeight: 600,
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => handleLevelSelect(userLevel)}
                disabled={!userLevel}
                sx={{
                  px: 6,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                }}
              >
                Продолжить
              </Button>
            </Box>
          </Box>
        )}

        {step === 'countdown' && (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            {isLoading ? (
              <>
                <CircularProgress size={80} sx={{ mb: 4, color: NEUTRAL_COLORS.accent }} />
                <Typography variant="h6" gutterBottom>
                  Загружаем вопросы...
                </Typography>
                <Typography variant="body2" color={NEUTRAL_COLORS.textSecondary}>
                  Подбираем идеальные вопросы для вашего уровня
                </Typography>
              </>
            ) : (
              <>
                <Box sx={{ 
                  width: 200, 
                  height: 200, 
                  mx: 'auto',
                  mb: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  bgcolor: alpha(NEUTRAL_COLORS.accent, 0.1),
                  position: 'relative',
                }}>
                  <Box sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    border: `4px solid ${NEUTRAL_COLORS.accent}`,
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)', opacity: 1 },
                      '50%': { transform: 'scale(1.1)', opacity: 0.7 },
                      '100%': { transform: 'scale(1)', opacity: 1 },
                    }
                  }} />
                  <TimerIcon sx={{ fontSize: 80, color: NEUTRAL_COLORS.accent }} />
                </Box>
                
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                  Готовы?
                </Typography>
                <Typography variant="body1" color={NEUTRAL_COLORS.textSecondary} sx={{ mb: 4 }}>
                  У вас есть 10 минут на 5 вопросов уровня {getLevelTitle(userLevel)}
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayIcon />}
                  onClick={handleStartTimer}
                  sx={{
                    px: 6,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    bgcolor: NEUTRAL_COLORS.success,
                    '&:hover': {
                      bgcolor: alpha(NEUTRAL_COLORS.success, 0.9),
                    }
                  }}
                >
                  Начать тест
                </Button>
              </>
            )}
          </Box>
        )}

        {step === 'questions' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: alpha(NEUTRAL_COLORS.accent, 0.05),
                borderBottom: `1px solid ${NEUTRAL_COLORS.border}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton onClick={handleToggleTimer} size="small">
                    {isTimerRunning ? <PauseIcon /> : <PlayIcon />}
                  </IconButton>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimerIcon sx={{ color: NEUTRAL_COLORS.accent }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: NEUTRAL_COLORS.accent }}>
                      {formatTime(timeLeft)}
                    </Typography>
                  </Box>
                  <Chip
                    label={`Вопрос ${currentQuestionIndex + 1} из ${questions.length}`}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<RestartIcon />}
                  onClick={handleReset}
                  size="small"
                >
                  Сбросить
                </Button>
              </Box>
            </Paper>

            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : questions.length > 0 && currentQuestionIndex < questions.length ? (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <Chip
                        label={questions[currentQuestionIndex].difficulty.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: alpha(getDifficultyColor(questions[currentQuestionIndex].difficulty), 0.1),
                          color: getDifficultyColor(questions[currentQuestionIndex].difficulty),
                          fontWeight: 600,
                        }}
                      />
                      {questions[currentQuestionIndex].category_name && (
                        <Chip
                          icon={<CategoryIcon />}
                          label={questions[currentQuestionIndex].category_name}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      )}
                    </Stack>
                    
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {questions[currentQuestionIndex].title}
                    </Typography>
                    
                    {renderQuestionContent(questions[currentQuestionIndex].content)}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 2, borderTop: `1px solid ${NEUTRAL_COLORS.border}` }}>
                    <Button
                      startIcon={<ChevronLeftIcon />}
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      Назад
                    </Button>
                    
                    {currentQuestionIndex === questions.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={() => setStep('results')}
                        sx={{ fontWeight: 600 }}
                      >
                        Завершить тест
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        endIcon={<ChevronRightIcon2 />}
                        onClick={handleNextQuestion}
                      >
                        Следующий вопрос
                      </Button>
                    )}
                  </Box>
                </>
              ) : (
                <Typography variant="body1" color={NEUTRAL_COLORS.textSecondary} align="center">
                  Вопросы не найдены
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {step === 'results' && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 4, p: 3, bgcolor: alpha(NEUTRAL_COLORS.success, 0.1), borderRadius: 2 }}>
              <CheckIcon sx={{ fontSize: 60, color: NEUTRAL_COLORS.success, mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                Тест завершен!
              </Typography>
              <Typography variant="body1" color={NEUTRAL_COLORS.textSecondary}>
                Вы ответили на все вопросы за {formatTime(600 - timeLeft)}
              </Typography>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Вопросы и ответы для проверки:
            </Typography>

            <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
              {questions.map((question, index) => (
                <Paper
                  key={question.id}
                  elevation={0}
                  sx={{
                    mb: 2,
                    border: `1px solid ${NEUTRAL_COLORS.border}`,
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha(NEUTRAL_COLORS.accent, 0.05),
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onClick={() => handleToggleExpand(question.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Вопрос {index + 1}: {question.title}
                      </Typography>
                      <Chip
                        label={question.difficulty.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: alpha(getDifficultyColor(question.difficulty), 0.1),
                          color: getDifficultyColor(question.difficulty),
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    {expandedQuestions.includes(question.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>

                  <Collapse in={expandedQuestions.includes(question.id)}>
                    <Box sx={{ p: 3 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: NEUTRAL_COLORS.textSecondary }}>
                        Вопрос:
                      </Typography>
                      {renderQuestionContent(question.content)}
                      
                      <Divider sx={{ my: 3 }} />
                      
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: NEUTRAL_COLORS.success }}>
                        Ответ:
                      </Typography>
                      {answers[question.id] ? (
                        renderAnswerContent(answers[question.id].content)
                      ) : (
                        <Typography variant="body2" color={NEUTRAL_COLORS.textSecondary} fontStyle="italic">
                          Ответ не найден в базе данных
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </Paper>
              ))}
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{ fontWeight: 600 }}
              >
                Пройти еще раз
              </Button>
              <Button
                variant="contained"
                onClick={onClose}
                sx={{ fontWeight: 600 }}
              >
                Закрыть
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>

      {step !== 'results' && step !== 'countdown' && (
        <DialogActions sx={{ p: 2, bgcolor: alpha(NEUTRAL_COLORS.background, 0.5) }}>
          <Button onClick={onClose}>
            Отмена
          </Button>
          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" color={NEUTRAL_COLORS.textSecondary}>
            Быстрый старт • 5 вопросов • 10 минут
          </Typography>
        </DialogActions>
      )}
    </Dialog>
  );
};

const QuickStartCard = memo(() => {
  const [quickStartOpen, setQuickStartOpen] = useState(false);
  
  return (
    <>
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
            cursor: 'pointer',
          }}
          onClick={() => setQuickStartOpen(true)}
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
                onClick={() => setQuickStartOpen(true)}
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

      <QuickStartModal
        open={quickStartOpen}
        onClose={() => setQuickStartOpen(false)}
      />
    </>
  );
});

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

  const scrollToFeatures = useCallback(() => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [questionsData, categoriesData] = await Promise.all([
        questionService.getQuestions(1, 1, true),
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

  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const categoriesData = await categoryService.getCategories(1, 10, true);
      
      const sortedCategories = (categoriesData.items as ApiCategory[])
        .filter(cat => cat.is_active)
        .sort((a, b) => b.question_count - a.question_count)
        .slice(0, 5);
      
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
                          onClick={() => handleNavigation('/admin')}
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

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 6 },
          px: { xs: 2, sm: 3 },
          textAlign: 'center',
        }}>
          <Fade in timeout={600}>
            <Box sx={{ mb: 4 }}>
              <Chip 
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

          {isAuthenticated && (
            <Box sx={{ mb: 8 }}>
              <QuickStartCard />
            </Box>
          )}

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

      <ScrollToTop />
    </Box>
  );
};