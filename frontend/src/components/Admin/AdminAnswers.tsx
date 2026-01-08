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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Paper,
  alpha,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QuestionAnswer as AnswerIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { questionService } from '../../services/questionService';
import { answerService } from '../../services/answerService';
import type { Question, Answer } from '../../types';

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

// Стилизованный Select компонент со светлым выпадающим списком
const StyledSelect = ({ 
  label, 
  value, 
  onChange, 
  children,
  disabled = false,
  startIcon,
  ...props 
}: any) => (
  <FormControl fullWidth size="medium">
    <InputLabel 
      sx={{ 
        color: NEUTRAL_COLORS.textSecondary,
        '&.Mui-focused': {
          color: NEUTRAL_COLORS.accent,
        },
        '&.Mui-error': {
          color: NEUTRAL_COLORS.error,
        },
      }}
    >
      {label}
    </InputLabel>
    <Select
      value={value}
      label={label}
      onChange={onChange}
      disabled={disabled}
      startAdornment={startIcon ? (
        <InputAdornment position="start">
          {startIcon}
        </InputAdornment>
      ) : undefined}
      sx={{
        borderRadius: 2,
        backgroundColor: NEUTRAL_COLORS.surface,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: NEUTRAL_COLORS.border,
          borderWidth: 1.5,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: NEUTRAL_COLORS.accent,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: NEUTRAL_COLORS.accent,
          borderWidth: 2,
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: NEUTRAL_COLORS.error,
        },
        // Стили для выбранного значения
        '& .MuiSelect-select': {
          color: NEUTRAL_COLORS.textPrimary,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: NEUTRAL_COLORS.surface,
        },
        // Стили для иконки стрелки
        '& .MuiSelect-icon': {
          color: NEUTRAL_COLORS.textSecondary,
        },
        // Стили для disabled состояния
        '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
          borderColor: alpha(NEUTRAL_COLORS.border, 0.5),
        },
        '&.Mui-disabled .MuiSelect-select': {
          color: NEUTRAL_COLORS.textSecondary,
          backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
        },
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            borderRadius: 2,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            mt: 1,
            maxHeight: 300,
            backgroundColor: NEUTRAL_COLORS.surface, // Светлый фон
            '& .MuiMenuItem-root': {
              color: NEUTRAL_COLORS.textPrimary,
              backgroundColor: NEUTRAL_COLORS.surface, // Светлый фон для элементов
              '&:hover': {
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.08), // Легкий ховер
              },
              '&.Mui-selected': {
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.12), // Легкий выделенный
                color: NEUTRAL_COLORS.accent,
                '&:hover': {
                  backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.15),
                },
              },
              '&.Mui-focusVisible': {
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
              },
            },
            // Стили для скроллбара
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: NEUTRAL_COLORS.background,
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(NEUTRAL_COLORS.textSecondary, 0.3),
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: alpha(NEUTRAL_COLORS.textSecondary, 0.5),
              }
            },
          },
        },
        // Чтобы меню было над другими элементами
        disableScrollLock: true,
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'left',
        },
        transformOrigin: {
          vertical: 'top',
          horizontal: 'left',
        },
      }}
      {...props}
    >
      {children}
    </Select>
  </FormControl>
);

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

