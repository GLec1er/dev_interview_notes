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
  RestartAlt as RestartIcon,
  CheckCircle as CheckIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Psychology as PsychologyIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  ThumbUp as ThumbUpIcon,
  AccessTime as AccessTimeIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { questionService } from '../services/questionService';
import { categoryService } from '../services/categoryService';
import { answerService } from '../services/answerService';
import type { User } from '../types';
import { userService } from '../services/userService';

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
        minWidth: '160px',
        background: NEUTRAL_COLORS.surface,
        border: `1px solid ${NEUTRAL_COLORS.border}`,
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
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
      <CardContent sx={{ 
        p: 3, 
        textAlign: 'center',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
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
            fontSize: { xs: '2rem', md: '2.5rem' },
            lineHeight: 1,
          }}
        >
          {value.toLocaleString()}
        </Typography>
        <Typography 
          variant="subtitle1" 
          color={NEUTRAL_COLORS.textSecondary}
          sx={{ 
            fontWeight: 500, 
            fontSize: '0.95rem',
            textAlign: 'center',
            width: '100%',
          }}
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
          minWidth: 180,
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

const QuickStartModal: React.FC<QuickStartModalProps> = ({ open, onClose, isGuestMode = false }) => {
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
      // Статичные вопросы для гостей - ОТДЕЛЬНО ДЛЯ КАЖДОГО УРОВНЯ
      const allStaticQuestions: Record<string, Question[]> = {
        // EASY - Python (для beginner)
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
        
        // MEDIUM - Python (для intermediate)
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
        
        // HARD - Python (для expert)
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
      
      // Берем только вопросы нужной сложности
      const questionsForLevel = allStaticQuestions[difficulty] || [];
      setQuestions(questionsForLevel);
      
      // Статичные ответы для демо - все в одном объекте
      const allStaticAnswers: Record<string, Answer> = {
        // EASY - Python ответы
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

        // MEDIUM - Python ответы
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

        // HARD - Python ответы
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
      
      // Фильтруем ответы, оставляя только для выбранных вопросов
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
    
    // Остальной код для авторизованных пользователей остается без изменений
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
            <Typography 
              key={index} 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                color: NEUTRAL_COLORS.textPrimary,
                mt: 2,
                mb: 1
              }}
            >
              {block.data?.text}
            </Typography>
          );
        case 'paragraph':
          return (
            <Typography 
              key={index} 
              variant="body1" 
              paragraph 
              sx={{ 
                color: NEUTRAL_COLORS.textPrimary,
                lineHeight: 1.6 
              }}
            >
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
                my: 1.5,
                bgcolor: alpha(NEUTRAL_COLORS.textPrimary, 0.03),
                border: `1px solid ${alpha(NEUTRAL_COLORS.border, 0.5)}`,
                borderRadius: 1,
                fontFamily: '"Roboto Mono", monospace',
                fontSize: '0.85rem',
                overflow: 'auto',
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: NEUTRAL_COLORS.textSecondary, 
                  display: 'block', 
                  mb: 0.5,
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}
              >
                {block.data?.language || 'code'}
              </Typography>
              <pre style={{ 
                margin: 0, 
                whiteSpace: 'pre-wrap',
                color: NEUTRAL_COLORS.textPrimary,
                fontSize: '0.85rem',
                lineHeight: 1.4
              }}>
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
                my: 1.5,
                bgcolor: alpha(NEUTRAL_COLORS.accent, 0.08),
                borderLeft: `4px solid ${NEUTRAL_COLORS.accent}`,
                borderRadius: '0 8px 8px 0',
              }}
            >
              <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textPrimary }}>
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
          {isGuestMode ? 'Зарегистрируйтесь, чтобы увидеть полный ответ' : 'Ответ не найден'}
        </Typography>
      );
    }

    return content.map((block, index) => {
      switch (block.type) {
        case 'heading':
          return (
            <Typography 
              key={index} 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                color: NEUTRAL_COLORS.textPrimary,
                mt: 2,
                mb: 1
              }}
            >
              {block.data?.text}
            </Typography>
          );
        case 'paragraph':
          return (
            <Typography 
              key={index} 
              variant="body1" 
              paragraph 
              sx={{ 
                color: NEUTRAL_COLORS.textPrimary,
                lineHeight: 1.6 
              }}
            >
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
                my: 1.5,
                bgcolor: alpha(NEUTRAL_COLORS.textPrimary, 0.03),
                border: `1px solid ${alpha(NEUTRAL_COLORS.success, 0.3)}`,
                borderRadius: 1,
                fontFamily: '"Roboto Mono", monospace',
                fontSize: '0.85rem',
                overflow: 'auto',
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: NEUTRAL_COLORS.success, 
                  display: 'block', 
                  mb: 0.5,
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}
              >
                {block.data?.language || 'code'}
              </Typography>
              <pre style={{ 
                margin: 0, 
                whiteSpace: 'pre-wrap',
                color: NEUTRAL_COLORS.textPrimary,
                fontSize: '0.85rem',
                lineHeight: 1.4
              }}>
                {block.data?.code || block.data?.text || block.content}
              </pre>
            </Paper>
          );
        default:
          return (
            <Typography 
              key={index} 
              variant="body1" 
              paragraph 
              sx={{ 
                color: NEUTRAL_COLORS.textPrimary,
                lineHeight: 1.6 
              }}
            >
              {block.data?.text || block.content}
            </Typography>
          );
      }
    });
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
      fullScreen={window.innerWidth < 600} // Полноэкранный режим на очень маленьких экранах
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          overflow: 'hidden',
          bgcolor: NEUTRAL_COLORS.surface,
          minHeight: { xs: '100vh', sm: 'auto' },
          maxHeight: { xs: '100vh', sm: '90vh' },
          m: 0,
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: NEUTRAL_COLORS.accent,
        color: 'white',
        py: { xs: 2, sm: 3 },
        position: 'relative',
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
              fontWeight: 700,
              fontSize: { xs: '1.125rem', sm: '1.5rem' }
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
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                }} 
              />
            )}
          </Box>
          <IconButton 
            onClick={handleCloseModal} 
            sx={{ 
              color: 'white',
              ml: 'auto'
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
              '& .MuiLinearProgress-bar': {
                bgcolor: NEUTRAL_COLORS.accent,
              }
            }}
          />
        )}

        {step === 'level' && (
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h6" gutterBottom align="center" sx={{ 
              mb: { xs: 3, sm: 4 }, 
              color: NEUTRAL_COLORS.textPrimary,
              fontSize: { xs: '1rem', sm: '1.25rem' }
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
                      elevation={userLevel === level ? 4 : 0}
                      sx={{
                        cursor: 'pointer',
                        border: `2px solid ${userLevel === level ? NEUTRAL_COLORS.accent : NEUTRAL_COLORS.border}`,
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        width: '100%',
                        maxWidth: { xs: '280px', sm: '300px' },
                        minWidth: { xs: '180px', sm: '200px' },
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          borderColor: NEUTRAL_COLORS.accent,
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
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
                        bgcolor: NEUTRAL_COLORS.background,
                      }}>
                        <Box>
                          <Box sx={{ 
                            mb: { xs: 1.5, sm: 2 },
                            color: userLevel === level ? NEUTRAL_COLORS.accent : NEUTRAL_COLORS.textSecondary,
                            display: 'inline-flex',
                            p: { xs: 1.5, sm: 2 },
                            borderRadius: '50%',
                            bgcolor: userLevel === level ? alpha(NEUTRAL_COLORS.accent, 0.1) : alpha(NEUTRAL_COLORS.border, 0.3),
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
                              color: NEUTRAL_COLORS.textPrimary,
                              minHeight: { xs: '50px', sm: '60px' },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: { xs: '1rem', sm: '1.125rem' }
                            }}
                          >
                            {getLevelTitle(level)}
                          </Typography>
                        </Box>
                        
                        <Chip
                          label={getDifficultyByLevel(level).toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: alpha(getDifficultyColor(getDifficultyByLevel(level)), 0.1),
                            color: getDifficultyColor(getDifficultyByLevel(level)),
                            fontWeight: 600,
                            minWidth: '50px',
                            justifyContent: 'center',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
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
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                  bgcolor: NEUTRAL_COLORS.accent,
                  '&:hover': {
                    bgcolor: alpha(NEUTRAL_COLORS.accent, 0.9),
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
                  color: NEUTRAL_COLORS.accent 
                }} />
                <Typography variant="h6" gutterBottom color={NEUTRAL_COLORS.textPrimary}>
                  Загружаем вопросы...
                </Typography>
                <Typography variant="body2" color={NEUTRAL_COLORS.textSecondary}>
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
                  <TimerIcon sx={{ 
                    fontSize: { xs: 60, sm: 70, md: 80 }, 
                    color: NEUTRAL_COLORS.accent 
                  }} />
                </Box>
                
                <Typography variant="h4" gutterBottom sx={{ 
                  fontWeight: 700, 
                  color: NEUTRAL_COLORS.textPrimary,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}>
                  Готовы?
                </Typography>
                <Typography variant="body1" color={NEUTRAL_COLORS.textSecondary} sx={{ 
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
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: { xs: '0.9375rem', sm: '1.1rem' },
                    bgcolor: NEUTRAL_COLORS.success,
                    '&:hover': {
                      bgcolor: alpha(NEUTRAL_COLORS.success, 0.9),
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
                bgcolor: alpha(NEUTRAL_COLORS.accent, 0.05),
                borderBottom: `1px solid ${NEUTRAL_COLORS.border}`,
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
                    <TimerIcon sx={{ color: NEUTRAL_COLORS.accent }} />
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700, 
                      color: NEUTRAL_COLORS.accent,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}>
                      {formatTime(timeLeft)}
                    </Typography>
                  </Box>
                  <Chip
                    label={`Вопрос ${currentQuestionIndex + 1} из ${questions.length}`}
                    size="small"
                    sx={{ 
                      fontWeight: 600, 
                      color: NEUTRAL_COLORS.accent,
                      fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                    }}
                  />
                </Box>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<RestartIcon />}
                  onClick={handleReset}
                  size="small"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' }
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
              bgcolor: NEUTRAL_COLORS.surface 
            }}>
              {isLoading ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%' 
                }}>
                  <CircularProgress />
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
                          bgcolor: alpha(getDifficultyColor(questions[currentQuestionIndex].difficulty), 0.1),
                          color: getDifficultyColor(questions[currentQuestionIndex].difficulty),
                          fontWeight: 600,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}
                      />
                      {questions[currentQuestionIndex].category_name && (
                        <Chip
                          icon={<CategoryIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                          label={questions[currentQuestionIndex].category_name}
                          size="small"
                          sx={{ 
                            fontWeight: 500,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}
                        />
                      )}
                    </Stack>
                    
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      mb: 2, 
                      color: NEUTRAL_COLORS.textPrimary,
                      fontSize: { xs: '1rem', sm: '1.125rem' }
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
                    borderTop: `1px solid ${NEUTRAL_COLORS.border}`,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 2, sm: 0 }
                  }}>
                    <Button
                      startIcon={<ChevronLeftIcon />}
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                      sx={{ 
                        color: NEUTRAL_COLORS.textPrimary,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Назад
                    </Button>
                    
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
                          width: { xs: '100%', sm: 'auto' }
                        }}
                      >
                        Завершить тест
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        endIcon={<ChevronRightIcon />}
                        onClick={handleNextQuestion}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
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
          <Box sx={{ 
            p: { xs: 2, sm: 3 }, 
            bgcolor: NEUTRAL_COLORS.surface,
            height: { xs: 'calc(100vh - 64px)', sm: 'auto' },
            overflow: 'auto'
          }}>
            <Box sx={{ 
              textAlign: 'center', 
              mb: 4, 
              p: { xs: 2, sm: 3 }, 
              bgcolor: alpha(NEUTRAL_COLORS.success, 0.1), 
              borderRadius: 2 
            }}>
              <CheckIcon sx={{ 
                fontSize: { xs: 48, sm: 60 }, 
                color: NEUTRAL_COLORS.success, 
                mb: 2 
              }} />
              <Typography variant="h5" gutterBottom sx={{ 
                fontWeight: 700, 
                color: NEUTRAL_COLORS.textPrimary,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}>
                Тест завершен!
              </Typography>
              <Typography variant="body1" color={NEUTRAL_COLORS.textSecondary}>
                Вы ответили на все вопросы за {formatTime((isGuestMode ? 300 : 600) - timeLeft)}
              </Typography>
              {isGuestMode && (
                <Typography variant="body2" sx={{ 
                  mt: 2, 
                  color: NEUTRAL_COLORS.accent, 
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                }}>
                  🔒 Полный доступ к 1156+ вопросам — после регистрации
                </Typography>
              )}
            </Box>

            <Typography variant="h6" gutterBottom sx={{ 
              fontWeight: 600, 
              color: NEUTRAL_COLORS.textPrimary,
              fontSize: { xs: '1rem', sm: '1.125rem' }
            }}>
              Вопросы и ответы для проверки:
            </Typography>

            <Box sx={{ 
              maxHeight: { xs: 'calc(100vh - 400px)', sm: '400px' }, 
              overflow: 'auto', 
              bgcolor: NEUTRAL_COLORS.background 
            }}>
              {questions.map((question, index) => (
                <Paper
                  key={question.id}
                  elevation={0}
                  sx={{
                    mb: 2,
                    border: `1px solid ${NEUTRAL_COLORS.border}`,
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: NEUTRAL_COLORS.surface,
                  }}
                >
                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      bgcolor: alpha(NEUTRAL_COLORS.accent, 0.05),
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      justifyContent: 'space-between',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 0 }
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
                        fontWeight: 600, 
                        color: NEUTRAL_COLORS.textPrimary,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}>
                        Вопрос {index + 1}: {question.title}
                      </Typography>
                      <Chip
                        label={question.difficulty.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: alpha(getDifficultyColor(question.difficulty), 0.1),
                          color: getDifficultyColor(question.difficulty),
                          fontWeight: 600,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}
                      />
                    </Box>
                    {expandedQuestions.includes(question.id) ? 
                      <ExpandLessIcon sx={{ mt: { xs: 1, sm: 0 } }} /> : 
                      <ExpandMoreIcon sx={{ mt: { xs: 1, sm: 0 } }} />
                    }
                  </Box>

                  <Collapse in={expandedQuestions.includes(question.id)}>
                    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: NEUTRAL_COLORS.surface }}>
                      <Typography 
                        variant="subtitle2" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600, 
                          color: NEUTRAL_COLORS.textSecondary,
                          mb: 2,
                          fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                        }}
                      >
                        Вопрос:
                      </Typography>
                      {renderQuestionContent(question.content)}
                      
                      <Divider sx={{ my: 3 }} />
                      
                      <Typography 
                        variant="subtitle2" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600, 
                          color: NEUTRAL_COLORS.success,
                          mb: 2,
                          fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                        }}
                      >
                        Ответ:
                      </Typography>
                      {answers[question.id] ? (
                        renderAnswerContent(answers[question.id].content)
                      ) : (
                        <Typography variant="body2" color={NEUTRAL_COLORS.textSecondary} fontStyle="italic">
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
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  width: { xs: '100%', sm: 'auto' }
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
                    fontWeight: 600, 
                    bgcolor: NEUTRAL_COLORS.success,
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  Зарегистрироваться для полного доступа
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleCloseModal}
                  sx={{ 
                    fontWeight: 600,
                    width: { xs: '100%', sm: 'auto' }
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
          bgcolor: alpha(NEUTRAL_COLORS.background, 0.5) 
        }}>
          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" color={NEUTRAL_COLORS.textSecondary}>
            {isGuestMode 
              ? 'Демо-режим • 3 вопроса • 5 минут' 
              : 'Быстрый старт • 5 вопросов • 10 минут'}
          </Typography>
        </DialogActions>
      )}
    </Dialog>
  );
};

