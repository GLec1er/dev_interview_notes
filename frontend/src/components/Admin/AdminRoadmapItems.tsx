// AdminRoadmapItems.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Alert,
  Chip,
  Stack,
  IconButton,
  Paper,
  alpha,
  Tooltip,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  InputAdornment,
  ListItem,
  List,
  ListItemText,

} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  FolderOpen as FolderIcon,
  Title as TitleIcon,
  Work as ProfessionIcon,
  Numbers as NumbersIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  QuestionAnswer as QuestionIcon,
  Category as CategoryIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { roadmapService } from '../../services/roadmapService';
import { categoryService } from '../../services/categoryService';
import { questionService } from '../../services/questionService';
import type { RoadmapListResponse, RoadmapResponse, RoadmapItem, RoadmapItemCreate } from '../../services/roadmapService';
import type { Category } from '../../types';
import type { Question } from '../../types';

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
  purple: '#805AD5',
};

// Интерфейс для ответа от questionService.getQuestions
interface QuestionsResponse {
  items: Question[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Этап 1: Выбор роадмапа
const SelectRoadmapStage: React.FC<{
  roadmaps: RoadmapListResponse[];
  isLoading: boolean;
  error: string | null;
  onSelectRoadmap: (roadmap: RoadmapListResponse) => void;
}> = ({ roadmaps, isLoading, error, onSelectRoadmap }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoadmaps = roadmaps.filter(roadmap =>
    roadmap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    roadmap.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (roadmap.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

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

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          borderRadius: 2,
          border: `1px solid ${alpha(NEUTRAL_COLORS.error, 0.2)}`,
        }}
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Заголовок */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700,
            color: NEUTRAL_COLORS.textPrimary,
            mb: 2
          }}
        >
          Select Roadmap to Manage Items
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: NEUTRAL_COLORS.textSecondary,
            mb: 3
          }}
        >
          Choose a roadmap to add, edit, or remove items
        </Typography>
      </Box>

      {/* Поиск */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${NEUTRAL_COLORS.border}`,
          backgroundColor: NEUTRAL_COLORS.surface,
        }}
      >
        <TextField
          fullWidth
          placeholder="Search roadmaps by title, profession, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="medium"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: NEUTRAL_COLORS.textSecondary }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: NEUTRAL_COLORS.background,
              '&:hover fieldset': {
                borderColor: NEUTRAL_COLORS.accent,
              }
            }
          }}
        />
      </Paper>

      {/* Список роадмапов */}
      <Grid container spacing={2}>
        {filteredRoadmaps.map((roadmap) => (
          <Grid item xs={12} sm={6} md={4} key={roadmap.id}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: `1px solid ${NEUTRAL_COLORS.border}`,
                backgroundColor: NEUTRAL_COLORS.surface,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: NEUTRAL_COLORS.accent,
                  boxShadow: `0 4px 12px ${alpha(NEUTRAL_COLORS.accent, 0.1)}`,
                  transform: 'translateY(-2px)',
                }
              }}
            >
              <CardActionArea onClick={() => onSelectRoadmap(roadmap)}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(NEUTRAL_COLORS.accent, 0.1),
                        color: NEUTRAL_COLORS.accent,
                      }}
                    >
                      <FolderIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 600,
                          color: NEUTRAL_COLORS.textPrimary,
                          lineHeight: 1.2,
                        }}
                      >
                        {roadmap.title}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: NEUTRAL_COLORS.textSecondary,
                          display: 'block',
                          mt: 0.5
                        }}
                      >
                        {roadmap.profession}
                      </Typography>
                    </Box>
                  </Stack>

                  {roadmap.description && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: NEUTRAL_COLORS.textSecondary,
                        mb: 2,
                        fontSize: '0.875rem',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {roadmap.description}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      icon={<NumbersIcon />}
                      label={`${roadmap.items_count} items`}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        backgroundColor: alpha(NEUTRAL_COLORS.info, 0.1),
                        color: NEUTRAL_COLORS.info,
                        fontSize: '0.75rem',
                      }}
                    />
                    <Chip
                      label={roadmap.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        backgroundColor: roadmap.is_active 
                          ? alpha(NEUTRAL_COLORS.success, 0.1) 
                          : alpha(NEUTRAL_COLORS.secondary, 0.1),
                        color: roadmap.is_active 
                          ? NEUTRAL_COLORS.success 
                          : NEUTRAL_COLORS.secondary,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Stack>

                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: NEUTRAL_COLORS.textSecondary,
                        fontSize: '0.75rem',
                      }}
                    >
                      {new Date(roadmap.created_at).toLocaleDateString()}
                    </Typography>
                    <ArrowForwardIcon sx={{ fontSize: 16, color: NEUTRAL_COLORS.accent }} />
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredRoadmaps.length === 0 && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 6,
            borderRadius: 2,
            border: `1px dashed ${NEUTRAL_COLORS.border}`,
            backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
            textAlign: 'center'
          }}
        >
          <FolderIcon sx={{ fontSize: 48, color: NEUTRAL_COLORS.textSecondary, mb: 2 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              color: NEUTRAL_COLORS.textSecondary,
              mb: 1
            }}
          >
            No roadmaps found
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: NEUTRAL_COLORS.textSecondary,
              mb: 3
            }}
          >
            {searchQuery ? 'Try a different search term' : 'Create a roadmap first'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

// Этап 2: Управление элементами выбранного роадмапа
const ManageItemsStage: React.FC<{
  roadmap: RoadmapListResponse;
  onBack: () => void;
}> = ({ roadmap, onBack }) => {
  const [roadmapDetail, setRoadmapDetail] = useState<RoadmapResponse | null>(null);
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [itemOrder, setItemOrder] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMoving, setIsMoving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Загружаем детали роадмапа
      const roadmapData = await roadmapService.getRoadmapBySlug(roadmap.slug);
      setRoadmapDetail(roadmapData);
      setItems(roadmapData.roadmap_items || []);
      
      // Загружаем категории
      try {
        const categoriesData = await categoryService.getCategories();
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        } else if (categoriesData && typeof categoriesData === 'object' && 'items' in categoriesData) {
          setCategories(categoriesData.items || []);
        } else {
          console.warn('Unexpected categories data format:', categoriesData);
          setCategories([]);
        }
      } catch (catErr) {
        console.error('Failed to load categories:', catErr);
        setCategories([]);
      }
      
      // Загружаем вопросы
      try {
        const questionsData = await questionService.getQuestions(1, 1000, true);
        if (Array.isArray(questionsData)) {
          setQuestions(questionsData);
        } else if (questionsData && typeof questionsData === 'object' && 'items' in questionsData) {
          setQuestions(questionsData.items || []);
        } else {
          console.warn('Unexpected questions data format:', questionsData);
          setQuestions([]);
        }
      } catch (qErr) {
        console.error('Failed to load questions:', qErr);
        setQuestions([]);
      }
      
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [roadmap.slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Фильтрация вопросов по категории и поисковому запросу
  useEffect(() => {
    let filtered = questions;

    // Фильтр по категории
    if (filterCategory) {
      filtered = filtered.filter(q => q.category_id === filterCategory);
    }

    // Фильтр по поисковому запросу
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(query) ||
        q.slug.toLowerCase().includes(query)
      );
    }

    setFilteredQuestions(filtered);
  }, [questions, filterCategory, searchQuery]);

  const handleOpenDialog = (item?: RoadmapItem) => {
    if (item) {
      setEditingItem(item);
      setSelectedCategory(item.category_id || '');
      setItemOrder(item.order);
      // Находим выбранные вопросы
      const selected = questions.filter(q => item.question_ids?.includes(q.id));
      setSelectedQuestions(selected);
    } else {
      setEditingItem(null);
      setSelectedCategory('');
      setItemOrder(items.length + 1);
      setSelectedQuestions([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setError(null);
    setSelectedQuestions([]);
    setSelectedCategory('');
    setFilterCategory('');
    setSearchQuery('');
  };

  const handleSaveItem = async () => {
    try {
      setError(null);

      if (selectedQuestions.length === 0) {
        setError('Please select at least one question');
        return;
      }

      const itemData: RoadmapItemCreate = {
        question_ids: selectedQuestions.map(q => q.id),
        order: itemOrder,
        ...(selectedCategory && { category_id: selectedCategory }),
      };

      if (editingItem) {
        await roadmapService.updateRoadmapItem(editingItem.id, itemData);
      } else {
        if (!roadmapDetail) {
          setError('Roadmap not found');
          return;
        }
        await roadmapService.addRoadmapItem(roadmapDetail.id, itemData);
      }

      handleCloseDialog();
      await loadData();
    } catch (err: any) {
      console.error('Error saving item:', err);
      setError(err.response?.data?.detail || 'Failed to save item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        setError(null);
        await roadmapService.deleteRoadmapItem(itemId);
        await loadData();
      } catch (err: any) {
        console.error('Error deleting item:', err);
        setError(err.response?.data?.detail || 'Failed to delete item');
      }
    }
  };

  const handleMoveItem = async (itemId: string, direction: 'up' | 'down') => {
    try {
      setIsMoving(true);
      setError(null);
      
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const newOrder = direction === 'up' ? item.order - 1 : item.order + 1;
      
      // Находим элемент, с которым нужно поменяться местами
      const swapItem = items.find(i => i.order === newOrder);
      if (!swapItem) return;

      // Сортируем элементы по порядку для последовательного обновления
      const sortedItems = [...items].sort((a, b) => a.order - b.order);
      const currentIndex = sortedItems.findIndex(i => i.id === itemId);
      const swapIndex = sortedItems.findIndex(i => i.id === swapItem.id);

      if (currentIndex === -1 || swapIndex === -1) return;

      // Обновляем порядок локально для мгновенного отклика UI
      const updatedItems = [...items];
      const currentItemIndex = updatedItems.findIndex(i => i.id === itemId);
      const swapItemIndex = updatedItems.findIndex(i => i.id === swapItem.id);

      if (currentItemIndex !== -1 && swapItemIndex !== -1) {
        // Меняем местами значения order
        [updatedItems[currentItemIndex].order, updatedItems[swapItemIndex].order] = 
        [updatedItems[swapItemIndex].order, updatedItems[currentItemIndex].order];
        
        // Сортируем по новому порядку
        updatedItems.sort((a, b) => a.order - b.order);
        setItems(updatedItems);
      }

      // Отправляем запросы на сервер
      await Promise.all([
        roadmapService.updateRoadmapItem(itemId, { order: newOrder }),
        roadmapService.updateRoadmapItem(swapItem.id, { order: item.order }),
      ]);

    } catch (err: any) {
      console.error('Error moving item:', err);
      setError(err.response?.data?.detail || 'Failed to move item');
      // В случае ошибки перезагружаем данные
      await loadData();
    } finally {
      setIsMoving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Сортируем элементы для отображения
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.order - b.order);
  }, [items]);

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
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{
              mb: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: NEUTRAL_COLORS.border,
              color: NEUTRAL_COLORS.textPrimary,
              '&:hover': {
                borderColor: NEUTRAL_COLORS.accent,
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
              }
            }}
          >
            Back to Roadmaps
          </Button>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              color: NEUTRAL_COLORS.textPrimary,
              mb: 0.5
            }}
          >
            {roadmap.title} - Items Management
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ color: NEUTRAL_COLORS.textSecondary }}
          >
            Profession: {roadmap.profession} • Total: {sortedItems.length} items
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            py: 1.5,
            background: `linear-gradient(135deg, ${NEUTRAL_COLORS.accent} 0%, ${alpha(NEUTRAL_COLORS.accent, 0.9)} 100%)`,
            boxShadow: '0 2px 8px rgba(49, 130, 206, 0.2)',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(49, 130, 206, 0.3)',
              transform: 'translateY(-1px)',
            }
          }}
        >
          Add Item
        </Button>
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

      {/* Items Table */}
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
              <TableRow sx={{ 
                backgroundColor: alpha(NEUTRAL_COLORS.background, 0.8),
              }}>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2,
                  width: 60
                }}>
                  Order
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  Questions
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
                  Created
                </TableCell>
                <TableCell align="right" sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedItems.map((item, index) => (
                <TableRow
                  key={item.id}
                  sx={{
                    '&:nth-of-type(even)': {
                      backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
                    },
                    '&:hover': {
                      backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
                    },
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Tooltip title="Move up">
                        <IconButton
                          size="small"
                          onClick={() => handleMoveItem(item.id, 'up')}
                          disabled={isMoving || index === 0}
                          sx={{
                            color: NEUTRAL_COLORS.textSecondary,
                            '&:hover': {
                              color: NEUTRAL_COLORS.success,
                            },
                            '&.Mui-disabled': {
                              opacity: 0.3,
                            }
                          }}
                        >
                          <UpIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Chip
                        label={item.order}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                          color: NEUTRAL_COLORS.accent,
                          minWidth: 40,
                        }}
                      />
                      <Tooltip title="Move down">
                        <IconButton
                          size="small"
                          onClick={() => handleMoveItem(item.id, 'down')}
                          disabled={isMoving || index === sortedItems.length - 1}
                          sx={{
                            color: NEUTRAL_COLORS.textSecondary,
                            '&:hover': {
                              color: NEUTRAL_COLORS.success,
                            },
                            '&.Mui-disabled': {
                              opacity: 0.3,
                            }
                          }}
                        >
                          <DownIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Stack spacing={1}>
                      {item.question_ids?.map((questionId, qIndex) => {
                        const question = questions.find(q => q.id === questionId);
                        return question ? (
                          <Chip
                            key={questionId}
                            icon={<QuestionIcon />}
                            label={`${qIndex + 1}. ${question.title}`}
                            size="small"
                            sx={{
                              fontWeight: 500,
                              backgroundColor: alpha(NEUTRAL_COLORS.info, 0.1),
                              color: NEUTRAL_COLORS.info,
                              justifyContent: 'flex-start',
                              maxWidth: '100%',
                              '& .MuiChip-label': {
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                              }
                            }}
                          />
                        ) : null;
                      })}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    {item.category_id ? (
                      <Chip
                        label={(() => {
                          if (!categories || !Array.isArray(categories)) return 'Unknown';
                          const category = categories.find(c => c && c.id === item.category_id);
                          return category?.name || 'Unknown';
                        })()}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          backgroundColor: alpha(NEUTRAL_COLORS.purple, 0.1),
                          color: NEUTRAL_COLORS.purple,
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                        No category
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: NEUTRAL_COLORS.textSecondary,
                        fontSize: '0.875rem'
                      }}
                    >
                      {formatDate(item.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2 }}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(item)}
                          disabled={isMoving}
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
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={isMoving}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {sortedItems.length === 0 && !isLoading && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: NEUTRAL_COLORS.textSecondary,
                mb: 2
              }}
            >
              No items found. Add your first item!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                background: `linear-gradient(135deg, ${NEUTRAL_COLORS.accent} 0%, ${alpha(NEUTRAL_COLORS.accent, 0.9)} 100%)`,
              }}
            >
              Add First Item
            </Button>
          </Box>
        )}
      </Paper>

      {/* Диалог для создания/редактирования элемента */}
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
          color: NEUTRAL_COLORS.textPrimary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>
            {editingItem ? 'Edit Item' : 'Add New Item'}
            {editingItem && (
              <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary, fontWeight: 400, mt: 0.5 }}>
                Order: {editingItem.order}
              </Typography>
            )}
          </span>
          <IconButton
            size="small"
            onClick={handleCloseDialog}
            sx={{
              color: NEUTRAL_COLORS.textSecondary,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ py: 3 }}>
          <Stack spacing={3}>
            {/* Order Input */}
            <TextField
              label="Order"
              type="number"
              value={itemOrder}
              onChange={(e) => setItemOrder(parseInt(e.target.value) || 1)}
              fullWidth
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <NumbersIcon sx={{ color: NEUTRAL_COLORS.textSecondary }} />
                  </InputAdornment>
                ),
              }}
              helperText="Position in the roadmap"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            {/* Category Selection */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: NEUTRAL_COLORS.textPrimary }}>
                <CategoryIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
                Category (Optional)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  label="No category"
                  onClick={() => {
                    setSelectedCategory('');
                    setFilterCategory('');
                  }}
                  sx={{
                    borderRadius: 1,
                    fontWeight: 500,
                    backgroundColor: selectedCategory === '' ? alpha(NEUTRAL_COLORS.accent, 0.1) : alpha(NEUTRAL_COLORS.border, 0.5),
                    color: selectedCategory === '' ? NEUTRAL_COLORS.accent : NEUTRAL_COLORS.textSecondary,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: selectedCategory === '' ? alpha(NEUTRAL_COLORS.accent, 0.2) : alpha(NEUTRAL_COLORS.border, 0.8),
                    }
                  }}
                />
                {categories && Array.isArray(categories) && categories.map((category) => category && (
                  <Chip
                    key={category.id}
                    label={category.name}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setFilterCategory(category.id);
                    }}
                    sx={{
                      borderRadius: 1,
                      fontWeight: 500,
                      backgroundColor: selectedCategory === category.id ? alpha(NEUTRAL_COLORS.purple, 0.1) : alpha(NEUTRAL_COLORS.border, 0.5),
                      color: selectedCategory === category.id ? NEUTRAL_COLORS.purple : NEUTRAL_COLORS.textSecondary,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: selectedCategory === category.id ? alpha(NEUTRAL_COLORS.purple, 0.2) : alpha(NEUTRAL_COLORS.border, 0.8),
                      }
                    }}
                  />
                ))}
              </Box>
              {filterCategory && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: NEUTRAL_COLORS.textSecondary }}>
                  <FilterIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                  Showing only questions from selected category
                </Typography>
              )}
            </Box>

            {/* Selected Questions */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: NEUTRAL_COLORS.textPrimary }}>
                <QuestionIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
                Selected Questions ({selectedQuestions.length})
              </Typography>
              {selectedQuestions.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  No questions selected. Please select at least one question from the list below.
                </Alert>
              ) : (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    border: `1px solid ${NEUTRAL_COLORS.border}`,
                    backgroundColor: NEUTRAL_COLORS.background,
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  <Stack spacing={1}>
                    {selectedQuestions.map((question, index) => (
                      <Box
                        key={question.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.5,
                          borderRadius: 1,
                          backgroundColor: NEUTRAL_COLORS.surface,
                          border: `1px solid ${NEUTRAL_COLORS.border}`,
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: NEUTRAL_COLORS.textPrimary }}>
                            {index + 1}. {question.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                            Slug: {question.slug} • Category: {categories.find(c => c.id === question.category_id)?.name || 'No category'}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedQuestions(prev => prev.filter(q => q.id !== question.id));
                          }}
                          sx={{
                            color: NEUTRAL_COLORS.error,
                            '&:hover': {
                              backgroundColor: alpha(NEUTRAL_COLORS.error, 0.1),
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Box>

            {/* Questions Search and Selection */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: NEUTRAL_COLORS.textPrimary }}>
                <SearchIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
                Search and Select Questions
                {filterCategory && (
                  <Chip
                    size="small"
                    label={`Filtered by: ${categories.find(c => c.id === filterCategory)?.name || 'category'}`}
                    onDelete={() => {
                      setFilterCategory('');
                      setSelectedCategory('');
                    }}
                    sx={{ ml: 1, fontSize: '0.7rem' }}
                  />
                )}
              </Typography>
              <TextField
                fullWidth
                placeholder="Search questions by title or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: NEUTRAL_COLORS.textSecondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              <Paper 
                elevation={0}
                sx={{
                  border: `1px solid ${NEUTRAL_COLORS.border}`,
                  borderRadius: 2,
                  maxHeight: 300,
                  overflow: 'auto',
                }}
              >
                {!filteredQuestions || filteredQuestions.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                      {searchQuery ? 'No questions found' : filterCategory ? 'No questions in this category' : 'No questions available'}
                    </Typography>
                  </Box>
                ) : (
                  <List dense>
                    {filteredQuestions.map((question) => {
                      const isSelected = selectedQuestions.some(q => q.id === question.id);
                      return (
                        <ListItem
                          key={question.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedQuestions(prev => prev.filter(q => q.id !== question.id));
                            } else {
                              setSelectedQuestions(prev => [...prev, question]);
                            }
                          }}
                          sx={{
                            borderBottom: `1px solid ${alpha(NEUTRAL_COLORS.border, 0.5)}`,
                            '&:last-child': { borderBottom: 'none' },
                            '&:hover': {
                              backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
                              cursor: 'pointer',
                            }
                          }}
                        >
                          {isSelected ? (
                            <CheckCircleIcon sx={{ color: NEUTRAL_COLORS.success, mr: 2, fontSize: 20 }} />
                          ) : (
                            <RadioButtonUncheckedIcon sx={{ color: NEUTRAL_COLORS.textSecondary, mr: 2, fontSize: 20 }} />
                          )}
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {question.title}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                                Slug: {question.slug} • Difficulty: {question.difficulty} • 
                                Category: {categories.find(c => c.id === question.category_id)?.name || 'No category'}
                              </Typography>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </Paper>
            </Box>

            {/* Error Display */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 2,
                  border: `1px solid ${alpha(NEUTRAL_COLORS.error, 0.2)}`,
                }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ 
          borderTop: `1px solid ${NEUTRAL_COLORS.border}`,
          pt: 2,
          px: 3,
          pb: 3
        }}>
          <Button
            variant="outlined"
            onClick={handleCloseDialog}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              borderColor: NEUTRAL_COLORS.border,
              color: NEUTRAL_COLORS.textPrimary,
              '&:hover': {
                borderColor: NEUTRAL_COLORS.accent,
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveItem}
            disabled={selectedQuestions.length === 0}
            startIcon={editingItem ? <SaveIcon /> : <AddIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              background: `linear-gradient(135deg, ${NEUTRAL_COLORS.accent} 0%, ${alpha(NEUTRAL_COLORS.accent, 0.9)} 100%)`,
            }}
          >
            {editingItem ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Основной компонент AdminRoadmapItems
export const AdminRoadmapItems: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<RoadmapListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapListResponse | null>(null);

  const loadRoadmaps = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await roadmapService.getAllRoadmaps();
      setRoadmaps(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load roadmaps:', err);
      setError('Failed to load roadmaps. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoadmaps();
  }, [loadRoadmaps]);

  const handleSelectRoadmap = (roadmap: RoadmapListResponse) => {
    setSelectedRoadmap(roadmap);
  };

  const handleBackToSelection = () => {
    setSelectedRoadmap(null);
  };

  return (
    <Box>
      {selectedRoadmap ? (
        <ManageItemsStage
          roadmap={selectedRoadmap}
          onBack={handleBackToSelection}
        />
      ) : (
        <SelectRoadmapStage
          roadmaps={roadmaps}
          isLoading={isLoading}
          error={error}
          onSelectRoadmap={handleSelectRoadmap}
        />
      )}
    </Box>
  );
};