export const AdminAnswers: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<Answer | null>(null);
  const [formData, setFormData] = useState({
    content: JSON.stringify([{ type: 'paragraph', data: { text: '' } }]),
  });
  const [error, setError] = useState<string | null>(null);

  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await questionService.getQuestions(1, 100);
      setQuestions(data.items);
      setError(null);
    } catch (err) {
      console.error('Failed to load questions:', err);
      setError('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadAnswers = useCallback(async () => {
    if (!selectedQuestionId) return;
    try {
      setIsLoading(true);
      const data = await answerService.getAnswers(selectedQuestionId);
      setAnswers(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load answers:', err);
      setError('Failed to load answers');
    } finally {
      setIsLoading(false);
    }
  }, [selectedQuestionId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    if (selectedQuestionId) {
      loadAnswers();
    }
  }, [selectedQuestionId, loadAnswers]);

  const handleOpenDialog = (answer?: Answer) => {
    if (answer) {
      setEditingAnswer(answer);
      setFormData({
        content: JSON.stringify(answer.content, null, 2),
      });
    } else {
      setEditingAnswer(null);
      setFormData({
        content: JSON.stringify([{ type: 'paragraph', data: { text: '' } }], null, 2),
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAnswer(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!selectedQuestionId) return;
    try {
      setError(null);
      const content = JSON.parse(formData.content);
      
      if (editingAnswer) {
        await answerService.updateAnswer(selectedQuestionId, editingAnswer.id, {
          content,
        });
      } else {
        await answerService.createAnswer(selectedQuestionId, {
          content,
        });
      }
      handleCloseDialog();
      loadAnswers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid JSON format or server error');
    }
  };

  const handleDelete = async (answerId: string) => {
    if (!selectedQuestionId) return;
    if (window.confirm('Are you sure you want to delete this answer?')) {
      try {
        setError(null);
        await answerService.deleteAnswer(selectedQuestionId, answerId);
        loadAnswers();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete answer');
      }
    }
  };

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  if (isLoading && !selectedQuestionId) {
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
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            color: NEUTRAL_COLORS.textPrimary,
            mb: 2
          }}
        >
          Answers Management
        </Typography>
        
        <StyledSelect
          label="Select Question"
          value={selectedQuestionId}
          onChange={(e: any) => setSelectedQuestionId(e.target.value)}
          startIcon={<AnswerIcon sx={{ color: NEUTRAL_COLORS.textSecondary, mr: 1 }} />}
        >
          <MenuItem value="">
            <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
              <Typography sx={{ color: NEUTRAL_COLORS.textSecondary }}>
                -- Choose a question --
              </Typography>
            </Stack>
          </MenuItem>
          {questions.map((q) => (
            <MenuItem key={q.id} value={q.id}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                <Typography 
                  sx={{ 
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: NEUTRAL_COLORS.textPrimary
                  }}
                >
                  {q.title}
                </Typography>
                <Chip 
                  label={q.difficulty} 
                  size="small" 
                  sx={{ 
                    textTransform: 'capitalize',
                    fontSize: '0.7rem',
                    backgroundColor: q.difficulty === 'easy' 
                      ? alpha(NEUTRAL_COLORS.success, 0.1) 
                      : q.difficulty === 'medium'
                      ? alpha(NEUTRAL_COLORS.warning, 0.1)
                      : alpha(NEUTRAL_COLORS.error, 0.1),
                    color: q.difficulty === 'easy' 
                      ? NEUTRAL_COLORS.success 
                      : q.difficulty === 'medium'
                      ? NEUTRAL_COLORS.warning
                      : NEUTRAL_COLORS.error,
                    border: `1px solid ${q.difficulty === 'easy' 
                      ? alpha(NEUTRAL_COLORS.success, 0.3) 
                      : q.difficulty === 'medium'
                      ? alpha(NEUTRAL_COLORS.warning, 0.3)
                      : alpha(NEUTRAL_COLORS.error, 0.3)}`,
                  }}
                />
              </Stack>
            </MenuItem>
          ))}
        </StyledSelect>
      </Box>

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

      {selectedQuestion && (
        <>
          {/* Question Info */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${NEUTRAL_COLORS.border}`,
              backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ 
                p: 1.5,
                borderRadius: '50%',
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                color: NEUTRAL_COLORS.accent,
              }}>
                <InfoIcon />
              </Box>
              <Box>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600,
                    color: NEUTRAL_COLORS.textPrimary,
                    mb: 0.5
                  }}
                >
                  {selectedQuestion.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: NEUTRAL_COLORS.textSecondary }}
                >
                  Manage answers for this question
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Actions */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="space-between" 
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ mb: 3 }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 600,
                color: NEUTRAL_COLORS.textPrimary
              }}
            >
              Answers ({answers.length})
            </Typography>
            <StyledButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Answer
            </StyledButton>
          </Stack>

          {/* Answers Table */}
          {answers.length > 0 ? (
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
                        py: 2,
                        width: '70%'
                      }}>
                        Content Preview
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
                    {answers.map((answer) => {
                      const preview = answer.content[0]?.data?.text || '';
                      return (
                        <StyledTableRow key={answer.id}>
                          <TableCell sx={{ py: 2 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: NEUTRAL_COLORS.textPrimary,
                                mb: 0.5
                              }}
                            >
                              {preview.substring(0, 150) || 'No text content'}
                              {preview.length > 150 ? '...' : ''}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ color: NEUTRAL_COLORS.textSecondary }}
                            >
                              {answer.content.length} blocks • Updated: {new Date(answer.updated_at).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2 }}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(answer)}
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
                                onClick={() => handleDelete(answer.id)}
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
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : (
            <Paper 
              elevation={0}
              sx={{ 
                p: 6,
                borderRadius: 3,
                border: `1px solid ${NEUTRAL_COLORS.border}`,
                backgroundColor: NEUTRAL_COLORS.surface,
                textAlign: 'center'
              }}
            >
              <Box sx={{ 
                p: 2,
                borderRadius: '50%',
                backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
                display: 'inline-flex',
                mb: 2
              }}>
                <AnswerIcon sx={{ fontSize: 48, color: NEUTRAL_COLORS.textSecondary }} />
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: NEUTRAL_COLORS.textSecondary,
                  mb: 2
                }}
              >
                No answers for this question yet
              </Typography>
              <StyledButton
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Create First Answer
              </StyledButton>
            </Paper>
          )}
        </>
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
            maxHeight: '80vh',
            backgroundColor: NEUTRAL_COLORS.surface,
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${NEUTRAL_COLORS.border}`,
          pb: 2,
          fontWeight: 700,
          color: NEUTRAL_COLORS.textPrimary
        }}>
          {editingAnswer ? 'Edit Answer' : 'Create New Answer'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              border: `1px solid ${alpha(NEUTRAL_COLORS.info, 0.2)}`,
              backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
              '& .MuiAlert-icon': {
                fontSize: 24
              }
            }}
          >
            Enter answer content as JSON array following the Editor.js format
          </Alert>
          <TextField
            fullWidth
            label="Content (JSON)"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            margin="normal"
            multiline
            rows={12}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: '"Roboto Mono", monospace',
                fontSize: '0.9rem',
                borderRadius: 2,
                backgroundColor: NEUTRAL_COLORS.surface,
                '&:hover fieldset': {
                  borderColor: NEUTRAL_COLORS.accent,
                },
                '&.Mui-focused fieldset': {
                  borderColor: NEUTRAL_COLORS.accent,
                  borderWidth: 2,
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: NEUTRAL_COLORS.accent,
              }
            }}
          />
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
            {editingAnswer ? 'Update' : 'Create'}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};