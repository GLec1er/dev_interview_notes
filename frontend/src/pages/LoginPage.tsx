import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  InputAdornment,
  IconButton,
  alpha,
  Fade,
  InputLabel,
  OutlinedInput,
  FormControl,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

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
  endIcon,
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
      endAdornment={endIcon ? (
        <InputAdornment position="end">
          {endIcon}
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

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email || !password) {
      setLocalError('Пожалуйста, заполните все поля');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setLocalError(err.response?.data?.detail || 'Вход в систему не удался. Пожалуйста, проверьте свои учетные данные.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, login, navigate, clearError]);

  const handleShowPassword = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  const handleBackToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

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
                  <LoginIcon sx={{ fontSize: 40 }} />
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
                  Добро пожаловать
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: GLASS_COLORS.textSecondary,
                    fontSize: '1.1rem'
                  }}
                >          
                Войдите в свою учетную запись InterviewBox
                </Typography>
              </Box>

              {/* Error Alert в стеклянном стиле */}
              {(error || localError) && (
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
                    onClose={() => {
                      clearError();
                      setLocalError('');
                    }}
                  >
                    {error || localError}
                  </Alert>
                </Fade>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <GlassInputField
                    label="Адрес электронной почты"
                    type="email"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                    disabled={isLoading}
                    startIcon={<EmailIcon sx={{ color: GLASS_COLORS.textSecondary }} />}
                  />

                  <GlassInputField
                    label="Пароль"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                    disabled={isLoading}
                    startIcon={<LockIcon sx={{ color: GLASS_COLORS.textSecondary }} />}
                    endIcon={
                      <IconButton
                        onClick={handleShowPassword}
                        edge="end"
                        sx={{ color: GLASS_COLORS.textSecondary }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    }
                  />

                  <Box sx={{ textAlign: 'right' }}>
                    <Link
                      to="/forgot-password"
                      style={{
                        color: GLASS_COLORS.primary,
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        '&:hover': {
                          textDecoration: 'underline',
                        }
                      }}
                    >
                      Забыли пароль?
                    </Link>
                  </Box>

                  <GlassButton
                    variant="contained"
                    startIcon={isLoading ? null : <LoginIcon />}
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <CircularProgress 
                        size={24} 
                        sx={{ color: 'white' }} 
                      />
                    ) : (
                      'Войти'
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
                  У вас нет аккаунта?
                </Typography>
              </Box>

              {/* Register Link */}
              <Box sx={{ textAlign: 'center' }}>
                <GlassButton
                  variant="outlined"
                  onClick={() => navigate('/register')}
                >
                  Создать новую учетную запись
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