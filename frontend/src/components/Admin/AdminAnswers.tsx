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
  Tabs,
  Tab,
  Switch,
  Tooltip,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QuestionAnswer as AnswerIcon,
  Info as InfoIcon,
  CheckCircle as PublishedIcon,
  RemoveCircle as UnpublishedIcon,
} from '@mui/icons-material';
import { questionService } from '../../services/questionService';
import { answerService } from '../../services/answerService';
import { ContentEditor } from './ContentEditor';
import type { Question, Answer, ContentBlock } from '../../types';

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
            backgroundColor: NEUTRAL_COLORS.surface,
            '& .MuiMenuItem-root': {
              color: NEUTRAL_COLORS.textPrimary,
              backgroundColor: NEUTRAL_COLORS.surface,
              '&:hover': {
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.08),
              },
              '&.Mui-selected': {
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.12),
                color: NEUTRAL_COLORS.accent,
                '&:hover': {
                  backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.15),
                },
              },
              '&.Mui-focusVisible': {
                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
              },
            },
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
        },
        '&.Mui-disabled': {
          background: alpha(NEUTRAL_COLORS.secondary, 0.3),
          color: alpha(NEUTRAL_COLORS.textSecondary, 0.5),
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
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);
  const [isLoadingAnswerDetail, setIsLoadingAnswerDetail] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<Answer | null>(null);
  const [contentTab, setContentTab] = useState(0);
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [jsonContent, setJsonContent] = useState<string>('[]');
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

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
      setIsLoadingAnswers(true);
      const data = await answerService.getAnswers(selectedQuestionId);
      setAnswers(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load answers:', err);
      setError('Failed to load answers');
    } finally {
      setIsLoadingAnswers(false);
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

  // Синхронизация между контентом и JSON
  useEffect(() => {
    if (contentTab === 0 && content.length > 0) {
      try {
        setJsonContent(JSON.stringify(content, null, 2));
      } catch (err) {
        console.error('Error converting content to JSON:', err);
      }
    }
  }, [content, contentTab]);

  const handleOpenDialog = async (answer?: Answer) => {
    if (answer) {
      try {
        setIsLoadingAnswerDetail(true);
        
        // Загружаем полный ответ с сервера
        const fullAnswer = await answerService.getAnswer(selectedQuestionId, answer.id);
        setEditingAnswer(fullAnswer);
        
        // Используем контент из загруженного ответа
        const normalizedContent = fullAnswer.content || [];
        
        setContent(normalizedContent);
        setJsonContent(JSON.stringify(normalizedContent, null, 2));
        setIsPublished(fullAnswer.is_published || false);
        
      } catch (err) {
        console.error('Failed to load answer details:', err);
        setError('Failed to load answer details. Using cached data.');
        
        // Используем кэшированные данные если не удалось загрузить
        setEditingAnswer(answer);
        const normalizedContent = answer.content || [];
        setContent(normalizedContent);
        setJsonContent(JSON.stringify(normalizedContent, null, 2));
        setIsPublished(answer.is_published || false);
      } finally {
        setIsLoadingAnswerDetail(false);
      }
    } else {
      setEditingAnswer(null);
      setContent([]);
      setJsonContent('[]');
      setIsPublished(false);
    }
    setContentTab(0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAnswer(null);
    setContent([]);
    setJsonContent('[]');
    setIsPublished(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!selectedQuestionId) {
      setError('Please select a question first');
      return;
    }
    
    try {
      setError(null);
      
      let contentToSave = content;
      
      // Если активна вкладка JSON, парсим JSON
      if (contentTab === 1) {
        try {
          contentToSave = JSON.parse(jsonContent);
          // Валидируем что это массив
          if (!Array.isArray(contentToSave)) {
            throw new Error('Content must be a JSON array');
          }
        } catch (err) {
          setError('Invalid JSON format: ' + (err as Error).message);
          return;
        }
      }
      
      if (contentToSave.length === 0) {
        setError('Content cannot be empty');
        return;
      }

      if (editingAnswer) {
        await answerService.updateAnswer(selectedQuestionId, editingAnswer.id, {
          content: contentToSave,
          is_published: isPublished,
        });
      } else {
        await answerService.createAnswer(selectedQuestionId, {
          content: contentToSave,
          is_published: isPublished,
        });
      }
      handleCloseDialog();
      loadAnswers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save answer');
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

  const handleTogglePublished = async (answer: Answer) => {
    try {
      setUpdatingIds(prev => new Set(prev).add(answer.id));
      setError(null);

      await answerService.updateAnswer(selectedQuestionId, answer.id, {
        content: answer.content,
        is_published: !answer.is_published,
      });

      // Обновляем локальное состояние
      setAnswers(prev =>
        prev.map(ans =>
          ans.id === answer.id
            ? { ...ans, is_published: !ans.is_published }
            : ans
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update answer status');
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(answer.id);
        return newSet;
      });
    }
  };

  const getContentPreview = (content: ContentBlock[]) => {
    if (!content || content.length === 0) return 'No content';
    
    const firstBlock = content[0];
    switch (firstBlock.type) {
      case 'heading':
      case 'paragraph':
      case 'info':
      case 'warning':
        return firstBlock.data?.text?.substring(0, 150) || 'No text content';
      case 'code':
        return `Code block (${firstBlock.data?.language || 'text'})`;
      case 'image':
        return `Image: ${firstBlock.data?.alt || firstBlock.data?.url || 'No description'}`;
      default:
        return 'Unknown content type';
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
              <Box sx={{ ml: 'auto' }}>
                <Chip
                  label={selectedQuestion.difficulty}
                  size="medium"
                  sx={{
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    backgroundColor: selectedQuestion.difficulty === 'easy' 
                      ? alpha(NEUTRAL_COLORS.success, 0.1) 
                      : selectedQuestion.difficulty === 'medium'
                      ? alpha(NEUTRAL_COLORS.warning, 0.1)
                      : alpha(NEUTRAL_COLORS.error, 0.1),
                    color: selectedQuestion.difficulty === 'easy' 
                      ? NEUTRAL_COLORS.success 
                      : selectedQuestion.difficulty === 'medium'
                      ? NEUTRAL_COLORS.warning
                      : NEUTRAL_COLORS.error,
                  }}
                />
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
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 600,
                  color: NEUTRAL_COLORS.textPrimary
                }}
              >
                Answers ({answers.length})
              </Typography>
              {isLoadingAnswers && (
                <CircularProgress size={20} sx={{ color: NEUTRAL_COLORS.accent }} />
              )}
            </Stack>
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
                        width: '50%'
                      }}>
                        Content Preview
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: NEUTRAL_COLORS.textPrimary,
                        borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                        py: 2,
                        width: '20%'
                      }}>
                        Blocks
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: NEUTRAL_COLORS.textPrimary,
                        borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                        py: 2,
                        width: '15%'
                      }}>
                        Status
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 600, 
                        color: NEUTRAL_COLORS.textPrimary,
                        borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                        py: 2,
                        width: '15%'
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
                    {answers.map((answer) => {
                      const preview = getContentPreview(answer.content);
                      const blockCount = answer.content?.length || 0;
                      const hasCode = answer.content?.some(block => block.type === 'code');
                      
                      return (
                        <StyledTableRow key={answer.id}>
                          <TableCell sx={{ py: 2 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: NEUTRAL_COLORS.textPrimary,
                                mb: 0.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {preview}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ color: NEUTRAL_COLORS.textSecondary }}
                            >
                              Updated: {new Date(answer.updated_at || answer.created_at || '').toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={`${blockCount} blocks`}
                                size="small"
                                sx={{
                                  fontWeight: 500,
                                  backgroundColor: alpha(NEUTRAL_COLORS.info, 0.1),
                                  color: NEUTRAL_COLORS.info,
                                }}
                              />
                              {hasCode && (
                                <Chip
                                  label="Code"
                                  size="small"
                                  sx={{
                                    fontWeight: 500,
                                    backgroundColor: alpha('#DD4B39', 0.1),
                                    color: '#DD4B39',
                                  }}
                                />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              icon={answer.is_published ? <PublishedIcon /> : <UnpublishedIcon />}
                              label={answer.is_published ? 'Published' : 'Draft'}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                backgroundColor: answer.is_published 
                                  ? alpha(NEUTRAL_COLORS.success, 0.1) 
                                  : alpha(NEUTRAL_COLORS.secondary, 0.1),
                                color: answer.is_published 
                                  ? NEUTRAL_COLORS.success 
                                  : NEUTRAL_COLORS.secondary,
                                border: `1px solid ${answer.is_published 
                                  ? alpha(NEUTRAL_COLORS.success, 0.3) 
                                  : alpha(NEUTRAL_COLORS.secondary, 0.3)}`,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ py: 2 }}>
                            <Tooltip 
                              title={`Click to ${answer.is_published ? 'unpublish' : 'publish'}`}
                              placement="top"
                            >
                              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                {updatingIds.has(answer.id) ? (
                                  <CircularProgress 
                                    size={24} 
                                    sx={{ 
                                      color: NEUTRAL_COLORS.accent,
                                      mx: 1
                                    }} 
                                  />
                                ) : (
                                  <Switch
                                    checked={answer.is_published}
                                    onChange={() => handleTogglePublished(answer)}
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
            maxHeight: '90vh',
            backgroundColor: NEUTRAL_COLORS.surface,
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${NEUTRAL_COLORS.border}`,
          pb: 2,
          fontWeight: 700,
          color: NEUTRAL_COLORS.textPrimary,
          position: 'relative'
        }}>
          {editingAnswer ? 'Edit Answer' : 'Create New Answer'}
          {isLoadingAnswerDetail && (
            <CircularProgress 
              size={20} 
              sx={{ 
                position: 'absolute', 
                right: 24, 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: NEUTRAL_COLORS.accent
              }} 
            />
          )}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {isLoadingAnswerDetail ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: 200 
            }}>
              <CircularProgress 
                size={40}
                sx={{ color: NEUTRAL_COLORS.accent }}
              />
            </Box>
          ) : (
            <>
              <Stack spacing={3}>
                {/* Publication Status */}
                <Box sx={{ 
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${NEUTRAL_COLORS.border}`,
                  backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        color="success"
                      />
                    }
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        {isPublished ? (
                          <PublishedIcon sx={{ color: NEUTRAL_COLORS.success }} />
                        ) : (
                          <UnpublishedIcon sx={{ color: NEUTRAL_COLORS.secondary }} />
                        )}
                        <Typography sx={{ 
                          fontWeight: 600,
                          color: isPublished ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.textPrimary
                        }}>
                          {isPublished ? 'Answer is published' : 'Answer is draft'}
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
                    {isPublished 
                      ? 'This answer is visible to users' 
                      : 'This answer is only visible in admin panel'}
                  </Typography>
                </Box>

                {/* Content Editor Tabs */}
                <Box>
                  <Tabs 
                    value={contentTab} 
                    onChange={(e, v) => setContentTab(v)}
                    sx={{ mb: 3 }}
                  >
                    <Tab label="Visual Editor" />
                    <Tab label="JSON Editor" />
                  </Tabs>
                  
                  {contentTab === 0 ? (
                    <ContentEditor
                      content={content}
                      onChange={setContent}
                      maxHeight="400px"
                    />
                  ) : (
                    <>
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
                        Edit answer content as JSON array. Use the Visual Editor for a more user-friendly interface.
                      </Alert>
                      <TextField
                        fullWidth
                        label="Content (JSON)"
                        value={jsonContent}
                        onChange={(e) => setJsonContent(e.target.value)}
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
                    </>
                  )}
                </Box>
              </Stack>
            </>
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
            disabled={isLoadingAnswerDetail}
          >
            Cancel
          </StyledButton>
          <StyledButton
            variant="contained"
            onClick={handleSave}
            disabled={isLoadingAnswerDetail || (contentTab === 0 ? content.length === 0 : jsonContent.trim() === '[]')}
          >
            {editingAnswer ? 'Update' : 'Create'}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};