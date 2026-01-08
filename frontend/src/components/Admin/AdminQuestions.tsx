import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as PublishedIcon,
  VisibilityOff as DraftIcon,
} from '@mui/icons-material';
import { questionService } from '../../services/questionService';
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
};

const ITEMS_PER_PAGE = 10;

const StyledButton = ({ 
  children, 
  variant = 'contained', 
  color = 'primary', 
  startIcon, 
  onClick,
  size = 'medium'
}: any) => (
  <Button
    variant={variant}
    color={color}
    startIcon={startIcon}
    onClick={onClick}
    size={size}
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
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    is_published: false,
  });
  const [error, setError] = useState<string | null>(null);

  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await questionService.getQuestions(1, ITEMS_PER_PAGE);
      setQuestions(data.items);
      setError(null);
    } catch (err) {
      console.error('Failed to load questions:', err);
      setError('Failed to load questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleOpenDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        title: question.title,
        slug: question.slug,
        difficulty: question.difficulty,
        is_published: question.is_published,
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        title: '',
        slug: '',
        difficulty: 'easy',
        is_published: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuestion(null);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setError(null);
      if (editingQuestion) {
        await questionService.updateQuestion(editingQuestion.id, {
          title: formData.title,
          slug: formData.slug,
          difficulty: formData.difficulty,
          is_published: formData.is_published,
        });
      } else {
        await questionService.createQuestion({
          title: formData.title,
          slug: formData.slug,
          difficulty: formData.difficulty,
          is_published: formData.is_published,
          content: [],
        });
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
                  <TableCell align="right" sx={{ py: 2 }}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
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
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
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
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Title"
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
              label="Slug"
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
            />
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
            <FormControl fullWidth size="medium">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.is_published ? 'published' : 'draft'}
                label="Status"
                onChange={(e) => setFormData({ ...formData, is_published: e.target.value === 'published' })}
                sx={{
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: NEUTRAL_COLORS.accent,
                  }
                }}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </Select>
            </FormControl>
          </Stack>
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
          >
            {editingQuestion ? 'Update' : 'Create'}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};