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
  useTheme as useMuiTheme,
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
  RestartAlt as RestartIcon,
  CheckCircle as CheckIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Psychology as PsychologyIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme as useThemeContext } from '../context/ThemeContext';
import { questionService } from '../services/questionService';
import { categoryService } from '../services/categoryService';
import { answerService } from '../services/answerService';
import type { User } from '../types';
import { userService } from '../services/userService';
import { ContentRenderer } from '../components/ContentRenderer';
import { ThemeToggle } from '../components/ThemeToggle';

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
    'javascript': GLASS_COLORS.warning,
    'react': GLASS_COLORS.blue,
    'typescript': GLASS_COLORS.accent,
    'python': 'rgba(48, 105, 152, 0.8)',
    'java': 'rgba(0, 115, 150, 0.8)',
    'sql': GLASS_COLORS.warning,
    'system design': GLASS_COLORS.success,
    'algorithms': GLASS_COLORS.purple,
    'data structures': 'rgba(228, 77, 38, 0.8)',
    'behavioral': GLASS_COLORS.error,
    'html': 'rgba(227, 79, 38, 0.8)',
    'css': 'rgba(21, 114, 182, 0.8)',
    'node.js': 'rgba(51, 153, 51, 0.8)',
    'docker': 'rgba(36, 150, 237, 0.8)',
    'aws': GLASS_COLORS.warning,
    'git': 'rgba(240, 80, 50, 0.8)',
  };

  const lowerName = categoryName.toLowerCase();
  for (const [key, color] of Object.entries(colorMap)) {
    if (lowerName.includes(key)) {
      return color;
    }
  }

  const colors = [
    GLASS_COLORS.accent,
    GLASS_COLORS.success,
    GLASS_COLORS.warning,
    GLASS_COLORS.error,
    GLASS_COLORS.purple,
    GLASS_COLORS.blue,
  ];
  
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const GlassStatCard = memo(({ title, value, color, icon, onClick }: { 
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
        minWidth: '230px',
        background: GLASS_COLORS.surface,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: GLASS_COLORS.border,
        borderRadius: 3,
        transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
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
          top: -10,
          left: -10,
          right: -10,
          bottom: -10,
          background: `radial-gradient(circle at 30% 30%, ${color} 0%, transparent 70%)`,
          opacity: 0.1,
          zIndex: -1,
          filter: 'blur(20px)',
        },
        '&:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: `0 16px 48px ${alpha(color, 0.2)}, 0 0 0 2px ${GLASS_COLORS.borderGlow} inset`,
          borderColor: GLASS_COLORS.borderGlow,
          '&::before': {
            opacity: 1,
          },
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ 
        p: 3, 
        textAlign: 'center',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <Box sx={{ 
          mb: 2, 
          color: color,
          display: 'inline-flex',
          p: 1.5,
          borderRadius: '50%',
          backgroundColor: alpha(color, 0.15),
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: alpha(color, 0.3),
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1) rotate(5deg)',
            backgroundColor: alpha(color, 0.25),
          }
        }}>
          {icon}
        </Box>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700,
            color: GLASS_COLORS.textPrimary,
            mb: 1,
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: { xs: '2rem', md: '2.5rem' },
            lineHeight: 1,
            letterSpacing: '-0.02em',
            textShadow: '0 2px 10px rgba(255,255,255,0.5)',
          }}
        >
          {value.toLocaleString()}
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 500, 
            fontSize: '0.95rem',
            textAlign: 'center',
            width: '100%',
            color: GLASS_COLORS.textSecondary,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  </Grow>
));

