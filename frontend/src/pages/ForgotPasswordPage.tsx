import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Fade,
  Container,
  InputLabel,
  OutlinedInput,
  FormControl,
  InputAdornment,
  alpha,
  Button
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { authService } from '../services/authService';

// Импортируем тот же нейтральный цветовой палитры из страницы входа
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
};

// Компонент текстового поля (аналогичный тому, что в странице входа)
const StyledInputField = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  disabled = false,
  startIcon,
  error = false,
  helperText,
  ...props 
}: any) => (
  <FormControl fullWidth variant="outlined">
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
    <OutlinedInput
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      error={error}
      label={label}
      startAdornment={startIcon ? (
        <InputAdornment position="start">
          {startIcon}
        </InputAdornment>
      ) : undefined}
      sx={{
        borderRadius: 2,
        backgroundColor: NEUTRAL_COLORS.surface,
        '& .MuiOutlinedInput-input': {
          color: NEUTRAL_COLORS.textPrimary,
        },
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
      }}
      {...props}
    />
    {helperText && (
      <Typography 
        variant="caption" 
        sx={{ 
          mt: 0.5,
          color: error ? NEUTRAL_COLORS.error : NEUTRAL_COLORS.textSecondary,
          fontSize: '0.75rem'
        }}
      >
        {helperText}
      </Typography>
    )}
  </FormControl>
);

