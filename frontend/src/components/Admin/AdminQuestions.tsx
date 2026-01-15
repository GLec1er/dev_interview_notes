// components/Admin/AdminQuestions.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Stack,
  IconButton,
  Paper,
  alpha,
  Tabs,
  Tab,
  Tooltip,
  Switch,
  FormControlLabel,
  Pagination,
  InputAdornment,
  TableSortLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as PublishedIcon,
  VisibilityOff as DraftIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import { questionService } from '../../services/questionService';
import { categoryService } from '../../services/categoryService';
import type { Question, Category, ContentBlock } from '../../types';
import { ContentEditor } from './ContentEditor';

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

const ITEMS_PER_PAGE = 10;

const StyledButton = ({ 
  children, 
  variant = 'contained', 
  color = 'primary', 
  startIcon, 
  onClick,
  size = 'medium',
  disabled = false
}: any) => (
  <Button
    variant={variant}
    color={color}
    startIcon={startIcon}
    onClick={onClick}
    size={size}
    disabled={disabled}
    sx={{
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: 2,
      px: variant === 'contained' ? 3 : 2,
      transition: 'all 0.2s ease',
      ...(variant === 'contained' && {
        background: `linear-gradient(135deg, ${NEUTRAL_COLORS.accent} 0%, ${alpha(NEUTRAL_COLORS.accent, 0.9)} 100%)`,
        boxShadow: '0 2px 8px rgba(49, 130, 206, 0.2)',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(49, 130, 206, 0.3)',
          transform: 'translateY(-1px)',
        }
      }),
      ...(variant === 'outlined' && {
        borderWidth: 1.5,
        borderColor: NEUTRAL_COLORS.border,
        color: NEUTRAL_COLORS.textPrimary,
        '&:hover': {
          borderColor: NEUTRAL_COLORS.accent,
          backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
        }
      })
    }}
  >
    {children}
  </Button>
);

const StyledTableRow = ({ children, hover = true }: any) => (
  <TableRow
    sx={{
      '&:nth-of-type(even)': {
        backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
      },
      '&:hover': hover ? {
        backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
      } : {},
      transition: 'background-color 0.2s ease',
    }}
  >
    {children}
  </TableRow>
);