const GlassCategoryCard = memo(({ category, onClick }: {
  category: ApiCategory;
  onClick: () => void;
}) => {
  const color = getCategoryColor(category.name);
  
  return (
    <Grow in timeout={1000}>
      <Card
        sx={{
          height: '100%',
          minWidth: 180,
          background: GLASS_COLORS.surface,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid',
          borderColor: GLASS_COLORS.border,
          borderRadius: 3,
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
            background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 70%)`,
            opacity: 0,
            zIndex: -1,
            filter: 'blur(30px)',
            transition: 'opacity 0.4s ease',
          },
          '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: `0 16px 48px ${alpha(color, 0.2)}`,
            borderColor: GLASS_COLORS.borderGlow,
            '&::before': {
              opacity: 1,
            },
            '&::after': {
              opacity: 0.3,
            },
          }
        }}
      >
        <CardActionArea onClick={onClick} sx={{ height: '100%', p: 2 }}>
          <CardContent sx={{ p: 0, textAlign: 'center' }}>
            <Box sx={{ 
              mb: 2,
              display: 'inline-flex',
              p: 2,
              borderRadius: '16px',
              backgroundColor: alpha(color, 0.15),
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: alpha(color, 0.3),
              color: color,
              transition: 'all 0.3s ease',
            }}>
              <CategoryIcon fontSize="large" />
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: GLASS_COLORS.textPrimary,
                mb: 1,
                textTransform: 'capitalize',
                letterSpacing: '-0.01em',
              }}
            >
              {category.name}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 0.5,
                color: GLASS_COLORS.textSecondary,
              }}
            >
              <QuestionsIcon fontSize="small" sx={{ opacity: 0.7 }} />
              {category.question_count} вопросов
            </Typography>
            {!category.is_active && (
              <Chip
                label="Неактивно"
                size="small"
                sx={{
                  mt: 1,
                  backgroundColor: alpha(GLASS_COLORS.error, 0.15),
                  color: GLASS_COLORS.error,
                  fontSize: '0.7rem',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha(GLASS_COLORS.error, 0.3),
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
  isGuestMode?: boolean;
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

const GlassQuickStartModal: React.FC<QuickStartModalProps> = ({ open, onClose, isGuestMode = false }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'level' | 'countdown' | 'questions' | 'results'>('level');
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'expert' | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(isGuestMode ? 300 : 600);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const getDifficultyByLevel = (level: 'beginner' | 'intermediate' | 'expert'): string => {
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

  const loadRandomQuestions = useCallback(async (level: 'beginner' | 'intermediate' | 'expert') => {
  try {
    setIsLoading(true);
    const difficulty = getDifficultyByLevel(level);
    
    if (isGuestMode) {
      const allStaticQuestions: Record<string, Question[]> = {
        easy: [
          {
            id: 'python-easy-1',
            title: 'В чем разница между списком (list) и кортежем (tuple) в Python?',
            content: [
              {
                type: 'paragraph',
                data: { 
                  text: 'Опишите основные различия между списками и кортежами в Python. Когда следует использовать каждый из них?' 
                }
              }
            ],
            difficulty: 'easy',
            category_name: 'Python'
          },
          {
            id: 'python-easy-2',
            title: 'Что такое список (list comprehension) и как его использовать?',
            content: [
              {
                type: 'paragraph',
                data: { 
                  text: 'Объясните концепцию list comprehension в Python и приведите пример создания нового списка с его помощью.' 
                }
              }
            ],
            difficulty: 'easy',
            category_name: 'Python'
          },
          {
            id: 'python-easy-3',
            title: 'Как работает оператор "with" в Python?',
            content: [
              {
                type: 'paragraph',
                data: { 
                  text: 'Что такое контекстные менеджеры в Python и как оператор "with" помогает в работе с ресурсами?' 
                }
              }
            ],
            difficulty: 'easy',
            category_name: 'Python'
          }
        ],
        
        medium: [
          {
            id: 'python-medium-1',
            title: 'Что такое декораторы в Python и как они работают?',
            content: [
              {
                type: 'paragraph',
                data: { 
                  text: 'Объясните концепцию декораторов в Python. Как создать собственный декоратор и для чего они используются?' 
                }
              }
            ],
            difficulty: 'medium',
            category_name: 'Python'
          },
          {
            id: 'python-medium-2',
            title: 'В чем разница между @staticmethod, @classmethod и обычными методами?',
            content: [
              {
                type: 'paragraph',
                data: { 
                  text: 'Опишите различия между статическими методами, методами класса и обычными методами в классах Python.' 
                }
              }
            ],
            difficulty: 'medium',
            category_name: 'Python'
          },
          {
            id: 'python-medium-3',
            title: 'Что такое GIL (Global Interpreter Lock) в Python?',
            content: [
              {
                type: 'paragraph',
                data: { 
                  text: 'Объясните, что такое Global Interpreter Lock, как он влияет на многопоточность в Python и какие есть способы обхода его ограничений.' 
                }
              }
            ],
            difficulty: 'medium',
            category_name: 'Python'
          }
        ],
        
        hard: [
          {
            id: 'python-hard-1',
            title: 'Как работает garbage collection в Python?',
            content: [
              {
                type: 'paragraph',
                data: { 
                  text: 'Опишите механизм сборки мусора в Python. Как работает алгоритм подсчета ссылок и циклический сборщик мусора?' 
                }
              }
            ],
            difficulty: 'hard',
            category_name: 'Python'
          },
          {
            id: 'python-hard-2',
            title: 'Что такое метаклассы в Python и когда их использовать?',
            content: [
              {
                type: 'paragraph',
                data: { 
                  text: 'Объясните концепцию метаклассов в Python. Как они работают и в каких реальных сценариях их применение оправдано?' 
                }
              }
            ],
            difficulty: 'hard',
            category_name: 'Python'
          },
          {
            id: 'python-hard-3',
            title: 'Как реализованы словари (dict) в Python на низком уровне?',
            content: [
              {
                type: 'paragraph',
                data: { 
                  text: 'Опишите внутреннюю реализацию словарей в CPython. Как работает хеширование, разрешение коллизий и почему словари так эффективны?' 
                }
              }
            ],
            difficulty: 'hard',
            category_name: 'Python'
          }
        ]
      };
      
      const questionsForLevel = allStaticQuestions[difficulty] || [];
      setQuestions(questionsForLevel);
      
      const allStaticAnswers: Record<string, Answer> = {
        'python-easy-1': {
          content: [
            {
              type: 'paragraph',
              data: { 
                text: 'Основные различия между списком и кортежем в Python:' 
              }
            },
            {
              type: 'paragraph',
              data: { 
                text: '1. **Мутабельность**: Списки изменяемы (mutable), кортежи неизменяемы (immutable)' 
              }
            },
            {
              type: 'paragraph',
              data: { 
                text: '2. **Синтаксис**: Списки используют квадратные скобки [], кортежи - круглые ()' 
              }
            },
            {
              type: 'code',
              data: {
                language: 'python',
                code: `# Список (изменяемый)
my_list = [1, 2, 3]
my_list[0] = 10  # ОК

# Кортеж (неизменяемый)
my_tuple = (1, 2, 3)
# my_tuple[0] = 10  # Ошибка!` 
              }
            }
          ],
          is_published: true
        },

        'python-easy-2': {
          content: [
            {
              type: 'paragraph',
              data: { 
                text: 'List comprehension - это лаконичный способ создания списков в Python.' 
              }
            },
            {
              type: 'code',
              data: {
                language: 'python',
                code: `# Обычный способ
squares = []
for x in range(10):
    squares.append(x**2)

# List comprehension
squares = [x**2 for x in range(10)]

# С условием
even_squares = [x**2 for x in range(10) if x % 2 == 0]

# Вложенные циклы
pairs = [(x, y) for x in range(3) for y in range(3)]` 
              }
            }
          ],
          is_published: true
        },

        'python-easy-3': {
          content: [
            {
              type: 'paragraph',
              data: { 
                text: 'Оператор "with" используется для работы с контекстными менеджерами, которые обеспечивают корректное управление ресурсами.' 
              }
            },
            {
              type: 'code',
              data: {
                language: 'python',
                code: `# Пример с файлом
with open('file.txt', 'r') as f:
    content = f.read()
# Файл автоматически закрывается

# Эквивалент без "with"
f = open('file.txt', 'r')
try:
    content = f.read()
finally:
    f.close()` 
              }
            }
          ],
          is_published: true
        },

        'python-medium-1': {
          content: [
            {
              type: 'paragraph',
              data: { 
                text: 'Декораторы - это функции, которые принимают другую функцию и расширяют ее поведение без изменения исходного кода.' 
              }
            },
            {
              type: 'code',
              data: {
                language: 'python',
                code: `# Простой декоратор
def timer_decorator(func):
    def wrapper(*args, **kwargs):
        import time
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"Функция {func.__name__} выполнена за {end-start:.2f} сек")
        return result
    return wrapper

@timer_decorator
def slow_function():
    import time
    time.sleep(1)
    return "Готово"

# Использование с синтаксическим сахаром
slow_function()` 
              }
            }
          ],
          is_published: true
        },

        'python-medium-2': {
          content: [
            {
              type: 'paragraph',
              data: { 
                text: 'Различия между типами методов в классах Python:' 
              }
            },
            {
              type: 'code',
              data: {
                language: 'python',
                code: `class MyClass:
    def instance_method(self):
        # Работает с экземпляром
        return f"instance: {self}"
    
    @classmethod
    def class_method(cls):
        # Работает с классом, а не экземпляром
        return f"class: {cls}"
    
    @staticmethod
    def static_method():
        # Не получает ни self, ни cls
        return "static method"

# Использование
obj = MyClass()
obj.instance_method()  # ОК
MyClass.class_method()  # ОК
MyClass.static_method()  # ОК` 
              }
            }
          ],
          is_published: true
        },

        'python-medium-3': {
          content: [
            {
              type: 'paragraph',
              data: { 
                text: 'GIL (Global Interpreter Lock) - это мьютекс, который защищает доступ к объектам Python, предотвращая одновременное выполнение байткода несколькими нативными потоками.' 
              }
            },
            {
              type: 'paragraph',
              data: { 
                text: '**Влияние на многопоточность:**' 
              }
            },
            {
              type: 'paragraph',
              data: { 
                text: '1. В CPU-bound задачах многопоточность не дает прироста производительности' 
              }
            },
            {
              type: 'paragraph',
              data: { 
                text: '2. В IO-bound задачах многопоточность все еще эффективна' 
              }
            },
            {
              type: 'code',
              data: {
                language: 'python',
                code: `# Способы обхода GIL:
# 1. Мультипроцессинг
from multiprocessing import Pool

# 2. Использование C-расширений (numpy, pandas)
# 3. Использование asyncio для IO-bound задач
# 4. Использование PyPy или других интерпретаторов` 
              }
            }
          ],
          is_published: true
        },

        'python-hard-1': {
          content: [
            {
              type: 'paragraph',
              data: { 
                text: 'В Python используется комбинированный подход к сборке мусора:' 
              }
            },
            {
              type: 'paragraph',
              data: { 
                text: '1. **Reference counting (подсчет ссылок)**: Основной механизм, работает в реальном времени' 
              }
            },
            {
              type: 'code',
              data: {
                language: 'python',
                code: `import sys

x = []
print(sys.getrefcount(x))  # Количество ссылок

y = x  # Еще одна ссылка
print(sys.getrefcount(x))  # Увеличится на 1` 
              }
            },
            {
              type: 'paragraph',
              data: { 
                text: '2. **Generational garbage collector (циклический сборщик)**: Обнаруживает и удаляет циклические ссылки' 
              }
            }
          ],
          is_published: true
        },

        'python-hard-2': {
          content: [
            {
              type: 'paragraph',
              data: { 
                text: 'Метаклассы - это "классы классов", которые определяют поведение других классов.' 
              }
            },
            {
              type: 'code',
              data: {
                language: 'python',
                code: `# Создание метакласса
class SingletonMeta(type):
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Singleton(metaclass=SingletonMeta):
    pass

# Реальные сценарии использования:
# 1. Регистрация классов
# 2. Валидация атрибутов
# 3. ORM (как в Django)
# 4. Создание API` 
              }
            }
          ],
          is_published: true
        },

        'python-hard-3': {
          content: [
            {
              type: 'paragraph',
              data: { 
                text: 'Словари в CPython реализованы как хеш-таблицы:' 
              }
            },
            {
              type: 'code',
              data: {
                language: 'python',
                code: `# Внутренняя структура словаря (упрощенно)
# До Python 3.6: массив записей
# С Python 3.6: компактное представление:
# - Индексированный массив entries (хранит hash, key, value)
# - Массив индексов (хранит индексы в entries)

# Хеширование
print(hash("hello"))  # Хеш-значение ключа

# Разрешение коллизий: открытая адресация
# При коллизии ищется следующий свободный слот

# Оптимизации:
# 1. Быстрые lookups (в среднем O(1))
# 2. Компактное хранение с Python 3.6+
# 3. Сохранение порядка вставки с Python 3.7+` 
              }
            }
          ],
          is_published: true
        }
      };
      
      const filteredAnswers: Record<string, Answer> = {};
      questionsForLevel.forEach(question => {
        if (allStaticAnswers[question.id]) {
          filteredAnswers[question.id] = allStaticAnswers[question.id];
        }
      });
      
      setAnswers(filteredAnswers);
      setIsLoading(false);
      return;
    }
    
    const allQuestions = await questionService.getQuestions(
      1,
      100,
      true,
      difficulty,
      undefined,
      undefined,
      undefined,
      true,
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
    }));
    
    setQuestions(selectedQuestions);
    
    const answersData: Record<string, Answer> = {};
    for (const question of selectedQuestions) {
      try {
        const answerResponse = await answerService.getAnswers(question.id);
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
}, [isGuestMode]);

  const handleLevelSelect = (level: 'beginner' | 'intermediate' | 'expert') => {
    setUserLevel(level);
  };

  const handleContinue = () => {
    if (userLevel) {
      setStep('countdown');
      loadRandomQuestions(userLevel);
    }
  };

  const handleStartTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      setStep('questions');
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setIsTimerRunning(false);
            setStep('results');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleReset = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStep('level');
    setUserLevel(null);
    setTimeLeft(isGuestMode ? 300 : 600);
    setIsTimerRunning(false);
    setQuestions([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setExpandedQuestions([]);
  };

  const handleCloseModal = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStep('level');
    setUserLevel(null);
    setTimeLeft(isGuestMode ? 300 : 600);
    setIsTimerRunning(false);
    setQuestions([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setExpandedQuestions([]);
    onClose();
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
        return GLASS_COLORS.success;
      case 'medium':
        return GLASS_COLORS.warning;
      case 'hard':
        return GLASS_COLORS.error;
      default:
        return GLASS_COLORS.secondary;
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

  const renderQuestionContent = (content: any[]) => {
    if (!content || content.length === 0) {
      return (
        <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
          Содержимое вопроса отсутствует
        </Typography>
      );
    }

    return (
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
        <ContentRenderer 
          blocks={content}
        />
      </Box>
    );
  };

  const renderAnswerContent = (content: any[]) => {
    if (!content || content.length === 0) {
      return (
        <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary, fontStyle: 'italic' }}>
          {isGuestMode ? 'Зарегистрируйтесь, чтобы увидеть полный ответ' : 'Ответ не найден'}
        </Typography>
      );
    }

    return (
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
        <ContentRenderer 
          blocks={content}
        />
      </Box>
    );
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!open) {
      handleReset();
    }
  }, [open]);

  const handleCardClick = (level: 'beginner' | 'intermediate' | 'expert') => {
    handleLevelSelect(level);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      maxWidth="md"
      fullWidth
      fullScreen={window.innerWidth < 600}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 4 },
          overflow: 'hidden',
          background: GLASS_COLORS.surfaceDark,
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid',
          borderColor: GLASS_COLORS.border,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
          minHeight: { xs: '100vh', sm: 'auto' },
          maxHeight: { xs: '100vh', sm: '90vh' },
          m: 0,
        }
      }}
    >
      <DialogTitle sx={{ 
        background: alpha(GLASS_COLORS.primary, 0.9),
        backdropFilter: 'blur(20px)',
        color: 'white',
        py: { xs: 2, sm: 3 },
        position: 'relative',
        borderBottom: '1px solid',
        borderColor: alpha('#FFFFFF', 0.2),
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: 1 
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, sm: 2 },
            flexWrap: 'wrap'
          }}>
            <BoltIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />
            <Typography variant="h5" sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.125rem', sm: '1.5rem' },
              letterSpacing: '-0.02em',
            }}>
              {step === 'level' && (isGuestMode ? 'Демо-режим' : 'Быстрый старт')}
              {step === 'countdown' && 'Приготовьтесь!'}
              {step === 'questions' && 'Вопросы'}
              {step === 'results' && 'Результаты'}
            </Typography>
            {isGuestMode && (
              <Chip 
                label="Гостевой режим" 
                size="small" 
                sx={{ 
                  backgroundColor: alpha('#FFFFFF', 0.2),
                  color: 'white',
                  fontWeight: 500,
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha('#FFFFFF', 0.3),
                }} 
              />
            )}
          </Box>
          <IconButton 
            onClick={handleCloseModal} 
            sx={{ 
              color: 'white',
              ml: 'auto',
              '&:hover': {
                backgroundColor: alpha('#FFFFFF', 0.1),
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ 
        p: 0,
        height: { xs: 'calc(100vh - 64px)', sm: 'auto' }
      }}>
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
              backgroundColor: alpha('#FFFFFF', 0.2),
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${GLASS_COLORS.primary}, ${GLASS_COLORS.secondary})`,
              }
            }}
          />
        )}

        {step === 'level' && (
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h6" gutterBottom align="center" sx={{ 
              mb: { xs: 3, sm: 4 }, 
              color: GLASS_COLORS.textPrimary,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 500,
              letterSpacing: '-0.01em',
            }}>
              {isGuestMode 
                ? 'Попробуйте демо-режим. Полный доступ — после регистрации'
                : 'Выберите ваш уровень, чтобы получить подходящие вопросы'}
            </Typography>
            
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} justifyContent="center">
              {(['beginner', 'intermediate', 'expert'] as const).map((level) => (
                <Grid item xs={12} sm={6} md={4} key={level}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Card
                      elevation={0}
                      sx={{
                        cursor: 'pointer',
                        background: GLASS_COLORS.surface,
                        backdropFilter: 'blur(20px)',
                        border: '2px solid',
                        borderColor: userLevel === level ? GLASS_COLORS.primary : GLASS_COLORS.border,
                        borderRadius: 3,
                        transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
                        width: '100%',
                        maxWidth: { xs: '280px', sm: '300px' },
                        minWidth: { xs: '180px', sm: '200px' },
                        display: 'flex',
                        flexDirection: 'column',
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
                        },
                        '&:hover': {
                          transform: 'translateY(-4px) scale(1.02)',
                          borderColor: GLASS_COLORS.primary,
                          boxShadow: `0 16px 32px ${alpha(GLASS_COLORS.primary, 0.2)}`,
                          '&::before': {
                            opacity: 1,
                          },
                        },
                      }}
                      onClick={() => handleCardClick(level)}
                    >
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        p: { xs: 2, sm: 3 },
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        minHeight: { xs: '220px', sm: '250px' },
                      }}>
                        <Box>
                          <Box sx={{ 
                            mb: { xs: 1.5, sm: 2 },
                            color: userLevel === level ? GLASS_COLORS.primary : GLASS_COLORS.textSecondary,
                            display: 'inline-flex',
                            p: { xs: 1.5, sm: 2 },
                            borderRadius: '50%',
                            backgroundColor: alpha(userLevel === level ? GLASS_COLORS.primary : GLASS_COLORS.border, 0.15),
                            backdropFilter: 'blur(10px)',
                            border: '1px solid',
                            borderColor: alpha(userLevel === level ? GLASS_COLORS.primary : GLASS_COLORS.border, 0.3),
                          }}>
                            {React.cloneElement(getLevelIcon(level), { 
                              sx: { fontSize: { xs: 28, sm: 32 } } 
                            })}
                          </Box>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600, 
                              mb: 1, 
                              color: GLASS_COLORS.textPrimary,
                              minHeight: { xs: '50px', sm: '60px' },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: { xs: '1rem', sm: '1.125rem' },
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {getLevelTitle(level)}
                          </Typography>
                        </Box>
                        
                        <Chip
                          label={getDifficultyByLevel(level).toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: alpha(getDifficultyColor(getDifficultyByLevel(level)), 0.15),
                            color: getDifficultyColor(getDifficultyByLevel(level)),
                            fontWeight: 500,
                            minWidth: '50px',
                            justifyContent: 'center',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            backdropFilter: 'blur(10px)',
                            border: '1px solid',
                            borderColor: alpha(getDifficultyColor(getDifficultyByLevel(level)), 0.3),
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: { xs: 3, sm: 4 }, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleContinue}
                disabled={!userLevel}
                sx={{
                  px: { xs: 4, sm: 6 },
                  py: { xs: 1, sm: 1.5 },
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                  background: `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${GLASS_COLORS.secondary})`,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha('#FFFFFF', 0.3),
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.secondary, 0.9)})`,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  },
                  '&:disabled': {
                    background: alpha('#FFFFFF', 0.1),
                    color: alpha('#000000', 0.3),
                  },
                  width: { xs: '100%', sm: 'auto' },
                  maxWidth: { xs: '280px', sm: 'none' }
                }}
              >
                {isGuestMode ? 'Попробовать демо' : 'Продолжить'}
              </Button>
            </Box>
          </Box>
        )}

        {step === 'countdown' && (
          <Box sx={{ 
            p: { xs: 3, sm: 4, md: 8 }, 
            textAlign: 'center',
            height: { xs: 'calc(100vh - 128px)', sm: 'auto' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {isLoading ? (
              <>
                <CircularProgress size={80} sx={{ 
                  mb: 4, 
                  color: GLASS_COLORS.primary,
                }} />
                <Typography variant="h6" gutterBottom sx={{ 
                  color: GLASS_COLORS.textPrimary,
                  fontWeight: 500,
                }}>
                  Загружаем вопросы...
                </Typography>
                <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary }}>
                  Подбираем идеальные вопросы для вашего уровня
                </Typography>
              </>
            ) : (
              <>
                <Box sx={{ 
                  width: { xs: 150, sm: 180, md: 200 }, 
                  height: { xs: 150, sm: 180, md: 200 }, 
                  mx: 'auto',
                  mb: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: alpha(GLASS_COLORS.primary, 0.15),
                  backdropFilter: 'blur(20px)',
                  border: '2px solid',
                  borderColor: alpha(GLASS_COLORS.primary, 0.3),
                  position: 'relative',
                }}>
                  <Box sx={{ 
                    position: 'absolute',
                    top: -4,
                    left: -4,
                    right: -4,
                    bottom: -4,
                    border: '2px solid',
                    borderColor: GLASS_COLORS.primary,
                    borderRadius: '50%',
                    animation: 'glassPulse 2s infinite',
                    '@keyframes glassPulse': {
                      '0%': { transform: 'scale(1)', opacity: 0.5, borderColor: GLASS_COLORS.primary },
                      '50%': { transform: 'scale(1.1)', opacity: 0.8, borderColor: GLASS_COLORS.secondary },
                      '100%': { transform: 'scale(1)', opacity: 0.5, borderColor: GLASS_COLORS.primary },
                    }
                  }} />
                  <TimerIcon sx={{ 
                    fontSize: { xs: 60, sm: 70, md: 80 }, 
                    color: GLASS_COLORS.primary,
                  }} />
                </Box>
                
                <Typography variant="h4" gutterBottom sx={{ 
                  fontWeight: 600, 
                  color: GLASS_COLORS.textPrimary,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                  letterSpacing: '-0.02em',
                }}>
                  Готовы?
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: GLASS_COLORS.textSecondary, 
                  mb: 4,
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                  px: { xs: 2, sm: 0 }
                }}>
                  {isGuestMode 
                    ? 'У вас есть 5 минут на 3 демо-вопроса'
                    : 'У вас есть 10 минут на 5 вопросов уровня'}
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayIcon />}
                  onClick={handleStartTimer}
                  sx={{
                    px: { xs: 4, sm: 6 },
                    py: { xs: 1, sm: 1.5 },
                    borderRadius: 3,
                    fontWeight: 600,
                    fontSize: { xs: '0.9375rem', sm: '1.1rem' },
                    background: `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${GLASS_COLORS.secondary})`,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: alpha('#FFFFFF', 0.3),
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.secondary, 0.9)})`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 24px ${alpha(GLASS_COLORS.success, 0.3)}`,
                    },
                    width: { xs: '100%', sm: 'auto' },
                    maxWidth: { xs: '280px', sm: 'none' },
                  }}
                >
                  Вперед
                </Button>
              </>
            )}
          </Box>
        )}

        {step === 'questions' && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: { xs: 'calc(100vh - 64px)', sm: '600px' }
          }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                background: GLASS_COLORS.surface,
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid',
                borderColor: GLASS_COLORS.border,
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 }
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 1, sm: 2 },
                  mb: { xs: 1, sm: 0 }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TimerIcon sx={{ color: GLASS_COLORS.primary }} />
                    <Typography variant="h5" sx={{ 
                      fontWeight: 600, 
                      color: GLASS_COLORS.primary,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      letterSpacing: '-0.02em',
                    }}>
                      {formatTime(timeLeft)}
                    </Typography>
                  </Box>
                  <Chip
                    label={`Вопрос ${currentQuestionIndex + 1} из ${questions.length}`}
                    size="small"
                    sx={{ 
                      fontWeight: 500, 
                      color: GLASS_COLORS.primary,
                      fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                      backgroundColor: alpha(GLASS_COLORS.primary, 0.1),
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: alpha(GLASS_COLORS.primary, 0.3),
                    }}
                  />
                </Box>
                
                <Button
                  variant="outlined"
                  startIcon={<RestartIcon />}
                  onClick={handleReset}
                  size="small"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                    color: GLASS_COLORS.error,
                    borderColor: alpha(GLASS_COLORS.error, 0.5),
                    backgroundColor: alpha(GLASS_COLORS.error, 0.05),
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      borderColor: GLASS_COLORS.error,
                      backgroundColor: alpha(GLASS_COLORS.error, 0.1),
                    }
                  }}
                >
                  Сбросить
                </Button>
              </Box>
            </Paper>

            <Box sx={{ 
              flex: 1, 
              overflow: 'auto', 
              p: { xs: 2, sm: 3 }, 
              background: GLASS_COLORS.background,
            }}>
              {isLoading ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%' 
                }}>
                  <CircularProgress sx={{ color: GLASS_COLORS.primary }} />
                </Box>
              ) : questions.length > 0 && currentQuestionIndex < questions.length ? (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ 
                      mb: 2,
                      flexWrap: 'wrap',
                      gap: 0.5
                    }}>
                      <Chip
                        label={questions[currentQuestionIndex].difficulty.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getDifficultyColor(questions[currentQuestionIndex].difficulty), 0.15),
                          color: getDifficultyColor(questions[currentQuestionIndex].difficulty),
                          fontWeight: 500,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          backdropFilter: 'blur(10px)',
                          border: '1px solid',
                          borderColor: alpha(getDifficultyColor(questions[currentQuestionIndex].difficulty), 0.3),
                        }}
                      />
                      {questions[currentQuestionIndex].category_name && (
                        <Chip
                          icon={<CategoryIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                          label={questions[currentQuestionIndex].category_name}
                          size="small"
                          sx={{ 
                            fontWeight: 500,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            backgroundColor: GLASS_COLORS.surface,
                            backdropFilter: 'blur(10px)',
                            border: '1px solid',
                            borderColor: GLASS_COLORS.border,
                          }}
                        />
                      )}
                    </Stack>
                    
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      mb: 2, 
                      color: GLASS_COLORS.textPrimary,
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                      letterSpacing: '-0.01em',
                    }}>
                      {questions[currentQuestionIndex].title}
                    </Typography>
                    
                    {renderQuestionContent(questions[currentQuestionIndex].content)}
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mt: 3, 
                    pt: 2, 
                    borderTop: '1px solid',
                    borderColor: GLASS_COLORS.border,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 2, sm: 0 }
                  }}>
                    {currentQuestionIndex > 0 && (
                    <Button
                      startIcon={<ChevronLeftIcon />}
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                      sx={{ 
                        color: GLASS_COLORS.textPrimary,
                        width: { xs: '100%', sm: 'auto' },
                        backgroundColor: alpha(GLASS_COLORS.surface, 0.5),
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: GLASS_COLORS.border,
                        '&:hover': {
                          backgroundColor: GLASS_COLORS.surface,
                        }
                      }}
                    >
                      Назад
                    </Button>
                    )}
                    {currentQuestionIndex === questions.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={() => {
                          if (timerRef.current) {
                            clearInterval(timerRef.current);
                            timerRef.current = null;
                          }
                          setIsTimerRunning(false);
                          setStep('results');
                        }}
                        sx={{ 
                          fontWeight: 600,
                          width: { xs: '100%', sm: 'auto' },
                          background: `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${GLASS_COLORS.secondary})`,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid',
                          borderColor: alpha('#FFFFFF', 0.3),
                          '&:hover': {
                            background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.secondary, 0.9)})`,
                          }
                        }}
                      >
                        Завершить тест
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        endIcon={<ChevronRightIcon />}
                        onClick={handleNextQuestion}
                        sx={{ 
                          width: { xs: '100%', sm: 'auto' },
                          background: `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${GLASS_COLORS.secondary})`,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid',
                          borderColor: alpha('#FFFFFF', 0.3),
                          '&:hover': {
                            background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.secondary, 0.9)})`,
                          }
                        }}
                      >
                        Следующий вопрос
                      </Button>
                    )}
                  </Box>
                </>
              ) : (
                <Typography variant="body1" sx={{ color: GLASS_COLORS.textSecondary }} align="center">
                  Вопросы не найдены
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {step === 'results' && (
          <Box sx={{ 
            p: { xs: 2, sm: 3 }, 
            background: GLASS_COLORS.background,
            height: { xs: 'calc(100vh - 64px)', sm: 'auto' },
            overflow: 'auto'
          }}>
            <Box sx={{ 
              textAlign: 'center', 
              mb: 4, 
              p: { xs: 2, sm: 3 }, 
              background: alpha(GLASS_COLORS.success, 0.15),
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: '1px solid',
              borderColor: alpha(GLASS_COLORS.success, 0.3),
            }}>
              <CheckIcon sx={{ 
                fontSize: { xs: 48, sm: 60 }, 
                color: GLASS_COLORS.success, 
                mb: 2 
              }} />
              <Typography variant="h5" gutterBottom sx={{ 
                fontWeight: 600, 
                color: GLASS_COLORS.textPrimary,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                letterSpacing: '-0.02em',
              }}>
                Тест завершен!
              </Typography>
              <Typography variant="body1" sx={{ color: GLASS_COLORS.textSecondary }}>
                Вы ответили на все вопросы за {formatTime((isGuestMode ? 300 : 600) - timeLeft)}
              </Typography>
              {isGuestMode && (
                <Typography variant="body2" sx={{ 
                  mt: 2, 
                  color: GLASS_COLORS.primary, 
                  fontWeight: 500,
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                }}>
                  🔒 Полный доступ к 1156+ вопросам — после регистрации
                </Typography>
              )}
            </Box>

            <Typography variant="h6" gutterBottom sx={{ 
              fontWeight: 600, 
              color: GLASS_COLORS.textPrimary,
              fontSize: { xs: '1rem', sm: '1.125rem' },
              letterSpacing: '-0.01em',
            }}>
              Вопросы и ответы для проверки:
            </Typography>

            <Box sx={{ 
              maxHeight: { xs: 'calc(100vh - 400px)', sm: '400px' }, 
              overflow: 'auto', 
            }}>
              {questions.map((question, index) => (
                <Paper
                  key={question.id}
                  elevation={0}
                  sx={{
                    mb: 2,
                    background: GLASS_COLORS.surface,
                    backdropFilter: 'blur(20px)',
                    border: '1px solid',
                    borderColor: GLASS_COLORS.border,
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      background: alpha(GLASS_COLORS.primary, 0.05),
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      justifyContent: 'space-between',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 0 },
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: alpha(GLASS_COLORS.primary, 0.1),
                      }
                    }}
                    onClick={() => handleToggleExpand(question.id)}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: { xs: 'flex-start', sm: 'center' }, 
                      gap: { xs: 1, sm: 2 },
                      flexDirection: { xs: 'column', sm: 'row' },
                      width: { xs: '100%', sm: 'auto' }
                    }}>
                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: 500, 
                        color: GLASS_COLORS.textPrimary,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      }}>
                        Вопрос {index + 1}: {question.title}
                      </Typography>
                      <Chip
                        label={question.difficulty.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getDifficultyColor(question.difficulty), 0.15),
                          color: getDifficultyColor(question.difficulty),
                          fontWeight: 500,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          backdropFilter: 'blur(10px)',
                          border: '1px solid',
                          borderColor: alpha(getDifficultyColor(question.difficulty), 0.3),
                        }}
                      />
                    </Box>
                    {expandedQuestions.includes(question.id) ? 
                      <ExpandLessIcon sx={{ color: GLASS_COLORS.textSecondary, mt: { xs: 1, sm: 0 } }} /> : 
                      <ExpandMoreIcon sx={{ color: GLASS_COLORS.textSecondary, mt: { xs: 1, sm: 0 } }} />
                    }
                  </Box>

                  <Collapse in={expandedQuestions.includes(question.id)}>
                    <Box sx={{ p: { xs: 2, sm: 3 }, background: GLASS_COLORS.surfaceDark }}>
                      <Typography 
                        variant="subtitle2" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600, 
                          color: GLASS_COLORS.textSecondary,
                          mb: 2,
                          fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                        }}
                      >
                        Вопрос:
                      </Typography>
                      {renderQuestionContent(question.content)}
                      
                      <Divider sx={{ my: 3, borderColor: GLASS_COLORS.border }} />
                      
                      <Typography 
                        variant="subtitle2" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600, 
                          color: GLASS_COLORS.success,
                          mb: 2,
                          fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                        }}
                      >
                        Ответ:
                      </Typography>
                      {answers[question.id] ? (
                        renderAnswerContent(answers[question.id].content)
                      ) : (
                        <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary, fontStyle: 'italic' }}>
                          Ответ не найден
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </Paper>
              ))}
            </Box>

            <Box sx={{ 
              mt: 4, 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{ 
                  fontWeight: 500, 
                  color: GLASS_COLORS.textPrimary,
                  width: { xs: '100%', sm: 'auto' },
                  borderColor: GLASS_COLORS.border,
                  backgroundColor: GLASS_COLORS.surface,
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    borderColor: GLASS_COLORS.primary,
                    backgroundColor: alpha(GLASS_COLORS.primary, 0.05),
                  }
                }}
              >
                Пройти еще раз
              </Button>
              {isGuestMode ? (
                <Button
                  variant="contained"
                  onClick={() => {
                    handleCloseModal();
                    navigate('/register');
                  }}
                  sx={{ 
                    fontWeight: 500, 
                    background: `linear-gradient(135deg, ${GLASS_COLORS.success}, ${alpha(GLASS_COLORS.success, 0.8)})`,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: alpha('#FFFFFF', 0.3),
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.success, 0.9)}, ${alpha(GLASS_COLORS.success, 0.7)})`,
                    }
                  }}
                >
                  Зарегистрироваться для полного доступа
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleCloseModal}
                  sx={{ 
                    fontWeight: 500,
                    width: { xs: '100%', sm: 'auto' },
                    background: `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${GLASS_COLORS.secondary})`,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: alpha('#FFFFFF', 0.3),
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.secondary, 0.9)})`,
                    }
                  }}
                >
                  Закрыть
                </Button>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      {step !== 'results' && step !== 'countdown' && (
        <DialogActions sx={{ 
          p: { xs: 1.5, sm: 2 }, 
          background: alpha(GLASS_COLORS.background, 0.5),
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid',
          borderColor: GLASS_COLORS.border,
        }}>
          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" sx={{ color: GLASS_COLORS.textSecondary }}>
            {isGuestMode 
              ? 'Демо-режим • 3 вопроса • 5 минут' 
              : 'Быстрый старт • 5 вопросов • 10 минут'}
          </Typography>
        </DialogActions>
      )}
    </Dialog>
  );
};