// Компонент кнопки (аналогичный тому, что в странице входа)
const StyledButton = ({ 
  children, 
  variant = 'contained', 
  startIcon, 
  onClick,
  disabled = false,
  fullWidth = true,
  size = 'large',
  type = 'button',
  ...props 
}: any) => (
  <Button
    variant={variant}
    startIcon={startIcon}
    onClick={onClick}
    disabled={disabled}
    fullWidth={fullWidth}
    size={size}
    type={type}
    {...props}
    sx={{
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: 2,
      py: 1.5,
      fontSize: '1rem',
      letterSpacing: '0.3px',
      transition: 'all 0.2s ease',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      ...(variant === 'contained' && {
        background: `linear-gradient(135deg, ${NEUTRAL_COLORS.accent} 0%, ${alpha(NEUTRAL_COLORS.accent, 0.9)} 100%)`,
        boxShadow: '0 2px 10px rgba(49, 130, 206, 0.2)',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(49, 130, 206, 0.3)',
          transform: 'translateY(-1px)',
        },
        '&:disabled': {
          background: alpha(NEUTRAL_COLORS.secondary, 0.2),
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
      }),
      ...(variant === 'text' && {
        color: NEUTRAL_COLORS.accent,
        '&:hover': {
          backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
        }
      })
    }}
  >
    {children}
  </Button>
);

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [responseData, setResponseData] = useState<{ message: string; email: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Вызываем API метод восстановления пароля
      const response = await authService.forgotPassword(email);
      
      // Сохраняем ответ от сервера
      setResponseData(response);
      setSuccess(true);
      setEmail('');
      
      // Перенаправляем на логин через 5 секунд
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err: any) {
      // Обрабатываем ошибку
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          err.message || 
                          'Ошибка при восстановлении пароля';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (success) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${NEUTRAL_COLORS.background} 0%, ${NEUTRAL_COLORS.gradientEnd} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        display: 'flex',
        alignItems: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 10% 20%, ${alpha(NEUTRAL_COLORS.gradientStart, 0.4)} 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, ${alpha(NEUTRAL_COLORS.gradientEnd, 0.2)} 0%, transparent 50%)
          `,
        }
      }}>
        <Container maxWidth="sm">
          <Fade in timeout={600}>
            <Box>
              {/* Back Button */}
              <StyledButton
                variant="text"
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToHome}
                fullWidth={false}
                sx={{ mb: 2 }}
              >
                Назад на главную
              </StyledButton>

              <Paper 
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 5 },
                  borderRadius: 4,
                  border: `1px solid ${NEUTRAL_COLORS.border}`,
                  backgroundColor: alpha(NEUTRAL_COLORS.surface, 0.95),
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  textAlign: 'center',
                }}
              >
                {/* Success Icon */}
                <Box sx={{ 
                  display: 'inline-flex',
                  p: 3,
                  mb: 3,
                  borderRadius: '50%',
                  backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                  color: NEUTRAL_COLORS.success,
                }}>
                  <CheckCircleIcon sx={{ fontSize: 60 }} />
                </Box>

                {/* Success Message */}
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800,
                    color: NEUTRAL_COLORS.textPrimary,
                    letterSpacing: '-0.025em',
                    mb: 2,
                    fontSize: { xs: '1.75rem', sm: '2rem' }
                  }}
                >
                  {responseData?.message || 'Успешно отправлено!'}
                </Typography>

                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: NEUTRAL_COLORS.textSecondary,
                    fontSize: '1.1rem',
                    mb: 3,
                    lineHeight: 1.6
                  }}
                >
                  Новый пароль был отправлен на ваш email адрес: 
                  <Box component="span" sx={{ fontWeight: 600, color: NEUTRAL_COLORS.textPrimary, ml: 0.5 }}>
                    {email || responseData?.email}
                  </Box>
                </Typography>

                {/* Additional Info */}
                <Box sx={{ 
                  mt: 4,
                  p: 3,
                  backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.03),
                  borderRadius: 2,
                  border: `1px solid ${alpha(NEUTRAL_COLORS.accent, 0.1)}`,
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: NEUTRAL_COLORS.textSecondary,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      mb: 1
                    }}
                  >
                    <InfoIcon sx={{ fontSize: 16, mt: 0.25 }} />
                    Проверьте папку «Спам», если письмо не пришло
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: NEUTRAL_COLORS.textSecondary,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1
                    }}
                  >
                    <InfoIcon sx={{ fontSize: 16, mt: 0.25 }} />
                    Используйте отправленный пароль для входа в систему
                  </Typography>
                </Box>

                {/* Countdown and Redirect */}
                <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${NEUTRAL_COLORS.border}` }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: NEUTRAL_COLORS.textSecondary,
                      mb: 2
                    }}
                  >
                    Перенаправление на страницу входа через 5 секунд...
                  </Typography>

                  <StyledButton
                    variant="contained"
                    onClick={handleBackToLogin}
                    fullWidth
                  >
                    Вернуться к входу
                  </StyledButton>
                </Box>
              </Paper>

              {/* Footer */}
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  mt: 3,
                  textAlign: 'center',
                  color: alpha(NEUTRAL_COLORS.textSecondary, 0.7),
                  fontSize: '0.75rem'
                }}
              >
                © {new Date().getFullYear()} InterviewBox. Платформа для подготовки к собеседованиям.
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${NEUTRAL_COLORS.background} 0%, ${NEUTRAL_COLORS.gradientEnd} 100%)`,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex',
      alignItems: 'center',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 10% 20%, ${alpha(NEUTRAL_COLORS.gradientStart, 0.4)} 0%, transparent 50%),
          radial-gradient(circle at 90% 80%, ${alpha(NEUTRAL_COLORS.gradientEnd, 0.2)} 0%, transparent 50%)
        `,
      }
    }}>
      <Container maxWidth="sm">
        <Fade in timeout={600}>
          <Box>
            {/* Back Button */}
            <StyledButton
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToHome}
              fullWidth={false}
              sx={{ mb: 2 }}
            >
              Назад на главную
            </StyledButton>

            <Paper 
              elevation={0}
              sx={{
                p: { xs: 3, sm: 5 },
                borderRadius: 4,
                border: `1px solid ${NEUTRAL_COLORS.border}`,
                backgroundColor: alpha(NEUTRAL_COLORS.surface, 0.95),
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              }}
            >
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box sx={{ 
                  display: 'inline-flex',
                  p: 2,
                  mb: 2,
                  borderRadius: '50%',
                  backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                  color: NEUTRAL_COLORS.accent,
                }}>
                  <EmailIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800,
                    color: NEUTRAL_COLORS.textPrimary,
                    letterSpacing: '-0.025em',
                    mb: 1,
                    fontSize: { xs: '2rem', sm: '2.5rem' }
                  }}
                >
                  Восстановление пароля
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: NEUTRAL_COLORS.textSecondary,
                    fontSize: '1.1rem'
                  }}
                >
                  Введите email, указанный при регистрации
                </Typography>
              </Box>

              {/* Error Alert */}
              {error && (
                <Fade in>
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
                    onClose={() => setError('')}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              {/* Info Alert */}
              <Alert 
                severity="info" 
                sx={{ 
                  color: NEUTRAL_COLORS.accent,
                  mb: 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(NEUTRAL_COLORS.accent, 0.2)}`,
                  backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.03),
                  '& .MuiAlert-icon': {
                    fontSize: 24
                  }
                }}
              >
                На ваш email будет отправлен новый пароль
              </Alert>

              {/* Forgot Password Form */}
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <StyledInputField
                    label="Адрес электронной почты"
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    disabled={loading}
                    startIcon={<EmailIcon sx={{ color: NEUTRAL_COLORS.textSecondary }} />}
                    required
                    autoComplete="email"
                  />

                  <StyledButton
                    variant="contained"
                    type="submit"
                    disabled={loading || !email}
                  >
                    {loading ? (
                      <CircularProgress 
                        size={24} 
                        sx={{ color: 'white' }} 
                      />
                    ) : (
                      'Восстановить пароль'
                    )}
                  </StyledButton>
                </Stack>
              </form>

              {/* Divider */}
              <Box sx={{ my: 4, position: 'relative' }}>
                <Box sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: 0, 
                  right: 0, 
                  height: '1px', 
                  backgroundColor: NEUTRAL_COLORS.border 
                }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    position: 'relative',
                    display: 'inline-block',
                    px: 2,
                    backgroundColor: NEUTRAL_COLORS.surface,
                    color: NEUTRAL_COLORS.textSecondary,
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  Вспомнили пароль?
                </Typography>
              </Box>

              {/* Back to Login */}
              <Box sx={{ textAlign: 'center' }}>
                <StyledButton
                  variant="outlined"
                  onClick={handleBackToLogin}
                >
                  Вернуться к входу
                </StyledButton>
              </Box>
            </Paper>

            {/* Footer */}
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                mt: 3,
                textAlign: 'center',
                color: alpha(NEUTRAL_COLORS.textSecondary, 0.7),
                fontSize: '0.75rem'
              }}
            >
              © {new Date().getFullYear()} InterviewBox. Платформа для подготовки к собеседованиям.
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};
