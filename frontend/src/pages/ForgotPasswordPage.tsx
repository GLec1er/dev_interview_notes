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

// Стеклянная цветовая палитра iOS 26 Liquid Glass
const GLASS_COLORS = {
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
  info: 'rgba(90, 200, 250, 0.8)',
  gradientStart: 'rgba(255, 255, 255, 0.3)',
  gradientEnd: 'rgba(255, 255, 255, 0.1)',
  glassOverlay: 'rgba(255, 255, 255, 0.2)',
  glassHighlight: 'rgba(255, 255, 255, 0.5)',
};

// Компонент текстового поля в стеклянном стиле
const GlassInputField = ({ 
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
        color: GLASS_COLORS.textSecondary,
        '&.Mui-focused': {
          color: GLASS_COLORS.primary,
        },
        '&.Mui-error': {
          color: GLASS_COLORS.error,
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
        borderRadius: 3,
        background: GLASS_COLORS.surface,
        backdropFilter: 'blur(10px)',
        '& .MuiOutlinedInput-input': {
          color: GLASS_COLORS.textPrimary,
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: GLASS_COLORS.border,
          borderWidth: 1.5,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: GLASS_COLORS.primary,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: GLASS_COLORS.primary,
          borderWidth: 2,
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: GLASS_COLORS.error,
        },
      }}
      {...props}
    />
    {helperText && (
      <Typography 
        variant="caption" 
        sx={{ 
          mt: 0.5,
          color: error ? GLASS_COLORS.error : GLASS_COLORS.textSecondary,
          fontSize: '0.75rem'
        }}
      >
        {helperText}
      </Typography>
    )}
  </FormControl>
);