const GlassQuickStartCard = memo(({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const [quickStartOpen, setQuickStartOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleClick = () => {
    setQuickStartOpen(true);
  };
  
  return (
    <>
      <Zoom in timeout={1200}>
        <Card
          sx={{
            background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)} 0%, ${alpha(GLASS_COLORS.secondary, 0.7)} 100%)`,
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: GLASS_COLORS.borderGlow,
            color: 'white',
            borderRadius: { xs: 3, sm: 4 },
            overflow: 'hidden',
            position: 'relative',
            boxShadow: `0 16px 32px ${alpha(GLASS_COLORS.primary, 0.3)}, 0 0 0 1px rgba(255, 255, 255, 0.5) inset`,
            '&:hover': {
              boxShadow: `0 24px 48px ${alpha(GLASS_COLORS.primary, 0.4)}, 0 0 0 2px rgba(255, 255, 255, 0.6) inset`,
              transform: 'translateY(-4px) scale(1.01)',
            },
            transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
            cursor: 'pointer',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -20,
              left: -20,
              right: -20,
              bottom: -20,
              background: `radial-gradient(circle at 30% 30%, ${GLASS_COLORS.glassHighlight} 0%, transparent 70%)`,
              opacity: 0.5,
              zIndex: 0,
            },
          }}
          onClick={handleClick}
        >
          <CardContent sx={{ 
            p: { xs: 2.5, sm: 3, md: 4 }, 
            position: 'relative', 
            zIndex: 1 
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              mb: { xs: 1.5, sm: 2 },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 1.5 }
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 }
              }}>
                <BoltIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                <Typography variant="h5" sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  letterSpacing: '-0.02em',
                }}>
                  Быстрый старт
                </Typography>
              </Box>
              
              {!isAuthenticated && (
                <Chip 
                  label="Для гостей" 
                  size="small" 
                  sx={{ 
                    backgroundColor: alpha('#FFFFFF', 0.2),
                    color: 'white',
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: alpha('#FFFFFF', 0.3),
                  }} 
                />
              )}
            </Box>
            
            <Typography variant="body1" sx={{ 
              mb: { xs: 2, sm: 3 }, 
              opacity: 0.95,
              fontSize: { xs: '0.9375rem', sm: '1rem' },
              lineHeight: 1.5
            }}>
              {isAuthenticated 
                ? 'Ответьте на 5 вопросов за 10 минут и проверьте свои навыки'
                : 'Попробуйте демо-режим с 3 вопросами. Полный доступ откроется — после регистрации'}
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 }
            }}>
              <Box sx={{ 
                width: { xs: '100%', sm: 'auto' },
                mb: { xs: 1, sm: 0 }
              }}>
                <Typography variant="caption" sx={{ 
                  opacity: 0.8, 
                  display: 'block', 
                  mb: 0.5,
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                }}>
                  <TimerIcon sx={{ 
                    fontSize: { xs: 12, sm: 14 }, 
                    verticalAlign: 'middle', 
                    mr: 0.5 
                  }} />
                  {isAuthenticated ? '10 минут' : '5 минут'}
                </Typography>
                <Typography variant="caption" sx={{ 
                  opacity: 0.8,
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                }}>
                  <QuestionsIcon sx={{ 
                    fontSize: { xs: 12, sm: 14 }, 
                    verticalAlign: 'middle', 
                    mr: 0.5 
                  }} />
                  {isAuthenticated ? '5 вопросов' : '3 вопроса'}
                </Typography>
              </Box>
              
              <Button
                endIcon={<ChevronRightIcon />}
                sx={{
                  backgroundColor: 'white',
                  color: GLASS_COLORS.primary,
                  fontWeight: 600,
                  px: { xs: 2.5, sm: 3 },
                  py: { xs: 0.75, sm: 1 },
                  borderRadius: 2,
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { xs: 'auto', sm: '120px' },
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha('#FFFFFF', 0.5),
                  '&:hover': {
                    backgroundColor: alpha('#FFFFFF', 0.9),
                    transform: 'translateX(4px)',
                  }
                }}
              >
                {isAuthenticated ? 'Начать сейчас' : 'Попробовать'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Zoom>

      <GlassQuickStartModal
        open={quickStartOpen}
        onClose={() => setQuickStartOpen(false)}
        isGuestMode={!isAuthenticated}
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
          background: GLASS_COLORS.surface,
          backdropFilter: 'blur(20px)',
          color: GLASS_COLORS.primary,
          border: '1px solid',
          borderColor: GLASS_COLORS.border,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            background: GLASS_COLORS.surfaceDark,
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
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
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, isAuthenticated, logout } = useAuth();
  const { mode: themeMode } = useThemeContext();
  const GLASS_COLORS = getGlassColors(themeMode);
  const [stats, setStats] = useState<Stats>({ questions: 0, categories: 0 });
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      
      const usersResponse = await userService.getUsers(
        1, 
        100, 
        'created_at', 
        'desc'
      );
      const activeUsers = usersResponse.items.filter(user => user.is_active);
      
      setUsers(activeUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const scrollToFeatures = useCallback(() => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [questionsData, categoriesData] = await Promise.all([
        questionService.getQuestions(
          1,
          1,
          true,
          undefined,
          undefined,
          undefined,
          undefined,
          true,
        ),
        categoryService.getCategories(1, 10, false),
      ]);
      
      setStats({
        questions: questionsData.total,
        categories: categoriesData.total,
      });
      
      const sortedCategories = (categoriesData.items as ApiCategory[])
        .sort((a, b) => b.question_count - a.question_count)
        .slice(0, 5);
      
      setCategories(sortedCategories);
      
    } catch (err) {
      setError('Не удалось загрузить данные');
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadUsers();
  }, [loadData, loadUsers]);

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
      background: GLASS_COLORS.mainColor,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
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
      }
    }}>
        <Fade in>
          <AppBar 
            position="sticky" 
            elevation={0}
            sx={{ 
              background: GLASS_COLORS.surface,
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderBottom: '1px solid',
              borderColor: GLASS_COLORS.border,
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
                    fontWeight: 700,
                    color: GLASS_COLORS.textPrimary,
                    fontSize: '1.45rem',
                    cursor: 'pointer',
                    letterSpacing: '-0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': { 
                      color: GLASS_COLORS.primary,
                      opacity: 0.9 
                    }
                  }}
                  onClick={() => handleNavigation('/')}
                >
                  Interview<span style={{ color: GLASS_COLORS.primary }}>Box</span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: GLASS_COLORS.primary,
                    marginLeft: '6px',
                    backgroundColor: alpha('#FFFFFF', 0.3),
                    padding: '2px 6px',
                    borderRadius: '6px',
                    alignSelf: 'flex-start',
                    marginTop: '2px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: alpha(GLASS_COLORS.primary, 0.3),
                  }}>
                    beta
                  </span>
                </Typography>
                {isAuthenticated && (
                  <Stack direction="row" spacing={1.5} alignItems="center">                  
                    {!isMobile && (
                      <>
                        <Chip 
                          label={`${user?.first_name} ${user?.last_name}`}
                          size="medium"
                          onClick={() => handleNavigation('/profile')}
                          sx={{ 
                            fontWeight: 500,
                            backgroundColor: alpha(GLASS_COLORS.primary, 0.1),
                            color: GLASS_COLORS.textPrimary,
                            cursor: 'pointer',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid',
                            borderColor: alpha(GLASS_COLORS.primary, 0.2),
                            '& .MuiChip-label': {
                              px: 1.5,
                            },
                            '&:hover': {
                              backgroundColor: alpha(GLASS_COLORS.primary, 0.2),
                            }
                          }}
                        />
                        {user?.is_admin && (
                          <Chip 
                            label="Admin"
                            onClick={() => handleNavigation('/admin')}
                            size="medium"
                            sx={{ 
                              fontWeight: 500,
                              backgroundColor: alpha(GLASS_COLORS.success, 0.1),
                              color: GLASS_COLORS.success,
                              backdropFilter: 'blur(10px)',
                              border: '1px solid',
                              borderColor: alpha(GLASS_COLORS.success, 0.3),
                            }}
                          />
                        )}
                      </>
                  )}
                  <ThemeToggle />
                  <IconButton
                    onClick={handleLogout}
                    size="medium"
                    sx={{
                      backgroundColor: alpha(GLASS_COLORS.error, 0.1),
                      color: GLASS_COLORS.error,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: alpha(GLASS_COLORS.error, 0.3),
                      '&:hover': {
                        backgroundColor: alpha(GLASS_COLORS.error, 0.2),
                      },
                      width: 40,
                      height: 40
                    }}
                  >
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Stack>
                )}
              </Toolbar>
            </Container>
          </AppBar>
        </Fade>

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
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.15)} 0%, ${alpha(GLASS_COLORS.secondary, 0.1)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  color: GLASS_COLORS.primary,
                  fontSize: '0.875rem',
                  py: 1.5,
                  px: 2,
                  border: '1.5px solid',
                  borderColor: alpha(GLASS_COLORS.primary, 0.3),
                  borderRadius: '30px',
                  boxShadow: `0 4px 15px -3px ${alpha(GLASS_COLORS.primary, 0.2)}, 0 0 0 1px rgba(255, 255, 255, 0.3) inset`,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background: `linear-gradient(180deg, ${alpha('#FFFFFF', 0.4)} 0%, transparent 100%)`,
                    opacity: 0.5,
                    transition: 'opacity 0.3s ease',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: -5,
                    left: -5,
                    right: -5,
                    bottom: -5,
                    background: `radial-gradient(circle at 30% 30%, ${alpha(GLASS_COLORS.primary, 0.3)} 0%, transparent 70%)`,
                    opacity: 0,
                    zIndex: -1,
                    filter: 'blur(15px)',
                    transition: 'opacity 0.4s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: `0 8px 20px -5px ${alpha(GLASS_COLORS.primary, 0.4)}, 0 0 0 2px rgba(255, 255, 255, 0.5) inset`,
                    borderColor: alpha(GLASS_COLORS.primary, 0.6),
                    '&::after': {
                      opacity: 0.6,
                    },
                    '&::before': {
                      opacity: 0.7,
                    }
                  },
                  '& .MuiChip-label': {
                    px: 1,
                    fontWeight: 500,
                    textShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  },
                  '& .MuiChip-icon': {
                    mr: 0.5,
                    ml: 0,
                  }
                }}
              />
              
              <Typography 
                variant={isMobile ? 'h3' : 'h1'} 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  mb: 3,
                  color: GLASS_COLORS.textPrimary,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  fontSize: { xs: '2.5rem', md: '3.75rem' },
                  textShadow: '0 4px 20px rgba(255,255,255,0.5)',
                }}
              >
                Успешно пройдите собеседование
                <br />
                <Box component="span" sx={{ 
                  background: `linear-gradient(135deg, ${GLASS_COLORS.primary} 0%, ${GLASS_COLORS.secondary} 100%)`,
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
                  color: GLASS_COLORS.textSecondary,
                  maxWidth: '780px',
                  mx: 'auto',
                  lineHeight: 1.6,
                  fontWeight: 400,
                  fontSize: { xs: '1.125rem', md: '1.5rem' },
                }}
              >
                Закрывайте слабые места. Большая база из {stats.questions || 1156}+ вопросов с ответами, которые прошли отбор. Ваш прогресс — под контролем.
              </Typography>
            </Box>
          </Fade>

          <Fade in timeout={900}>
            <Box sx={{ 
              display: 'flex', 
              gap: 3, 
              justifyContent: 'center', 
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
                      borderRadius: '40px', // Более скругленные углы как в iOS
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      letterSpacing: '-0.01em',
                      background: `linear-gradient(135deg, ${GLASS_COLORS.primary} 0%, ${GLASS_COLORS.secondary} 100%)`,
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1.5px solid',
                      borderColor: alpha('#FFFFFF', 0.5),
                      boxShadow: `0 10px 25px -5px ${alpha(GLASS_COLORS.primary, 0.4)}, 0 0 0 1px rgba(255, 255, 255, 0.3) inset`,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '50%',
                        background: `linear-gradient(180deg, ${alpha('#FFFFFF', 0.4)} 0%, transparent 100%)`,
                        opacity: 0.5,
                        transition: 'opacity 0.3s ease',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: -10,
                        left: -10,
                        right: -10,
                        bottom: -10,
                        background: `radial-gradient(circle at 30% 30%, ${alpha(GLASS_COLORS.primary, 0.4)} 0%, transparent 70%)`,
                        opacity: 0,
                        zIndex: -1,
                        filter: 'blur(20px)',
                        transition: 'opacity 0.4s ease',
                      },
                      '&:hover': {
                        boxShadow: `0 20px 30px -8px ${alpha(GLASS_COLORS.primary, 0.6)}, 0 0 0 2px rgba(255, 255, 255, 0.6) inset`,
                        transform: 'translateY(-3px) scale(1.02)',
                        borderColor: alpha('#FFFFFF', 0.8),
                        '&::after': {
                          opacity: 0.7,
                        },
                        '&::before': {
                          opacity: 0.8,
                        }
                      },
                      '&:active': {
                        transform: 'translateY(0) scale(0.98)',
                        boxShadow: `0 5px 15px -3px ${alpha(GLASS_COLORS.primary, 0.4)}`,
                      },
                      '& .MuiButton-startIcon': {
                        marginRight: 1.5,
                        '& svg': {
                          fontSize: '1.3rem',
                          filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.2))',
                        }
                      }
                    }}
                  >
                    Начать обучение
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
                      borderRadius: '40px',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      letterSpacing: '-0.01em',
                      background: `linear-gradient(135deg, ${GLASS_COLORS.primary} 0%, ${GLASS_COLORS.secondary} 100%)`,
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1.5px solid',
                      borderColor: alpha('#FFFFFF', 0.5),
                      boxShadow: `0 10px 25px -5px ${alpha(GLASS_COLORS.primary, 0.4)}, 0 0 0 1px rgba(255, 255, 255, 0.3) inset`,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '50%',
                        background: `linear-gradient(180deg, ${alpha('#FFFFFF', 0.4)} 0%, transparent 100%)`,
                        opacity: 0.5,
                        transition: 'opacity 0.3s ease',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: -10,
                        left: -10,
                        right: -10,
                        bottom: -10,
                        background: `radial-gradient(circle at 30% 30%, ${alpha(GLASS_COLORS.primary, 0.4)} 0%, transparent 70%)`,
                        opacity: 0,
                        zIndex: -1,
                        filter: 'blur(20px)',
                        transition: 'opacity 0.4s ease',
                      },
                      '&:hover': {
                        background: `linear-gradient(180deg, ${alpha('#0d03d5ff', 0.4)} 0%, transparent 100%)`,
                        boxShadow: `0 20px 30px -8px ${alpha(GLASS_COLORS.primary, 0.6)}, 0 0 0 2px rgba(255, 255, 255, 0.6) inset`,
                        transform: 'translateY(-3px) scale(1.02)',
                        borderColor: alpha('#FFFFFF', 0.8),
                        '&::after': {
                          opacity: 0.7,
                        },
                        '&::before': {
                          opacity: 0.8,
                        }
                      },
                      '&:active': {
                        transform: 'translateY(0) scale(0.98)',
                        boxShadow: `0 5px 15px -3px ${alpha(GLASS_COLORS.primary, 0.4)}`,
                      },
                      '& .MuiButton-startIcon': {
                        marginRight: 1.5,
                        '& svg': {
                          fontSize: '1.3rem',
                          filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.2))',
                        }
                      }
                    }}
                  >
                    Начать обучение
                  </Button>
                </>
              )}
            </Box>
          </Fade>

        {!isAuthenticated && (
          <Fade in timeout={1500}>
            <Box sx={{ 
              mt: { xs: 3, sm: 4, md: 4 },
              textAlign: 'center',
              px: { xs: 2, sm: 3 }
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: { xs: 1.5, sm: 2 },
                  color: GLASS_COLORS.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: { xs: 0.5, sm: 1, md: 1.5 },
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  flexDirection: { xs: 'column', sm: 'row' },
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 0.5,
                    mb: { xs: 0.5, sm: 0 }
                  }}
                >
                  <CheckIcon fontSize="small" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, color: GLASS_COLORS.success }} /> 
                  <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                    Различные вопросы
                  </Box>
                </Box>
                
                <Box 
                  component="span" 
                  sx={{ 
                    display: { xs: 'none', sm: 'inline' },
                    mx: 0.5,
                    color: GLASS_COLORS.border
                  }}
                >
                  •
                </Box>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 0.5,
                    mb: { xs: 0.5, sm: 0 }
                  }}
                >
                  <CheckIcon fontSize="small" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, color: GLASS_COLORS.success }} /> 
                  <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                    Удобное отслеживание
                  </Box>
                </Box>
                
                <Box 
                  component="span" 
                  sx={{ 
                    display: { xs: 'none', sm: 'inline' },
                    mx: 0.5,
                    color: GLASS_COLORS.border
                  }}
                >
                  •
                </Box>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <CheckIcon fontSize="small" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, color: GLASS_COLORS.success }} /> 
                  <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                    Развернутые ответы
                  </Box>
                </Box>
              </Typography>
            </Box>
          </Fade>
        )}

          <Fade in timeout={1500}>
            <Box 
              sx={{
                display: 'flex', 
                justifyContent: 'center',
                mt: 4,
                cursor: 'pointer',
                animation: 'glassBounce 2s infinite',
                '@keyframes glassBounce': {
                  '0%, 100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-10px)' },
                }
              }}
              onClick={scrollToFeatures}
            >
              <ArrowDownIcon sx={{ fontSize: 40, color: GLASS_COLORS.primary }} />
            </Box>
          </Fade>
        </Box>

        <Box sx={{ mb: 10, px: { xs: 2, sm: 3 } }} ref={featuresRef}>
          <Fade in timeout={1200}>
          <Box sx={{ position: 'relative', mb: 6 }}>
            {/* Декоративные элементы фона */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '150%',
                height: '100%',
                background: `radial-gradient(circle at 30% 30%, ${alpha(GLASS_COLORS.primary, 0.1)} 0%, transparent 50%),
                            radial-gradient(circle at 70% 70%, ${alpha(GLASS_COLORS.secondary, 0.1)} 0%, transparent 50%)`,
                filter: 'blur(40px)',
                zIndex: 0,
              }}
            />

            <Typography 
              variant="h4" 
              sx={{ 
                position: 'relative',
                zIndex: 1,
                fontWeight: 700,
                color: GLASS_COLORS.textPrimary,
                textAlign: 'center',
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
                textShadow: '0 4px 20px rgba(255,255,255,0.3)',
                display: 'inline-block',
                width: '100%',
                '& span': {
                  position: 'relative',
                  display: 'inline-block',
                  color: GLASS_COLORS.primary,
                  background: `linear-gradient(135deg, ${GLASS_COLORS.primary} 0%, ${GLASS_COLORS.secondary} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: `0 0 30px ${alpha(GLASS_COLORS.primary, 0.5)}`,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-4px',
                    left: 0,
                    width: '100%',
                    height: '3px',
                    background: `linear-gradient(90deg, transparent 0%, ${GLASS_COLORS.primary} 20%, ${GLASS_COLORS.secondary} 80%, transparent 100%)`,
                    borderRadius: '3px',
                    opacity: 0.6,
                    filter: 'blur(1px)',
                  }
                }
              }}
            >
              <Box sx={{ position: 'relative' }}>
                Почему выбрать{' '}
                <Box
                  component="span"
                  sx={{
                    position: 'relative',
                    display: 'inline-block',
                    '&:hover': {
                      '&::before': {
                        opacity: 0.8,
                        transform: 'scale(1.5)',
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '100%',
                      height: '100%',
                      background: `radial-gradient(circle, ${alpha(GLASS_COLORS.primary, 0.3)} 0%, transparent 70%)`,
                      filter: 'blur(15px)',
                      opacity: 0,
                      transition: 'all 0.4s ease',
                      zIndex: -1,
                    }
                  }}
                >
                  Interview<span style={{ color: GLASS_COLORS.primary }}>Box</span>
                </Box>
                ?
              </Box>
            </Typography>
          </Box>
        </Fade>
          <Grid container spacing={3} justifyContent="center" sx={{ mb: 8 }}>
            <Grid item xs={12} sm={4} md={3}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <GlassStatCard
                  title="Вопросов"
                  value={stats.questions || 1156}
                  color={GLASS_COLORS.primary}
                  icon={<QuestionsIcon sx={{ fontSize: 32 }} />}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <GlassStatCard
                  title="Категорий"
                  value={stats.categories || 26}
                  color={GLASS_COLORS.success}
                  icon={<CategoryIcon sx={{ fontSize: 32 }} />}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <GlassStatCard
                  title="Пользователей"
                  value={users.length + 56 || 135}
                  color={GLASS_COLORS.warning}
                  icon={<PeopleIcon sx={{ fontSize: 32 }} />}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <GlassStatCard
                  title="Успешность"
                  value={100}
                  color={GLASS_COLORS.purple}
                  icon={<TrendingIcon sx={{ fontSize: 32 }} />}
                />
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mb: { xs: 4, sm: 6, md: 8 } }}>
            <GlassQuickStartCard isAuthenticated={isAuthenticated} />
          </Box>

          {!isAuthenticated && (
          <Box sx={{ mb: 12, position: 'relative' }}>
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                left: '10%',
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(GLASS_COLORS.primary, 0.2)} 0%, transparent 70%)`,
                zIndex: 0,
                filter: 'blur(40px)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                right: '15%',
                width: 250,
                height: 250,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(GLASS_COLORS.purple, 0.15)} 0%, transparent 70%)`,
                zIndex: 0,
                filter: 'blur(50px)',
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 700,
                      color: GLASS_COLORS.textPrimary,
                      textAlign: 'center',
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      letterSpacing: '-0.02em',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        display: 'block',
                        width: 60,
                        height: 4,
                        background: `linear-gradient(90deg, ${GLASS_COLORS.primary}, ${GLASS_COLORS.purple})`,
                        margin: '16px auto 0',
                        borderRadius: 2,
                      }
                    }}
                  >
                    Отзывы от коллег-разработчиков
                  </Typography>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 6, 
                      fontWeight: 400,
                      color: GLASS_COLORS.textSecondary,
                      textAlign: 'center',
                      maxWidth: '600px',
                      mx: 'auto',
                      px: { xs: 2, sm: 0 }
                    }}
                  >
                    Присоединяйтесь к разработчикам, которые уже используют платформу
                  </Typography>
                </Box>
              </Fade>

              <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid item xs={12} md={4}>
                  <Grow in timeout={1200}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 4, 
                        height: '100%', 
                        background: GLASS_COLORS.surface,
                        backdropFilter: 'blur(20px)',
                        border: '1px solid',
                        borderColor: GLASS_COLORS.border,
                        borderRadius: 3,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
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
                          background: `radial-gradient(circle at 30% 30%, ${GLASS_COLORS.primary} 0%, transparent 70%)`,
                          opacity: 0,
                          zIndex: -1,
                          filter: 'blur(30px)',
                          transition: 'opacity 0.4s ease',
                        },
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 24px 48px ${alpha(GLASS_COLORS.primary, 0.2)}`,
                          borderColor: GLASS_COLORS.borderGlow,
                          '&::before': {
                            opacity: 1,
                          },
                          '&::after': {
                            opacity: 0.3,
                          },
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ 
                          position: 'relative',
                          mr: 3,
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: GLASS_COLORS.success,
                            border: '2px solid',
                            borderColor: GLASS_COLORS.surface,
                          }
                        }}>
                          <Box sx={{ 
                            width: 56, 
                            height: 56, 
                            borderRadius: '50%', 
                            background: `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${GLASS_COLORS.secondary})`,
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            color: 'white',
                            boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.primary, 0.3)}`,
                          }}>
                            А
                          </Box>
                        </Box>
                        
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary, mb: 0.5, letterSpacing: '-0.01em' }}>
                            Алексей
                          </Typography>
                          <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TrendingUpIcon fontSize="small" /> Senior Frontend Developer
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body1" sx={{ 
                        color: GLASS_COLORS.textPrimary, 
                        lineHeight: 1.7,
                        fontStyle: 'italic',
                        position: 'relative',
                        pl: 2,
                        '&::before': {
                          content: '"❝"',
                          position: 'absolute',
                          left: -10,
                          top: -5,
                          color: GLASS_COLORS.primary,
                          fontSize: '1.5rem',
                          opacity: 0.5
                        }
                      }}>
                        Благодаря InterviewBox вспомнил пару моментов, которые всегда забываются! Спасибо платформе за напоминание такого важного
                      </Typography>
                    </Paper>
                  </Grow>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Grow in timeout={1400}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 4, 
                        height: '100%', 
                        background: GLASS_COLORS.surface,
                        backdropFilter: 'blur(20px)',
                        border: '1px solid',
                        borderColor: GLASS_COLORS.border,
                        borderRadius: 3,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
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
                          opacity: 0,
                          zIndex: -1,
                          filter: 'blur(30px)',
                          transition: 'opacity 0.4s ease',
                        },
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 24px 48px ${alpha(GLASS_COLORS.success, 0.2)}`,
                          borderColor: GLASS_COLORS.borderGlow,
                          '&::before': {
                            opacity: 1,
                          },
                          '&::after': {
                            opacity: 0.3,
                          },
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ 
                          position: 'relative',
                          mr: 3,
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: GLASS_COLORS.success,
                            border: '2px solid',
                            borderColor: GLASS_COLORS.surface,
                          }
                        }}>
                          <Box sx={{ 
                            width: 56, 
                            height: 56, 
                            borderRadius: '50%', 
                            background: `linear-gradient(135deg, ${GLASS_COLORS.success}, ${alpha(GLASS_COLORS.success, 0.7)})`,
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            color: 'white',
                            boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.success, 0.3)}`,
                          }}>
                            М
                          </Box>
                        </Box>
                        
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary, mb: 0.5, letterSpacing: '-0.01em' }}>
                            Мария
                          </Typography>
                          <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <SchoolIcon fontSize="small" /> Junior Backend Developer
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body1" sx={{ 
                        color: GLASS_COLORS.textPrimary, 
                        lineHeight: 1.7,
                        fontStyle: 'italic',
                        position: 'relative',
                        pl: 2,
                        '&::before': {
                          content: '"❝"',
                          position: 'absolute',
                          left: -10,
                          top: -5,
                          color: GLASS_COLORS.success,
                          fontSize: '1.5rem',
                          opacity: 0.5
                        }
                      }}>
                        Как джуну было сложно понять, что действительно спрашивают на собеседованиях. Здесь нашла всё необходимое для первой работы!
                      </Typography>
                    </Paper>
                  </Grow>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Grow in timeout={1600}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 4, 
                        height: '100%', 
                        background: GLASS_COLORS.surface,
                        backdropFilter: 'blur(20px)',
                        border: '1px solid',
                        borderColor: GLASS_COLORS.border,
                        borderRadius: 3,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
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
                          background: `radial-gradient(circle at 30% 30%, ${GLASS_COLORS.purple} 0%, transparent 70%)`,
                          opacity: 0,
                          zIndex: -1,
                          filter: 'blur(30px)',
                          transition: 'opacity 0.4s ease',
                        },
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 24px 48px ${alpha(GLASS_COLORS.purple, 0.2)}`,
                          borderColor: GLASS_COLORS.borderGlow,
                          '&::before': {
                            opacity: 1,
                          },
                          '&::after': {
                            opacity: 0.3,
                          },
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ 
                          position: 'relative',
                          mr: 3,
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: GLASS_COLORS.purple,
                            border: '2px solid',
                            borderColor: GLASS_COLORS.surface,
                          }
                        }}>
                          <Box sx={{ 
                            width: 56, 
                            height: 56, 
                            borderRadius: '50%', 
                            background: `linear-gradient(135deg, ${GLASS_COLORS.purple}, ${alpha(GLASS_COLORS.purple, 0.7)})`,
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            color: 'white',
                            boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.purple, 0.3)}`,
                          }}>
                            Д
                          </Box>
                        </Box>
                        
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary, mb: 0.5, letterSpacing: '-0.01em' }}>
                            Дмитрий
                          </Typography>
                          <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <WorkIcon fontSize="small" /> Team Lead
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body1" sx={{ 
                        color: GLASS_COLORS.textPrimary, 
                        lineHeight: 1.7,
                        fontStyle: 'italic',
                        position: 'relative',
                        pl: 2,
                        '&::before': {
                          content: '"❝"',
                          position: 'absolute',
                          left: -10,
                          top: -5,
                          color: GLASS_COLORS.purple,
                          fontSize: '1.5rem',
                          opacity: 0.5
                        }
                      }}>
                        Использую для подготовки своей команды. Качество вопросов и ответов на высшем уровне. Экономим кучу времени на поиск материалов!
                      </Typography>
                    </Paper>
                  </Grow>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}

          {!isAuthenticated && (
            <Box sx={{ mb: 10 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 6, 
                  fontWeight: 700,
                  color: GLASS_COLORS.textPrimary,
                  textAlign: 'center',
                  letterSpacing: '-0.02em',
                }}
              >
                Чтобы получить оффер надо сделать 3 простых шага
              </Typography>

              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'center',
                alignItems: 'stretch',
                gap: 4,
                mb: 6
              }}>
                <Box sx={{ 
                  flex: 1,
                  maxWidth: { md: '350px' },
                  p: 3,
                  textAlign: 'center',
                  background: GLASS_COLORS.surface,
                  backdropFilter: 'blur(20px)',
                  border: '1px solid',
                  borderColor: GLASS_COLORS.border,
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
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
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 16px 32px ${alpha(GLASS_COLORS.primary, 0.15)}`,
                    borderColor: GLASS_COLORS.borderGlow,
                    '&::before': {
                      opacity: 1,
                    },
                  }
                }}>
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: alpha(GLASS_COLORS.primary, 0.15),
                    backdropFilter: 'blur(10px)',
                    mb: 3,
                    position: 'relative',
                    border: '1px solid',
                    borderColor: alpha(GLASS_COLORS.primary, 0.3),
                    '&::before': {
                      content: '"1"',
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${GLASS_COLORS.secondary})`,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      border: '2px solid',
                      borderColor: GLASS_COLORS.surface,
                    }
                  }}>
                    <LoginIcon sx={{ fontSize: 40, color: GLASS_COLORS.primary }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: GLASS_COLORS.textPrimary, letterSpacing: '-0.01em' }}>
                    Зарегистрируйтесь
                  </Typography>
                  <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary, flex: 1 }}>
                    Создайте аккаунт за 30 секунд. Это бесплатно и не требует подтверждения.
                  </Typography>
                </Box>

                <Box sx={{ 
                  flex: 1,
                  maxWidth: { md: '350px' },
                  p: 3,
                  textAlign: 'center',
                  background: GLASS_COLORS.surface,
                  backdropFilter: 'blur(20px)',
                  border: '1px solid',
                  borderColor: GLASS_COLORS.border,
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
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
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 16px 32px ${alpha(GLASS_COLORS.success, 0.15)}`,
                    borderColor: GLASS_COLORS.borderGlow,
                    '&::before': {
                      opacity: 1,
                    },
                  }
                }}>
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: alpha(GLASS_COLORS.success, 0.15),
                    backdropFilter: 'blur(10px)',
                    mb: 3,
                    position: 'relative',
                    border: '1px solid',
                    borderColor: alpha(GLASS_COLORS.success, 0.3),
                    '&::before': {
                      content: '"2"',
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${GLASS_COLORS.success}, ${alpha(GLASS_COLORS.success, 0.7)})`,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      border: '2px solid',
                      borderColor: GLASS_COLORS.surface,
                    }
                  }}>
                    <CategoryIcon sx={{ fontSize: 40, color: GLASS_COLORS.success }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: GLASS_COLORS.textPrimary, letterSpacing: '-0.01em' }}>
                    Выберите категории
                  </Typography>
                  <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary, flex: 1 }}>
                    Отметьте технологии, которые вам нужны для подготовки.
                  </Typography>
                </Box>

                <Box sx={{ 
                  flex: 1,
                  maxWidth: { md: '350px' },
                  p: 3,
                  textAlign: 'center',
                  background: GLASS_COLORS.surface,
                  backdropFilter: 'blur(20px)',
                  border: '1px solid',
                  borderColor: GLASS_COLORS.border,
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
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
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 16px 32px ${alpha(GLASS_COLORS.purple, 0.15)}`,
                    borderColor: GLASS_COLORS.borderGlow,
                    '&::before': {
                      opacity: 1,
                    },
                  }
                }}>
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: alpha(GLASS_COLORS.purple, 0.15),
                    backdropFilter: 'blur(10px)',
                    mb: 3,
                    position: 'relative',
                    border: '1px solid',
                    borderColor: alpha(GLASS_COLORS.purple, 0.3),
                    '&::before': {
                      content: '"3"',
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${GLASS_COLORS.purple}, ${alpha(GLASS_COLORS.purple, 0.7)})`,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      border: '2px solid',
                      borderColor: GLASS_COLORS.surface,
                    }
                  }}>
                    <StartLearningIcon sx={{ fontSize: 40, color: GLASS_COLORS.purple }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: GLASS_COLORS.textPrimary, letterSpacing: '-0.01em' }}>
                    Начните практиковаться
                  </Typography>
                  <Typography variant="body2" sx={{ color: GLASS_COLORS.textSecondary, flex: 1 }}>
                    Отвечайте на вопросы, проверяйте ответы и отслеживайте прогресс.
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {isAuthenticated && (
            <Box sx={{ mb: 10 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  justifyContent: 'center',
                  mb: 4, 
                  fontWeight: 600,
                  color: GLASS_COLORS.textPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  letterSpacing: '-0.02em',
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                  position: 'relative',
                  paddingLeft: '12px',
                  textShadow: '0 2px 10px rgba(255,255,255,0.5)',
                }}
              >
                <Box 
                  component="span"
                  sx={{
                    background: `linear-gradient(135deg, ${GLASS_COLORS.textPrimary} 0%, ${alpha(GLASS_COLORS.primary, 0.8)} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-4px',
                      left: 0,
                      width: '100%',
                      height: '2px',
                      background: `linear-gradient(90deg, ${GLASS_COLORS.primary} 0%, transparent 100%)`,
                      borderRadius: '2px',
                      opacity: 0.5,
                    }
                  }}
                >
                  Популярные категории
                </Box>
              </Typography>
              
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: GLASS_COLORS.primary }} />
                </Box>
              ) : categories.length > 0 ? (
                <>
                  <Box 
                    sx={{ 
                      display: { xs: 'flex', lg: 'none' },
                      gap: 2,
                      overflowX: 'auto',
                      pb: 2,
                      scrollbarWidth: 'thin',
                      scrollbarColor: `${GLASS_COLORS.border} transparent`,
                      '&::-webkit-scrollbar': {
                        height: 4,
                      },
                      '&::-webkit-scrollbar-track': {
                        background: alpha(GLASS_COLORS.background, 0.5),
                        borderRadius: 2,
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: alpha(GLASS_COLORS.textSecondary, 0.3),
                        borderRadius: 2,
                      },
                    }}
                  >
                    {categories.map((category) => (
                      <Box 
                        key={category.id}
                        sx={{ 
                          minWidth: { 
                            xs: 'calc(50% - 8px)', 
                            sm: 'calc(33.333% - 8px)', 
                            md: 'calc(25% - 8px)',
                            lg: 'calc(20% - 8px)'
                          },
                          flexShrink: 0,
                        }}
                      >
                        <GlassCategoryCard
                          category={category}
                          onClick={() => navigate(`/questions?category=${category.slug}`)}
                        />
                      </Box>
                    ))}
                  </Box>

                  <Grid 
                    container 
                    spacing={2} 
                    sx={{ 
                      display: { xs: 'none', lg: 'flex' },
                      justifyContent: 'center',
                    }}
                  >
                    {categories.map((category) => (
                      <Grid 
                        item 
                        xs={12}
                        sm={4}
                        md={2.4}
                        key={category.id}
                        sx={{
                          display: 'flex',
                        }}
                      >
                        <GlassCategoryCard
                          category={category}
                          onClick={() => navigate(`/questions?category=${category.slug}`)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </>
              ) : (
                <Typography 
                  sx={{ 
                    color: GLASS_COLORS.textSecondary,
                    textAlign: 'center',
                    py: 4 
                  }}
                >
                  Категории пока загружаются
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Container>

      <Fade in timeout={1500}>
        <Box sx={{ 
          py: 4,
          borderTop: '1px solid',
          borderColor: alpha(GLASS_COLORS.border, 0.3),
          background: GLASS_COLORS.surface,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${GLASS_COLORS.primary} 20%, ${GLASS_COLORS.secondary} 50%, ${GLASS_COLORS.primary} 80%, transparent 100%)`,
            opacity: 0.3,
          }
        }}>
          <Container maxWidth="lg">
            <Box sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 3
            }}>
              {/* Левая часть - логотип и описание */}
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: GLASS_COLORS.textPrimary,
                    fontSize: '1.35rem',
                    cursor: 'pointer',
                    letterSpacing: '-0.02em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    mb: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      color: GLASS_COLORS.primary,
                      transform: 'translateX(2px)',
                    }
                  }}
                  onClick={() => handleNavigation('/')}
                >
                  Interview<span style={{ color: GLASS_COLORS.primary }}>Box</span>
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: alpha(GLASS_COLORS.textSecondary, 0.8),
                    maxWidth: '320px',
                    fontSize: '0.9rem',
                    lineHeight: 1.5
                  }}
                >
                  Готовься к собеседованиям эффективно
                </Typography>
              </Box>

              {/* Правая часть - информация, Telegram и кнопка */}
              <Box sx={{ 
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 3
              }}>
                <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: alpha(GLASS_COLORS.textSecondary, 0.7),
                      fontSize: '0.85rem',
                      mb: 0.5
                    }}
                  >
                    © 2026 InterviewBox
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: alpha(GLASS_COLORS.textSecondary, 0.5),
                      fontSize: '0.75rem',
                      display: 'block'
                    }}
                  >
                    v1.0.0
                  </Typography>
                </Box>

                {/* Telegram кнопка */}
                <IconButton
                  component="a"
                  href="https://t.me/sandbox_devv" // Замените на ссылку вашего Telegram канала
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    color: GLASS_COLORS.textPrimary,
                    backgroundColor: alpha(GLASS_COLORS.primary, 0.1),
                    border: '1px solid',
                    borderColor: alpha(GLASS_COLORS.primary, 0.3),
                    borderRadius: '30px',
                    width: '40px',
                    height: '40px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: GLASS_COLORS.primary,
                      color: '#FFFFFF',
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.primary, 0.3)}`,
                    }
                  }}
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.732 8.166c-.129.58-.472.723-.956.45l-2.64-1.944-1.274 1.225c-.141.141-.26.26-.533.26l.191-2.67 4.87-4.395c.212-.189-.046-.295-.33-.106l-6.02 3.786-2.594-.81c-.563-.176-.574-.563.117-.833l10.133-3.91c.47-.173.881.104.727.816z"/>
                  </svg>
                </IconButton>

                <Button
                  variant="contained"
                  size="small"
                  endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                  onClick={() => navigate('/questions')}
                  sx={{
                    background: `linear-gradient(135deg, ${GLASS_COLORS.primary} 0%, ${GLASS_COLORS.secondary} 100%)`,
                    borderRadius: '30px',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    px: 3,
                    py: 1,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: alpha('#FFFFFF', 0.3),
                    boxShadow: `0 4px 10px ${alpha(GLASS_COLORS.primary, 0.2)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateX(2px)',
                      boxShadow: `0 6px 15px ${alpha(GLASS_COLORS.primary, 0.3)}`,
                    }
                  }}
                >
                  Практиковаться
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      </Fade>

      <ScrollToTop />
    </Box>
  );
};