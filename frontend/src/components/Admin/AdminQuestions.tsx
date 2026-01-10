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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as PublishedIcon,
  VisibilityOff as DraftIcon,
  Category as CategoryIcon,
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

  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await questionService.getQuestions(
        1, 
        ITEMS_PER_PAGE, 
        undefined, 
        undefined, 
        'updated_at', 
        'desc',
        undefined,
        false,
    );
      
      // Используем данные напрямую, так как API возвращает category_name
      setQuestions(data.items);
      setError(null);
    } catch (err) {
      console.error('Failed to load questions:', err);
      setError('Failed to load questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    loadCategories();
  }, [loadQuestions, loadCategories]);

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
    // Пробуем получить название в порядке приоритета:
    // 2. category.name если есть полный объект категории
    // 3. Ищем в локальном списке категорий по ID
    // 4. 'No category' если ничего не найдено
    
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
    // Пробуем получить ID в порядке приоритета:
    return question.category_id || question.category?.id || '';
  };

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
            Total: {questions.length} questions
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
                  py: 2
                }}>
                  Title
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
                  Difficulty
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  Status
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
              {questions.map((question) => (
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
        
        {questions.length === 0 && !isLoading && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: NEUTRAL_COLORS.textSecondary,
                mb: 2
              }}
            >
              No questions found
            </Typography>
            <StyledButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Create Your First Question
            </StyledButton>
          </Box>
        )}
      </Paper>

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