export const AdminQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [contentTab, setContentTab] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    is_published: false,
    category_id: '',
  });
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  
  // Пагинация
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Поиск
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Сортировка
  const [sortBy, setSortBy] = useState<string>('updated_at');
  const [sortDir, setSortDir] = useState<string>('desc');
  
  // Фильтры
  const [difficulty, setDifficulty] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');

  // Дебаунс для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await questionService.getQuestions(
        page, 
        ITEMS_PER_PAGE, 
        undefined, // is_published
        difficulty || undefined, 
        sortBy, 
        sortDir,
        categoryId || undefined,
        false, // exclude_inactive_categories
      );
      
      setQuestions(data.items);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      console.error('Failed to load questions:', err);
      setError('Failed to load questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, difficulty, sortBy, sortDir, categoryId]);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      const data = await categoryService.getCategories(1, 100, true);
      setCategories(data.items);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories.');
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Фильтрация по поиску
  useEffect(() => {
    if (debouncedSearch) {
      const filtered = questions.filter(q =>
        q.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        q.slug.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      setFilteredQuestions(filtered);
    } else {
      setFilteredQuestions(questions);
    }
  }, [questions, debouncedSearch]);

  const handleOpenDialog = async (question?: Question) => {
    if (question) {
      try {
        // Загружаем полную информацию о вопросе
        const fullQuestion = await questionService.getQuestion(question.id);
        
        setEditingQuestion(fullQuestion);
        setFormData({
          title: fullQuestion.title,
          slug: fullQuestion.slug,
          difficulty: fullQuestion.difficulty,
          is_published: fullQuestion.is_published,
          // Используем category_id из вопроса, если он есть
          category_id: fullQuestion.category_id || question.category_id || '',
        });
        
        // Конвертируем контент в правильный формат
        const convertedContent = (fullQuestion.content || []).map(block => {
          if (block.type === 'code' && block.data) {
            const data = block.data as any;
            if (data.content !== undefined && data.code === undefined) {
              return {
                ...block,
                data: {
                  ...data,
                  code: data.content,
                  content: undefined
                }
              };
            }
          }
          return block;
        });
        setContent(convertedContent);
      } catch (err) {
        console.error('Failed to load question details:', err);
        // Если не удалось загрузить полную информацию, используем базовую
        setEditingQuestion(question);
        setFormData({
          title: question.title,
          slug: question.slug,
          difficulty: question.difficulty,
          is_published: question.is_published,
          category_id: question.category_id || '',
        });
        
        // Конвертируем для базового вопроса
        const convertedContent = (question.content || []).map(block => {
          if (block.type === 'code' && block.data) {
            const data = block.data as any;
            if (data.content !== undefined && data.code === undefined) {
              return {
                ...block,
                data: {
                  ...data,
                  code: data.content,
                  content: undefined
                }
              };
            }
          }
          return block;
        });
        setContent(convertedContent);
      }
    } else {
      setEditingQuestion(null);
      setFormData({
        title: '',
        slug: '',
        difficulty: 'easy',
        is_published: false,
        category_id: '',
      });
      setContent([]);
    }
    setContentTab(0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuestion(null);
    setContent([]);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setError(null);

      if (!formData.category_id) {
        setError('Please select a category');
        return;
      }

      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }

      if (!formData.slug.trim()) {
        setError('Slug is required');
        return;
      }

      const questionData = {
        title: formData.title,
        slug: formData.slug,
        difficulty: formData.difficulty,
        is_published: formData.is_published,
        content: content,
        category_id: formData.category_id,
      };

      if (editingQuestion) {
        await questionService.updateQuestion(editingQuestion.id, questionData);
      } else {
        await questionService.createQuestion(questionData);
      }
      
      handleCloseDialog();
      loadQuestions();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save question');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      try {
        setError(null);
        await questionService.deleteQuestion(id);
        loadQuestions();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete question');
      }
    }
  };

  const handleTogglePublished = async (question: Question) => {
    try {
      setUpdatingIds(prev => new Set(prev).add(question.id));
      setError(null);

      await questionService.updateQuestion(question.id, {
        title: question.title,
        slug: question.slug,
        difficulty: question.difficulty,
        is_published: !question.is_published,
        content: question.content,
        category_id: question.category_id,
      });

      // Обновляем локальное состояние
      setQuestions(prev =>
        prev.map(q =>
          q.id === question.id
            ? { ...q, is_published: !q.is_published }
            : q
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update question status');
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(question.id);
        return newSet;
      });
    }
  };

  const handleSort = (field: string) => {
    const isAsc = sortBy === field && sortDir === 'asc';
    setSortDir(isAsc ? 'desc' : 'asc');
    setSortBy(field);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setDifficulty('');
    setCategoryId('');
    setSortBy('updated_at');
    setSortDir('desc');
    setPage(1);
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

  // Функция для получения названия категории
  const getCategoryDisplayName = (question: Question) => {
    if (question.category?.name) {
      return question.category.name;
    }
    
    if (question.category_id) {
      const category = categories.find(cat => cat.id === question.category_id);
      if (category) {
        return category.name;
      }
    }
    
    return 'No category';
  };

  // Функция для получения ID категории из вопроса
  const getCategoryId = (question: Question) => {
    return question.category_id || question.category?.id || '';
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 8 }}>
        <CircularProgress 
          size={48}
          sx={{ color: NEUTRAL_COLORS.accent }}
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              color: NEUTRAL_COLORS.textPrimary,
              mb: 0.5
            }}
          >
            Questions Management
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ color: NEUTRAL_COLORS.textSecondary }}
          >
            Total: {total} questions | Showing page {page} of {totalPages}
          </Typography>
        </Box>
        <StyledButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Question
        </StyledButton>
      </Stack>

      {/* Панель поиска и фильтров */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${NEUTRAL_COLORS.border}`,
          backgroundColor: NEUTRAL_COLORS.surface,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">

        {/* Поиск */}
        <TextField
          fullWidth
          placeholder="Search questions by title or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="medium"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: NEUTRAL_COLORS.textSecondary }} />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearch('')}
                  sx={{ color: NEUTRAL_COLORS.textSecondary }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: NEUTRAL_COLORS.background,
              '&:hover fieldset': {
                borderColor: NEUTRAL_COLORS.accent,
              },
              '&.Mui-focused fieldset': {
                borderColor: NEUTRAL_COLORS.accent,
              },
            },
            // Добавьте этот стиль для видимости текста
            '& .MuiInputBase-input': {
              color: NEUTRAL_COLORS.textPrimary,
              '&::placeholder': {
                color: NEUTRAL_COLORS.textSecondary,
                opacity: 0.8,
              },
            },
          }}
        />

        {/* Фильтр по сложности */}
        <FormControl size="medium" sx={{ minWidth: 120 }}>
          <InputLabel 
            shrink={Boolean(difficulty)}
            sx={{
              color: NEUTRAL_COLORS.textSecondary,
              '&.Mui-focused': {
                color: NEUTRAL_COLORS.accent,
              },
            }}
          >
            
          </InputLabel>
          <Select
            value={difficulty}
            label="Difficulty"
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
            displayEmpty
            renderValue={(selected) => {
              if (!selected || selected === '') {
                return (
                  <Typography 
                    sx={{ 
                      color: NEUTRAL_COLORS.textSecondary,
                      fontSize: '0.875rem',
                    }}
                  >
                    All Difficulty
                  </Typography>
                );
              }
              return (
                <Typography 
                  sx={{ 
                    color: NEUTRAL_COLORS.textPrimary,
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  {selected.charAt(0).toUpperCase() + selected.slice(1)}
                </Typography>
              );
            }}
            sx={{
              borderRadius: 2,
              backgroundColor: NEUTRAL_COLORS.background,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: NEUTRAL_COLORS.accent,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: NEUTRAL_COLORS.accent,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(NEUTRAL_COLORS.border, 0.6),
              },
              // Важно: стили для выбранного значения
              '& .MuiSelect-select': {
                color: NEUTRAL_COLORS.textPrimary,
              },
            }}
          >
            <MenuItem value="">
              <Typography sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                All
              </Typography>
            </MenuItem>
            <MenuItem value="easy">
              <Typography sx={{ color: NEUTRAL_COLORS.textPrimary }}>
                Easy
              </Typography>
            </MenuItem>
            <MenuItem value="medium">
              <Typography sx={{ color: NEUTRAL_COLORS.textPrimary }}>
                Medium
              </Typography>
            </MenuItem>
            <MenuItem value="hard">
              <Typography sx={{ color: NEUTRAL_COLORS.textPrimary }}>
                Hard
              </Typography>
            </MenuItem>
          </Select>
        </FormControl>

        {/* Фильтр по категории */}
        <FormControl size="medium" sx={{ minWidth: 150 }}>
          <InputLabel 
            shrink={Boolean(categoryId)}
            sx={{
              color: NEUTRAL_COLORS.textSecondary,
              '&.Mui-focused': {
                color: NEUTRAL_COLORS.accent,
              },
            }}
          >
          </InputLabel>
          <Select
            value={categoryId}
            label="Category"
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            displayEmpty
            disabled={isLoadingCategories}
            renderValue={(selected) => {
              if (!selected || selected === '') {
                return (
                  <Typography 
                    sx={{ 
                      color: NEUTRAL_COLORS.textSecondary,
                      fontSize: '0.875rem',
                    }}
                  >
                    All Categories
                  </Typography>
                );
              }
              const category = categories.find(c => c.id === selected);
              return (
                <Typography 
                  sx={{ 
                    color: NEUTRAL_COLORS.textPrimary,
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  {category?.name || 'Unknown'}
                </Typography>
              );
            }}
            sx={{
              borderRadius: 2,
              backgroundColor: NEUTRAL_COLORS.background,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: NEUTRAL_COLORS.accent,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: NEUTRAL_COLORS.accent,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(NEUTRAL_COLORS.border, 0.6),
              },
              '&.Mui-disabled': {
                backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
              },
              // Важно: стили для выбранного значения
              '& .MuiSelect-select': {
                color: NEUTRAL_COLORS.textPrimary,
                '&.Mui-disabled': {
                  opacity: 0.7,
                },
              },
            }}
          >
            <MenuItem value="">
              <Typography sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                All Categories
              </Typography>
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                <Typography sx={{ color: NEUTRAL_COLORS.textPrimary }}>
                  {category.name}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

          {/* Сброс фильтров */}
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleResetFilters}
            disabled={!search && !difficulty && !categoryId}
            sx={{
              borderWidth: 2,
              borderColor: NEUTRAL_COLORS.border,
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
              '&:hover': {
                borderColor: NEUTRAL_COLORS.accent,
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
              }
            }}
          >
            Clear Filters
          </Button>
        </Stack>

        {/* Активные фильтры */}
        {(search || difficulty || categoryId) && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" gap={1}>
            {search && (
              <Chip
                label={`Search: "${search}"`}
                size="small"
                onDelete={() => setSearch('')}
                sx={{
                  fontWeight: 600,
                  backgroundColor: alpha(NEUTRAL_COLORS.warning, 0.1),
                  color: NEUTRAL_COLORS.warning,
                  border: `1px solid ${alpha(NEUTRAL_COLORS.warning, 0.3)}`,
                }}
              />
            )}
            {difficulty && (
              <Chip
                label={`Difficulty: ${difficulty}`}
                size="small"
                onDelete={() => setDifficulty('')}
                sx={{
                  fontWeight: 600,
                  backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                  color: NEUTRAL_COLORS.accent,
                  border: `1px solid ${alpha(NEUTRAL_COLORS.accent, 0.3)}`,
                }}
              />
            )}
            {categoryId && (
              <Chip
                label={`Category: ${categories.find(c => c.id === categoryId)?.name || 'Unknown'}`}
                size="small"
                onDelete={() => setCategoryId('')}
                sx={{
                  fontWeight: 600,
                  backgroundColor: alpha(NEUTRAL_COLORS.info, 0.1),
                  color: NEUTRAL_COLORS.info,
                  border: `1px solid ${alpha(NEUTRAL_COLORS.info, 0.3)}`,
                }}
              />
            )}
          </Stack>
        )}
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${alpha(NEUTRAL_COLORS.error, 0.2)}`,
            '& .MuiAlert-icon': {
              fontSize: 24
            }
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Questions Table */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          border: `1px solid ${NEUTRAL_COLORS.border}`,
          overflow: 'hidden',
          backgroundColor: NEUTRAL_COLORS.surface,
          mb: 3,
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <StyledTableRow hover={false}>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2,
                  width: '35%',
                }}>
                  <TableSortLabel
                    active={sortBy === 'title'}
                    direction={sortBy === 'title' ? (sortDir as 'asc' | 'desc') : 'asc'}
                    onClick={() => handleSort('title')}
                    sx={{
                      '& .MuiTableSortLabel-icon': {
                        color: `${NEUTRAL_COLORS.accent} !important`,
                      },
                      '&:hover': {
                        color: NEUTRAL_COLORS.accent,
                      },
                    }}
                  >
                    Title
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  Category
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  <TableSortLabel
                    active={sortBy === 'difficulty'}
                    direction={sortBy === 'difficulty' ? (sortDir as 'asc' | 'desc') : 'asc'}
                    onClick={() => handleSort('difficulty')}
                    sx={{
                      '& .MuiTableSortLabel-icon': {
                        color: `${NEUTRAL_COLORS.accent} !important`,
                      },
                      '&:hover': {
                        color: NEUTRAL_COLORS.accent,
                      },
                    }}
                  >
                    Difficulty
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  <TableSortLabel
                    active={sortBy === 'is_published'}
                    direction={sortBy === 'is_published' ? (sortDir as 'asc' | 'desc') : 'asc'}
                    onClick={() => handleSort('is_published')}
                    sx={{
                      '& .MuiTableSortLabel-icon': {
                        color: `${NEUTRAL_COLORS.accent} !important`,
                      },
                      '&:hover': {
                        color: NEUTRAL_COLORS.accent,
                      },
                    }}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center" sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  Published
                </TableCell>
                <TableCell align="right" sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  Actions
                </TableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {filteredQuestions.map((question) => (
                <StyledTableRow key={question.id}>
                  <TableCell sx={{ py: 2 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 500,
                        color: NEUTRAL_COLORS.textPrimary
                      }}
                    >
                      {question.title}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ color: NEUTRAL_COLORS.textSecondary }}
                    >
                      {question.slug}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      icon={<CategoryIcon />}
                      label={getCategoryDisplayName(question)}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        backgroundColor: alpha(NEUTRAL_COLORS.info, 0.1),
                        color: NEUTRAL_COLORS.info,
                        border: `1px solid ${alpha(NEUTRAL_COLORS.info, 0.3)}`,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      label={question.difficulty}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: alpha(getDifficultyColor(question.difficulty), 0.1),
                        color: getDifficultyColor(question.difficulty),
                        border: `1px solid ${alpha(getDifficultyColor(question.difficulty), 0.3)}`,
                        textTransform: 'capitalize',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      icon={question.is_published ? <PublishedIcon /> : <DraftIcon />}
                      label={question.is_published ? 'Published' : 'Draft'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: question.is_published 
                          ? alpha(NEUTRAL_COLORS.success, 0.1) 
                          : alpha(NEUTRAL_COLORS.secondary, 0.1),
                        color: question.is_published 
                          ? NEUTRAL_COLORS.success 
                          : NEUTRAL_COLORS.secondary,
                        border: `1px solid ${question.is_published 
                          ? alpha(NEUTRAL_COLORS.success, 0.3) 
                          : alpha(NEUTRAL_COLORS.secondary, 0.3)}`,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Tooltip 
                      title={`Click to ${question.is_published ? 'unpublish' : 'publish'}`}
                      placement="top"
                    >
                      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                        {updatingIds.has(question.id) ? (
                          <CircularProgress 
                            size={24} 
                            sx={{ 
                              color: NEUTRAL_COLORS.accent,
                              mx: 1
                            }} 
                          />
                        ) : (
                          <Switch
                            checked={question.is_published}
                            onChange={() => handleTogglePublished(question)}
                            color="success"
                            size="medium"
                            sx={{
                              '& .MuiSwitch-switchBase': {
                                color: NEUTRAL_COLORS.secondary,
                                '&.Mui-checked': {
                                  color: NEUTRAL_COLORS.success,
                                },
                                '&.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: NEUTRAL_COLORS.success,
                                },
                              },
                              '& .MuiSwitch-track': {
                                backgroundColor: NEUTRAL_COLORS.secondary,
                              },
                            }}
                          />
                        )}
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2 }}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(question)}
                          sx={{
                            color: NEUTRAL_COLORS.accent,
                            backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.2),
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(question.id)}
                          sx={{
                            color: NEUTRAL_COLORS.error,
                            backgroundColor: alpha(NEUTRAL_COLORS.error, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(NEUTRAL_COLORS.error, 0.2),
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {filteredQuestions.length === 0 && !isLoading && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: NEUTRAL_COLORS.textSecondary,
                mb: 2
              }}
            >
              {debouncedSearch ? 'No questions found matching your search' : 'No questions found'}
            </Typography>
            {debouncedSearch && (
              <StyledButton
                variant="outlined"
                onClick={() => {
                  setSearch('');
                  setDebouncedSearch('');
                }}
                sx={{ mr: 2 }}
              >
                Clear Search
              </StyledButton>
            )}
            <StyledButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Create New Question
            </StyledButton>
          </Box>
        )}
      </Paper>

      {/* Пагинация */}
      {totalPages > 1 && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            borderRadius: 3,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
            backgroundColor: NEUTRAL_COLORS.surface,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
              Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, total)} of {total} questions
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              size="medium"
              sx={{
                '& .MuiPaginationItem-root': {
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: NEUTRAL_COLORS.textSecondary,
                  border: `1px solid ${NEUTRAL_COLORS.border}`,
                  minWidth: 36,
                  height: 36,
                  '&:hover': {
                    backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.08),
                    borderColor: NEUTRAL_COLORS.accent,
                    color: NEUTRAL_COLORS.accent,
                  },
                  '&.Mui-selected': {
                    backgroundColor: NEUTRAL_COLORS.accent,
                    color: NEUTRAL_COLORS.surface,
                    borderColor: NEUTRAL_COLORS.accent,
                    '&:hover': {
                      backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.9),
                    },
                  },
                },
              }}
            />
          </Stack>
        </Paper>
      )}

      {/* Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${NEUTRAL_COLORS.border}`,
          pb: 2,
          fontWeight: 700,
          color: NEUTRAL_COLORS.textPrimary
        }}>
          {editingQuestion ? 'Edit Question' : 'Create New Question'}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Tabs 
            value={contentTab} 
            onChange={(e, v) => setContentTab(v)}
            sx={{ mb: 3 }}
          >
            <Tab label="Basic Info" />
            <Tab label="Content" />
          </Tabs>
          
          {contentTab === 0 ? (
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: NEUTRAL_COLORS.accent,
                    }
                  }
                }}
              />
              <TextField
                fullWidth
                label="Slug *"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: NEUTRAL_COLORS.accent,
                    }
                  }
                }}
                helperText="URL-friendly version of the title"
              />
              
              {/* Категория */}
              <FormControl fullWidth size="medium">
                <InputLabel>Category *</InputLabel>
                <Select
                  value={formData.category_id}
                  label="Category *"
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  disabled={isLoadingCategories}
                  sx={{
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: NEUTRAL_COLORS.accent,
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>Select a category</em>
                  </MenuItem>
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
                      transform: 'translateY(-50%)' 
                    }} 
                  />
                )}
              </FormControl>

              <FormControl fullWidth size="medium">
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={formData.difficulty}
                  label="Difficulty"
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                  sx={{
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: NEUTRAL_COLORS.accent,
                    }
                  }}
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ 
                p: 2,
                borderRadius: 2,
                border: `1px solid ${NEUTRAL_COLORS.border}`,
                backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      color="success"
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      {formData.is_published ? (
                        <PublishedIcon sx={{ color: NEUTRAL_COLORS.success }} />
                      ) : (
                        <DraftIcon sx={{ color: NEUTRAL_COLORS.secondary }} />
                      )}
                      <Typography sx={{ 
                        fontWeight: 600,
                        color: formData.is_published ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.textPrimary
                      }}>
                        {formData.is_published ? 'Published' : 'Draft'}
                      </Typography>
                    </Stack>
                  }
                />
                <Typography variant="caption" sx={{ 
                  color: NEUTRAL_COLORS.textSecondary,
                  ml: 7,
                  display: 'block',
                  mt: 0.5
                }}>
                  {formData.is_published 
                    ? 'This question is visible to users' 
                    : 'This question is only visible in admin panel'}
                </Typography>
              </Box>
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
          borderTop: `1px solid ${NEUTRAL_COLORS.border}`,
          pt: 2,
          px: 3,
          pb: 3
        }}>
          <StyledButton
            variant="outlined"
            onClick={handleCloseDialog}
          >
            Cancel
          </StyledButton>
          <StyledButton
            variant="contained"
            onClick={handleSave}
            disabled={!formData.category_id || !formData.title.trim() || !formData.slug.trim()}
          >
            {editingQuestion ? 'Update' : 'Create'}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};