// Стилизованная кнопка в стеклянном стиле
const GlassButton = ({ 
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
      borderRadius: 3,
      py: 1.5,
      fontSize: '1rem',
      letterSpacing: '-0.01em',
      transition: 'all 0.3s ease',
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      ...(variant === 'contained' && {
        background: `linear-gradient(135deg, ${GLASS_COLORS.primary} 0%, ${alpha(GLASS_COLORS.primary, 0.6)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: alpha('#FFFFFF', 0.3),
        boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.primary, 0.2)}`,
        '&:hover': {
          background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.primary, 0.5)})`,
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 20px ${alpha(GLASS_COLORS.primary, 0.3)}`,
        },
        '&:disabled': {
          background: alpha(GLASS_COLORS.surface, 0.5),
          color: alpha(GLASS_COLORS.textSecondary, 0.5),
        }
      }),
      ...(variant === 'outlined' && {
        borderWidth: 1.5,
        borderColor: GLASS_COLORS.border,
        color: GLASS_COLORS.textPrimary,
        background: GLASS_COLORS.surface,
        backdropFilter: 'blur(10px)',
        '&:hover': {
          borderColor: GLASS_COLORS.primary,
          background: alpha(GLASS_COLORS.primary, 0.1),
        }
      }),
      ...(variant === 'text' && {
        color: GLASS_COLORS.primary,
        '&:hover': {
          background: alpha(GLASS_COLORS.primary, 0.1),
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
      const response = await authService.forgotPassword(email);
      setResponseData(response);
      setSuccess(true);
      setEmail('');
      
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err: any) {
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
        background: 'linear-gradient(135deg, #E0F0FF 0%, #D0E4FF 50%, #B8D8FF 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
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
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(200, 220, 255, 0.5) 0%, transparent 60%)
          `,
          pointerEvents: 'none',
        }
      }}>
        <Container maxWidth="sm">
          <Fade in timeout={600}>
            <Box>
              {/* Back Button */}
              <GlassButton
                variant="text"
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToHome}
                fullWidth={false}
                sx={{ mb: 2 }}
              >
                Назад на главную
              </GlassButton>

              <Paper 
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 5 },
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: GLASS_COLORS.border,
                  background: GLASS_COLORS.surface,
                  backdropFilter: 'blur(30px)',
                  WebkitBackdropFilter: 'blur(30px)',
                  boxShadow: '0 16px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
                  textAlign: 'center',
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
                    opacity: 0.5,
                    pointerEvents: 'none',
                  },
                }}
              >
                {/* Success Icon */}
                <Box sx={{ 
                  display: 'inline-flex',
                  p: 3,
                  mb: 3,
                  borderRadius: '50%',
                  background: alpha(GLASS_COLORS.success, 0.15),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha(GLASS_COLORS.success, 0.3),
                  color: GLASS_COLORS.success,
                  boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.success, 0.2)}`,
                }}>
                  <CheckCircleIcon sx={{ fontSize: 60 }} />
                </Box>

                {/* Success Message */}
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    color: GLASS_COLORS.textPrimary,
                    letterSpacing: '-0.02em',
                    mb: 2,
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    textShadow: '0 2px 10px rgba(255,255,255,0.5)',
                  }}
                >
                  {responseData?.message || 'Успешно отправлено!'}
                </Typography>

                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: GLASS_COLORS.textSecondary,
                    fontSize: '1.1rem',
                    mb: 3,
                    lineHeight: 1.6
                  }}
                >
                  Новый пароль был отправлен на ваш email адрес: 
                  <Box component="span" sx={{ fontWeight: 600, color: GLASS_COLORS.textPrimary, ml: 0.5 }}>
                    {email || responseData?.email}
                  </Box>
                </Typography>

                {/* Additional Info в стеклянном стиле */}
                <Box sx={{ 
                  mt: 4,
                  p: 3,
                  background: alpha(GLASS_COLORS.info, 0.1),
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: alpha(GLASS_COLORS.info, 0.3),
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: GLASS_COLORS.textSecondary,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      mb: 1
                    }}
                  >
                    <InfoIcon sx={{ fontSize: 16, mt: 0.25, color: GLASS_COLORS.info }} />
                    Проверьте папку «Спам», если письмо не пришло
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: GLASS_COLORS.textSecondary,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1
                    }}
                  >
                    <InfoIcon sx={{ fontSize: 16, mt: 0.25, color: GLASS_COLORS.info }} />
                    Используйте отправленный пароль для входа в систему
                  </Typography>
                </Box>

                {/* Countdown and Redirect */}
                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: GLASS_COLORS.border }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: GLASS_COLORS.textSecondary,
                      mb: 2
                    }}
                  >
                    Перенаправление на страницу входа через 5 секунд...
                  </Typography>

                  <GlassButton
                    variant="contained"
                    onClick={handleBackToLogin}
                    fullWidth
                  >
                    Вернуться к входу
                  </GlassButton>
                </Box>
              </Paper>

              {/* Footer */}
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  mt: 3,
                  textAlign: 'center',
                  color: alpha(GLASS_COLORS.textSecondary, 0.7),
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
      background: 'linear-gradient(135deg, #E0F0FF 0%, #D0E4FF 50%, #B8D8FF 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
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
          radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(200, 220, 255, 0.5) 0%, transparent 60%)
        `,
        pointerEvents: 'none',
      }
    }}>
      <Container maxWidth="sm">
        <Fade in timeout={600}>
          <Box>
            {/* Back Button */}
            <GlassButton
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToHome}
              fullWidth={false}
              sx={{ mb: 2 }}
            >
              Назад на главную
            </GlassButton>

            <Paper 
              elevation={0}
              sx={{
                p: { xs: 3, sm: 5 },
                borderRadius: 4,
                border: '1px solid',
                borderColor: GLASS_COLORS.border,
                background: GLASS_COLORS.surface,
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                boxShadow: '0 16px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
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
                  opacity: 0.5,
                  pointerEvents: 'none',
                },
              }}
            >
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 4, position: 'relative', zIndex: 1 }}>
                <Box sx={{ 
                  display: 'inline-flex',
                  p: 2,
                  mb: 2,
                  borderRadius: '50%',
                  background: alpha(GLASS_COLORS.primary, 0.15),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha(GLASS_COLORS.primary, 0.3),
                  color: GLASS_COLORS.primary,
                  boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.primary, 0.2)}`,
                }}>
                  <EmailIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700,
                    color: GLASS_COLORS.textPrimary,
                    letterSpacing: '-0.02em',
                    mb: 1,
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                    textShadow: '0 2px 10px rgba(255,255,255,0.5)',
                  }}
                >
                  Восстановление пароля
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: GLASS_COLORS.textSecondary,
                    fontSize: '1.1rem'
                  }}
                >
                  Введите email, указанный при регистрации
                </Typography>
              </Box>

              {/* Error Alert в стеклянном стиле */}
              {error && (
                <Fade in>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 3,
                      background: alpha(GLASS_COLORS.error, 0.15),
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: alpha(GLASS_COLORS.error, 0.3),
                      color: GLASS_COLORS.error,
                      '& .MuiAlert-icon': {
                        fontSize: 24,
                        color: GLASS_COLORS.error,
                      }
                    }}
                    onClose={() => setError('')}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              {/* Info Alert в стеклянном стиле */}
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  background: alpha(GLASS_COLORS.info, 0.15),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha(GLASS_COLORS.info, 0.3),
                  color: GLASS_COLORS.info,
                  '& .MuiAlert-icon': {
                    fontSize: 24,
                    color: GLASS_COLORS.info,
                  }
                }}
              >
                На ваш email будет отправлен новый пароль
              </Alert>

              {/* Forgot Password Form */}
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <GlassInputField
                    label="Адрес электронной почты"
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    disabled={loading}
                    startIcon={<EmailIcon sx={{ color: GLASS_COLORS.textSecondary }} />}
                    required
                    autoComplete="email"
                  />

                  <GlassButton
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
                  </GlassButton>
                </Stack>
              </form>

              {/* Divider в стеклянном стиле */}
              <Box sx={{ my: 4, position: 'relative' }}>
                <Box sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: 0, 
                  right: 0, 
                  height: '1px', 
                  background: `linear-gradient(90deg, transparent, ${GLASS_COLORS.border}, transparent)`,
                }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    position: 'relative',
                    display: 'inline-block',
                    px: 2,
                    background: GLASS_COLORS.surface,
                    backdropFilter: 'blur(10px)',
                    color: GLASS_COLORS.textSecondary,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: GLASS_COLORS.border,
                    py: 0.5,
                  }}
                >
                  Вспомнили пароль?
                </Typography>
              </Box>

              {/* Back to Login */}
              <Box sx={{ textAlign: 'center' }}>
                <GlassButton
                  variant="outlined"
                  onClick={handleBackToLogin}
                >
                  Вернуться к входу
                </GlassButton>
              </Box>
            </Paper>

            {/* Footer */}
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                mt: 3,
                textAlign: 'center',
                color: alpha(GLASS_COLORS.textSecondary, 0.7),
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