const QuickStartCard = memo(({ isAuthenticated }: { isAuthenticated: boolean }) => {
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
            background: `linear-gradient(135deg, ${alpha(NEUTRAL_COLORS.accent, 0.9)} 0%, ${alpha(NEUTRAL_COLORS.accent, 0.7)} 100%)`,
            color: 'white',
            borderRadius: { xs: 2, sm: 3 },
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
                  fontWeight: 700,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }}>
                  Быстрый старт
                </Typography>
              </Box>
              
              {!isAuthenticated && (
                <Chip 
                  label="Для гостей" 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' }
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
                  color: NEUTRAL_COLORS.accent,
                  fontWeight: 600,
                  px: { xs: 2.5, sm: 3 },
                  py: { xs: 0.75, sm: 1 },
                  borderRadius: 2,
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { xs: 'auto', sm: '120px' },
                  '&:hover': {
                    backgroundColor: alpha('#FFFFFF', 0.9),
                  }
                }}
              >
                {isAuthenticated ? 'Начать сейчас' : 'Попробовать'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Zoom>

      <QuickStartModal
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

  const handleCardClick = (category: ApiCategory) => {
    navigate(`/questions?category=${category.id}`);
  };

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
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: NEUTRAL_COLORS.accent,
                    marginLeft: '6px',
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    alignSelf: 'flex-start',
                    marginTop: '2px'
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
                  maxWidth: '780px',
                  mx: 'auto',
                  lineHeight: 1.6,
                  fontWeight: 400,
                  fontSize: { xs: '1.125rem', md: '1.5rem' }
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

        {!isAuthenticated && (
          <Fade in timeout={1500}>
            <Box sx={{ 
              mt: { xs: 3, sm: 4, md: 4 }, // Отступы для разных экранов
              textAlign: 'center',
              px: { xs: 2, sm: 3 } // Горизонтальные отступы для мобильных
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: { xs: 1.5, sm: 2 }, // Отступ снизу адаптивный
                  color: NEUTRAL_COLORS.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: { xs: 0.5, sm: 1, md: 1.5 }, // Расстояние между элементами
                  flexWrap: { xs: 'wrap', sm: 'nowrap' }, // На мобильных - перенос строк
                  flexDirection: { xs: 'column', sm: 'row' }, // На мобильных - вертикально
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' } // Размер шрифта
                }}
              >
                {/* Первая фича - на мобильных может быть отдельно */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 0.5,
                    mb: { xs: 0.5, sm: 0 } // Отступ снизу только на мобильных
                  }}
                >
                  <CheckIcon fontSize="small" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} /> 
                  <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                    Различные вопросы
                  </Box>
                </Box>
                
                {/* Разделитель - скрываем на мобильных */}
                <Box 
                  component="span" 
                  sx={{ 
                    display: { xs: 'none', sm: 'inline' },
                    mx: 0.5,
                    color: NEUTRAL_COLORS.border
                  }}
                >
                  •
                </Box>
                
                {/* Вторая фича */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 0.5,
                    mb: { xs: 0.5, sm: 0 }
                  }}
                >
                  <CheckIcon fontSize="small" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} /> 
                  <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                    Удобное отслеживание
                  </Box>
                </Box>
                
                {/* Разделитель - скрываем на мобильных */}
                <Box 
                  component="span" 
                  sx={{ 
                    display: { xs: 'none', sm: 'inline' },
                    mx: 0.5,
                    color: NEUTRAL_COLORS.border
                  }}
                >
                  •
                </Box>
                
                {/* Третья фича */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <CheckIcon fontSize="small" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} /> 
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
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <StatCard
                  title="Вопросов"
                  value={stats.questions || "1156"}
                  color={NEUTRAL_COLORS.accent}
                  icon={<QuestionsIcon sx={{ fontSize: 32 }} />}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <StatCard
                  title="Категорий"
                  value={stats.categories || "26"}
                  color={NEUTRAL_COLORS.success}
                  icon={<CategoryIcon sx={{ fontSize: 32 }} />}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <StatCard
                  title="Пользователей"
                  value={users.length + 56 || "135"}
                  color={NEUTRAL_COLORS.warning}
                  icon={<PeopleIcon sx={{ fontSize: 32 }} />}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <StatCard
                  title="Успешность"
                  value={100}
                  color={NEUTRAL_COLORS.purple}
                  icon={<TrendingIcon sx={{ fontSize: 32 }} />}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Быстрый старт карточка (для всех) */}
          <Box sx={{ mb: { xs: 4, sm: 6, md: 8 } }}>
            <QuickStartCard isAuthenticated={isAuthenticated} />
          </Box>

          {/* Отзывы для неавторизованных - исправленные цвета */}
          {!isAuthenticated && (
          <Box sx={{ mb: 12, position: 'relative' }}>
            {/* Декоративные элементы */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                left: '10%',
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(NEUTRAL_COLORS.accent, 0.1)} 0%, transparent 70%)`,
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                right: '15%',
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(NEUTRAL_COLORS.purple, 0.05)} 0%, transparent 70%)`,
                zIndex: 0,
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 800,
                      color: NEUTRAL_COLORS.textPrimary,
                      textAlign: 'center',
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        display: 'block',
                        width: 60,
                        height: 4,
                        background: `linear-gradient(90deg, ${NEUTRAL_COLORS.accent}, ${NEUTRAL_COLORS.purple})`,
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
                      color: NEUTRAL_COLORS.textSecondary,
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
                        backgroundColor: NEUTRAL_COLORS.surface,
                        border: `1px solid ${NEUTRAL_COLORS.border}`,
                        borderRadius: 3,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: `linear-gradient(90deg, ${NEUTRAL_COLORS.accent}, ${alpha(NEUTRAL_COLORS.accent, 0.5)})`,
                        },
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 20px 40px ${alpha(NEUTRAL_COLORS.accent, 0.15)}`,
                          borderColor: NEUTRAL_COLORS.accent,
                          '& .company-badge': {
                            transform: 'scale(1.1)',
                            boxShadow: `0 8px 25px ${alpha(NEUTRAL_COLORS.accent, 0.3)}`,
                          },
                          '& .quote-icon': {
                            opacity: 1,
                            transform: 'translateY(0)',
                          }
                        }
                      }}
                    >
                      {/* Иконка цитаты */}
                      <Box 
                        className="quote-icon"
                        sx={{
                          position: 'absolute',
                          top: 20,
                          right: 20,
                          opacity: 0.3,
                          transform: 'translateY(-10px)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 7H6C5.46957 7 4.96086 7.21071 4.58579 7.58579C4.21071 7.96086 4 8.46957 4 9V14C4 14.5304 4.21071 15.0391 4.58579 15.4142C4.96086 15.7893 5.46957 16 6 16H9V19C9 19.5304 9.21071 20.0391 9.58579 20.4142C9.96086 20.7893 10.4696 21 11 21C11.5304 21 12.0391 20.7893 12.4142 20.4142C12.7893 20.0391 13 19.5304 13 19V16C13 15.4696 12.7893 14.9609 12.4142 14.5858C12.0391 14.2107 11.5304 14 11 14H10V7Z" fill={alpha(NEUTRAL_COLORS.accent, 0.2)} />
                          <path d="M20 7H16C15.4696 7 14.9609 7.21071 14.5858 7.58579C14.2107 7.96086 14 8.46957 14 9V14C14 14.5304 14.2107 15.0391 14.5858 15.4142C14.9609 15.7893 15.4696 16 16 16H19V19C19 19.5304 19.2107 20.0391 19.5858 20.4142C19.9609 20.7893 20.4696 21 21 21C21.5304 21 22.0391 20.7893 22.4142 20.4142C22.7893 20.0391 23 19.5304 23 19V16C23 15.4696 22.7893 14.9609 22.4142 14.5858C22.0391 14.2107 21.5304 14 21 14H20V7Z" fill={alpha(NEUTRAL_COLORS.accent, 0.2)} />
                        </svg>
                      </Box>

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
                            backgroundColor: NEUTRAL_COLORS.accent,
                            border: `2px solid ${NEUTRAL_COLORS.surface}`,
                          }
                        }}>
                          <Box sx={{ 
                            width: 56, 
                            height: 56, 
                            borderRadius: '50%', 
                            background: `linear-gradient(135deg, ${NEUTRAL_COLORS.accent}, ${alpha(NEUTRAL_COLORS.accent, 0.7)})`,
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'white',
                            boxShadow: `0 4px 15px ${alpha(NEUTRAL_COLORS.accent, 0.3)}`,
                          }}>
                            А
                          </Box>
                        </Box>
                        
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: NEUTRAL_COLORS.textPrimary, mb: 0.5 }}>
                            Алексей
                          </Typography>
                          <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TrendingUpIcon fontSize="small" /> Senior Frontend Developer
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body1" sx={{ 
                        color: NEUTRAL_COLORS.textPrimary, 
                        lineHeight: 1.7,
                        fontStyle: 'italic',
                        position: 'relative',
                        pl: 2,
                        '&::before': {
                          content: '"❝"',
                          position: 'absolute',
                          left: -10,
                          top: -5,
                          color: NEUTRAL_COLORS.accent,
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
                        backgroundColor: NEUTRAL_COLORS.surface,
                        border: `1px solid ${NEUTRAL_COLORS.border}`,
                        borderRadius: 3,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: `linear-gradient(90deg, ${NEUTRAL_COLORS.success}, ${alpha(NEUTRAL_COLORS.success, 0.5)})`,
                        },
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 20px 40px ${alpha(NEUTRAL_COLORS.success, 0.15)}`,
                          borderColor: NEUTRAL_COLORS.success,
                          '& .company-badge': {
                            transform: 'scale(1.1)',
                            boxShadow: `0 8px 25px ${alpha(NEUTRAL_COLORS.success, 0.3)}`,
                          },
                          '& .quote-icon': {
                            opacity: 1,
                            transform: 'translateY(0)',
                          }
                        }
                      }}
                    >
                      <Box 
                        className="quote-icon"
                        sx={{
                          position: 'absolute',
                          top: 20,
                          right: 20,
                          opacity: 0.3,
                          transform: 'translateY(-10px)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 7H6C5.46957 7 4.96086 7.21071 4.58579 7.58579C4.21071 7.96086 4 8.46957 4 9V14C4 14.5304 4.21071 15.0391 4.58579 15.4142C4.96086 15.7893 5.46957 16 6 16H9V19C9 19.5304 9.21071 20.0391 9.58579 20.4142C9.96086 20.7893 10.4696 21 11 21C11.5304 21 12.0391 20.7893 12.4142 20.4142C12.7893 20.0391 13 19.5304 13 19V16C13 15.4696 12.7893 14.9609 12.4142 14.5858C12.0391 14.2107 11.5304 14 11 14H10V7Z" fill={alpha(NEUTRAL_COLORS.success, 0.2)} />
                          <path d="M20 7H16C15.4696 7 14.9609 7.21071 14.5858 7.58579C14.2107 7.96086 14 8.46957 14 9V14C14 14.5304 14.2107 15.0391 14.5858 15.4142C14.9609 15.7893 15.4696 16 16 16H19V19C19 19.5304 19.2107 20.0391 19.5858 20.4142C19.9609 20.7893 20.4696 21 21 21C21.5304 21 22.0391 20.7893 22.4142 20.4142C22.7893 20.0391 23 19.5304 23 19V16C23 15.4696 22.7893 14.9609 22.4142 14.5858C22.0391 14.2107 21.5304 14 21 14H20V7Z" fill={alpha(NEUTRAL_COLORS.success, 0.2)} />
                        </svg>
                      </Box>

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
                            backgroundColor: NEUTRAL_COLORS.success,
                            border: `2px solid ${NEUTRAL_COLORS.surface}`,
                          }
                        }}>
                          <Box sx={{ 
                            width: 56, 
                            height: 56, 
                            borderRadius: '50%', 
                            background: `linear-gradient(135deg, ${NEUTRAL_COLORS.success}, ${alpha(NEUTRAL_COLORS.success, 0.7)})`,
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'white',
                            boxShadow: `0 4px 15px ${alpha(NEUTRAL_COLORS.success, 0.3)}`,
                          }}>
                            М
                          </Box>
                        </Box>
                        
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: NEUTRAL_COLORS.textPrimary, mb: 0.5 }}>
                            Мария
                          </Typography>
                          <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <SchoolIcon fontSize="small" /> Junior Backend Developer
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body1" sx={{ 
                        color: NEUTRAL_COLORS.textPrimary, 
                        lineHeight: 1.7,
                        fontStyle: 'italic',
                        position: 'relative',
                        pl: 2,
                        '&::before': {
                          content: '"❝"',
                          position: 'absolute',
                          left: -10,
                          top: -5,
                          color: NEUTRAL_COLORS.success,
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
                        backgroundColor: NEUTRAL_COLORS.surface,
                        border: `1px solid ${NEUTRAL_COLORS.border}`,
                        borderRadius: 3,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: `linear-gradient(90deg, ${NEUTRAL_COLORS.purple}, ${alpha(NEUTRAL_COLORS.purple, 0.5)})`,
                        },
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 20px 40px ${alpha(NEUTRAL_COLORS.purple, 0.15)}`,
                          borderColor: NEUTRAL_COLORS.purple,
                          '& .company-badge': {
                            transform: 'scale(1.1)',
                            boxShadow: `0 8px 25px ${alpha(NEUTRAL_COLORS.purple, 0.3)}`,
                          },
                          '& .quote-icon': {
                            opacity: 1,
                            transform: 'translateY(0)',
                          }
                        }
                      }}
                    >
                      <Box 
                        className="quote-icon"
                        sx={{
                          position: 'absolute',
                          top: 20,
                          right: 20,
                          opacity: 0.3,
                          transform: 'translateY(-10px)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 7H6C5.46957 7 4.96086 7.21071 4.58579 7.58579C4.21071 7.96086 4 8.46957 4 9V14C4 14.5304 4.21071 15.0391 4.58579 15.4142C4.96086 15.7893 5.46957 16 6 16H9V19C9 19.5304 9.21071 20.0391 9.58579 20.4142C9.96086 20.7893 10.4696 21 11 21C11.5304 21 12.0391 20.7893 12.4142 20.4142C12.7893 20.0391 13 19.5304 13 19V16C13 15.4696 12.7893 14.9609 12.4142 14.5858C12.0391 14.2107 11.5304 14 11 14H10V7Z" fill={alpha(NEUTRAL_COLORS.purple, 0.2)} />
                          <path d="M20 7H16C15.4696 7 14.9609 7.21071 14.5858 7.58579C14.2107 7.96086 14 8.46957 14 9V14C14 14.5304 14.2107 15.0391 14.5858 15.4142C14.9609 15.7893 15.4696 16 16 16H19V19C19 19.5304 19.2107 20.0391 19.5858 20.4142C19.9609 20.7893 20.4696 21 21 21C21.5304 21 22.0391 20.7893 22.4142 20.4142C22.7893 20.0391 23 19.5304 23 19V16C23 15.4696 22.7893 14.9609 22.4142 14.5858C22.0391 14.2107 21.5304 14 21 14H20V7Z" fill={alpha(NEUTRAL_COLORS.purple, 0.2)} />
                        </svg>
                      </Box>

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
                            backgroundColor: NEUTRAL_COLORS.purple,
                            border: `2px solid ${NEUTRAL_COLORS.surface}`,
                          }
                        }}>
                          <Box sx={{ 
                            width: 56, 
                            height: 56, 
                            borderRadius: '50%', 
                            background: `linear-gradient(135deg, ${NEUTRAL_COLORS.purple}, ${alpha(NEUTRAL_COLORS.purple, 0.7)})`,
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'white',
                            boxShadow: `0 4px 15px ${alpha(NEUTRAL_COLORS.purple, 0.3)}`,
                          }}>
                            Д
                          </Box>
                        </Box>
                        
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: NEUTRAL_COLORS.textPrimary, mb: 0.5 }}>
                            Дмитрий
                          </Typography>
                          <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <WorkIcon fontSize="small" /> Team Lead
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body1" sx={{ 
                        color: NEUTRAL_COLORS.textPrimary, 
                        lineHeight: 1.7,
                        fontStyle: 'italic',
                        position: 'relative',
                        pl: 2,
                        '&::before': {
                          content: '"❝"',
                          position: 'absolute',
                          left: -10,
                          top: -5,
                          color: NEUTRAL_COLORS.purple,
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

          {/* Как это работает для неавторизованных - в одну линию */}
          {!isAuthenticated && (
            <Box sx={{ mb: 10 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 6, 
                  fontWeight: 700,
                  color: NEUTRAL_COLORS.textPrimary,
                  textAlign: 'center'
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
                {/* Шаг 1 */}
                <Box sx={{ 
                  flex: 1,
                  maxWidth: { md: '350px' },
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: NEUTRAL_COLORS.surface,
                  border: `1px solid ${NEUTRAL_COLORS.border}`,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-4px)',
                  }
                }}>
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                    mb: 3,
                    position: 'relative',
                    '&::before': {
                      content: '"1"',
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundColor: NEUTRAL_COLORS.accent,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.875rem'
                    }
                  }}>
                    <LoginIcon sx={{ fontSize: 40, color: NEUTRAL_COLORS.accent }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: NEUTRAL_COLORS.textPrimary }}>
                    Зарегистрируйтесь
                  </Typography>
                  <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary, flex: 1 }}>
                    Создайте аккаунт за 30 секунд. Это бесплатно и не требует подтверждения.
                  </Typography>
                </Box>

                {/* Шаг 2 */}
                <Box sx={{ 
                  flex: 1,
                  maxWidth: { md: '350px' },
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: NEUTRAL_COLORS.surface,
                  border: `1px solid ${NEUTRAL_COLORS.border}`,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-4px)',
                  }
                }}>
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                    mb: 3,
                    position: 'relative',
                    '&::before': {
                      content: '"2"',
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundColor: NEUTRAL_COLORS.success,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.875rem'
                    }
                  }}>
                    <CategoryIcon sx={{ fontSize: 40, color: NEUTRAL_COLORS.success }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: NEUTRAL_COLORS.textPrimary }}>
                    Выберите категории
                  </Typography>
                  <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary, flex: 1 }}>
                    Отметьте технологии, которые вам нужны для подготовки.
                  </Typography>
                </Box>

                {/* Шаг 3 */}
                <Box sx={{ 
                  flex: 1,
                  maxWidth: { md: '350px' },
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: NEUTRAL_COLORS.surface,
                  border: `1px solid ${NEUTRAL_COLORS.border}`,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-4px)',
                  }
                }}>
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: alpha(NEUTRAL_COLORS.purple, 0.1),
                    mb: 3,
                    position: 'relative',
                    '&::before': {
                      content: '"3"',
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundColor: NEUTRAL_COLORS.purple,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.875rem'
                    }
                  }}>
                    <StartLearningIcon sx={{ fontSize: 40, color: NEUTRAL_COLORS.purple }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: NEUTRAL_COLORS.textPrimary }}>
                    Начните практиковаться
                  </Typography>
                  <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary, flex: 1 }}>
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
              
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: NEUTRAL_COLORS.accent }} />
                </Box>
              ) : categories.length > 0 ? (
                <>
                  {/* Для мобильных - горизонтальный скролл */}
                  <Box 
                    sx={{ 
                      display: { xs: 'flex', lg: 'none' },
                      gap: 2,
                      overflowX: 'auto',
                      pb: 2,
                      scrollbarWidth: 'thin',
                      scrollbarColor: `${NEUTRAL_COLORS.border} transparent`,
                      '&::-webkit-scrollbar': {
                        height: 4,
                      },
                      '&::-webkit-scrollbar-track': {
                        background: alpha(NEUTRAL_COLORS.background, 0.5),
                        borderRadius: 2,
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: alpha(NEUTRAL_COLORS.textSecondary, 0.3),
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
                            lg: 'calc(20% - 8px)' // 5 карточек на 900px+
                          },
                          flexShrink: 0,
                        }}
                      >
                        <CategoryCard
                          category={category}
                          sx={{
                            height: '100%',
                            p: 2,
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          }}
                        />
                      </Box>
                    ))}
                  </Box>

                  {/* Для планшетов и десктопов - сетка */}
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
                        <CategoryCard
                          category={category}
                          sx={{
                            flex: 1,
                            p: { sm: 2, md: 2.5 },
                            borderRadius: { sm: 2, md: 2.5 },
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                            }
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </>
              ) : (
                <Typography 
                  sx={{ 
                    color: NEUTRAL_COLORS.textSecondary,
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
          py: 6, 
          borderTop: `1px solid ${NEUTRAL_COLORS.border}`,
          backgroundColor: NEUTRAL_COLORS.surface,
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
                  Платформа для подготовки к техническим собеседованиям
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
                  Платформа подготовки к собеседованиям • v1.0.0
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