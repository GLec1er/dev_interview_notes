import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
  Typography,
  type SelectChangeEvent,
  IconButton,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import { 
  Send as SendIcon, 
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { feedbackService } from '../services/feedbackService';
import type { FeedbackData } from '../services/feedbackService';

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
}

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  open,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  
  const [formData, setFormData] = useState<FeedbackData>({
    subject: '',
    message: '',
    feedbackType: 'general',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      setError('Пожалуйста, заполните тему и сообщение');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Сразу закрываем диалог
      handleClose();
      
      // Отправляем данные
      await feedbackService.sendFeedback(formData);
      
      // Показываем успешное уведомление с зеленым цветом
      setSnackbar({
        open: true,
        message: 'Сообщение успешно отправлено команде по развитию!',
        severity: 'success',
      });
      
    } catch (err: any) {
      console.error('Feedback error:', err);
      
      // Показываем ошибку в уведомлении
      setSnackbar({
        open: true,
        message: err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                'Ошибка при отправке сообщения. Попробуйте позже.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      message: '',
      feedbackType: 'general',
    });
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const isFormValid = formData.subject.trim() && formData.message.trim();

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        disableScrollLock={true}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e0e0e0',
            maxHeight: '90vh',
            my: 2,
            mx: 'auto',
          },
        }}
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'flex-start',
            mt: 8,
          },
          '& .MuiDialog-paper': {
            margin: '24px',
          },
        }}
        component="form"
        onSubmit={handleSubmit}
      >
        <DialogTitle
          sx={{
            borderBottom: '1px solid #e0e0e0',
            pb: 2,
            pt: 3,
            color: '#1a237e',
            fontWeight: 700,
            fontSize: '1.25rem',
            backgroundColor: '#f5f5f5',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Отправить замечание или предложение
          <IconButton
            onClick={handleClose}
            sx={{ color: '#1a237e' }}
            disabled={loading}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ 
          pt: 3, 
          backgroundColor: '#ffffff',
          overflowY: 'auto',
        }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                backgroundColor: '#ffebee',
                color: '#c62828',
                '& .MuiAlert-icon': {
                  color: '#f44336',
                }
              }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Stack spacing={2.5} sx={{ mt: 1, marginTop: 3 }}>
            <FormControl fullWidth>
              <InputLabel 
                sx={{ 
                  color: 'rgba(0, 0, 0, 0.7)',
                  backgroundColor: '#ffffff',
                  px: 0.5,
                }}
              >
                Тип обратной связи
              </InputLabel>
              <Select
                name="feedbackType"
                value={formData.feedbackType}
                onChange={handleSelectChange}
                label="Тип обратной связи"
                sx={{
                  color: '#333333',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#bdbdbd',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                    borderWidth: '2px',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'rgba(0, 0, 0, 0.7)',
                  },
                  backgroundColor: '#ffffff',
                  mt: 0.5,
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 200,
                    }
                  }
                }}
              >
                <MenuItem value="suggestion">💡 Предложение</MenuItem>
                <MenuItem value="bug">🐛 Ошибка/Проблема</MenuItem>
                <MenuItem value="general">💬 Общее замечание</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Тема"
              fullWidth
              value={formData.subject}
              onChange={handleInputChange}
              name="subject"
              variant="outlined"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#333333',
                  backgroundColor: '#ffffff',
                  '& fieldset': {
                    borderColor: '#bdbdbd',
                  },
                  '&:hover fieldset': {
                    borderColor: '#1976d2',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                    borderWidth: '2px',
                  },
                },
              }}
              InputLabelProps={{
                sx: { 
                  color: 'rgba(0, 0, 0, 0.7)',
                  backgroundColor: '#ffffff',
                  px: 0.5,
                },
              }}
            />

            <TextField
              label="Сообщение"
              fullWidth
              multiline
              rows={4}
              value={formData.message}
              onChange={handleInputChange}
              name="message"
              variant="outlined"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#333333',
                  backgroundColor: '#ffffff',
                  '& fieldset': {
                    borderColor: '#bdbdbd',
                  },
                  '&:hover fieldset': {
                    borderColor: '#1976d2',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                    borderWidth: '2px',
                  },
                  '& textarea': {
                    backgroundColor: '#ffffff',
                  },
                },
              }}
              InputLabelProps={{
                sx: { 
                  color: 'rgba(0, 0, 0, 0.7)',
                  backgroundColor: '#ffffff',
                  px: 0.5,
                },
              }}
            />

            <Box sx={{ pb: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                Сообщение будет отправлено на почту команде по развитию
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: '1px solid #e0e0e0',
            pt: 2,
            pb: 2,
            px: 3,
            backgroundColor: '#f5f5f5',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
            position: 'sticky',
            bottom: 0,
          }}
        >
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            startIcon={<CloseIcon />}
            sx={{
              color: '#1976d2',
              borderColor: '#1976d2',
              '&:hover': {
                borderColor: '#0d47a1',
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              },
              '&:disabled': {
                color: 'rgba(0, 0, 0, 0.26)',
                borderColor: 'rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={loading || !isFormValid}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
              color: '#ffffff',
              '&:hover': {
                background: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
              },
              '&:disabled': {
                background: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
                color: 'rgba(0, 0, 0, 0.26)',
              },
            }}
          >
            {loading ? 'Отправка...' : 'Отправить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомление о результате отправки - с зеленым цветом для успеха */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            fontSize: '16px',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            '&.MuiAlert-standardSuccess': {
              backgroundColor: '#4caf50', // Зеленый цвет
              color: '#ffffff',
              '& .MuiAlert-icon': {
                color: '#ffffff',
              },
              '& .MuiAlert-message': {
                color: '#ffffff',
              },
              border: '1px solid #388e3c',
              background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
            },
            '&.MuiAlert-standardError': {
              backgroundColor: '#f44336',
              color: '#ffffff',
              '& .MuiAlert-icon': {
                color: '#ffffff',
              },
              '& .MuiAlert-message': {
                color: '#ffffff',
              },
              border: '1px solid #d32f2f',
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            },
          }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="large" />,
            error: <ErrorIcon fontSize="large" />,
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2,
          }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {snackbar.message}
            </Typography>
          </Box>
        </MuiAlert>
      </Snackbar>
    </>
  );
};