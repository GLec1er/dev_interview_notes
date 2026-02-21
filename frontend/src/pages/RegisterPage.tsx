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
  InputAdornment,
  IconButton,
  alpha,
  Fade,
  Stack,
  LinearProgress,
  InputLabel,
  OutlinedInput,
  FormControl,
  Grid,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PersonAdd as RegisterIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
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

interface PasswordRequirement {
  text: string;
  validator: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    text: 'Не менее 8 символов',
    validator: (pwd) => pwd.length >= 8,
  },
  {
    text: 'Содержит строчную букву',
    validator: (pwd) => /[a-z]/.test(pwd),
  },
  {
    text: 'Содержит заглавную букву',
    validator: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    text: 'Содержит номер',
    validator: (pwd) => /[0-9]/.test(pwd),
  },
  {
    text: 'Содержит особый символ',
    validator: (pwd) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd),
  },
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setLocalError('Пожалуйста, заполните все обязательные поля');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Пароли не совпадают');
      return false;
    }

    for (const req of PASSWORD_REQUIREMENTS) {
      if (!req.validator(formData.password)) {
        setLocalError(`Пароль должен содержать: ${req.text}`);
        return false;
      }
    }

    return true;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      await register(formData.email, formData.password, formData.firstName, formData.lastName);
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Ошибка регистрации:', err);
      setLocalError(err.response?.data?.detail || 'Регистрация не удалась. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, register, navigate, validateForm, clearError]);

  const handleShowPassword = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  const handleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword(!showConfirmPassword);
  }, [showConfirmPassword]);

  const handleBackToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const calculatePasswordStrength = useCallback((password: string): number => {
    let strength = 0;
    PASSWORD_REQUIREMENTS.forEach(req => {
      if (req.validator(password)) strength++;
    });
    return (strength / PASSWORD_REQUIREMENTS.length) * 100;
  }, []);

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 40) return GLASS_COLORS.error;
    if (strength < 70) return GLASS_COLORS.warning;
    return GLASS_COLORS.success;
  };

  const getPasswordStrengthLabel = (strength: number) => {
    if (strength < 40) return 'Слабый';
    if (strength < 70) return 'Средний';
    return 'Сильный';
  };

  const passwordStrength = calculatePasswordStrength(formData.password);
  const passwordMatch = formData.password === formData.confirmPassword;
  const passwordError = formData.confirmPassword && !passwordMatch;

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
      <Container maxWidth="md">
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
                  <RegisterIcon sx={{ fontSize: 40 }} />
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
                  Зарегистрироваться
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: GLASS_COLORS.textSecondary,
                    fontSize: '1.1rem'
                  }}
                >
                  Присоединяйтесь к InterviewBox, чтобы отточить свои навыки прохождения собеседований.
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

              {/* Registration Form */}
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <GlassInputField
                      label="Имя"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={isLoading}
                      startIcon={<PersonIcon sx={{ color: GLASS_COLORS.textSecondary }} />}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <GlassInputField
                      label="Фамилия"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={isLoading}
                      startIcon={<PersonIcon sx={{ color: GLASS_COLORS.textSecondary }} />}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <GlassInputField
                      label="Адрес электронной почты"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                      startIcon={<EmailIcon sx={{ color: GLASS_COLORS.textSecondary }} />}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <GlassInputField
                      label="Пароль"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
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
                    
                    {/* Password Strength Indicator в стеклянном стиле */}
                    {formData.password && (
                      <Paper 
                        elevation={0}
                        sx={{ 
                          mt: 2, 
                          p: 2.5,
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: GLASS_COLORS.border,
                          background: GLASS_COLORS.surface,
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <Stack spacing={2}>
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: GLASS_COLORS.textPrimary,
                                  letterSpacing: '-0.01em',
                                }}
                              >
                                Надежность пароля
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: getPasswordStrengthColor(passwordStrength)
                                }}
                              >
                                {getPasswordStrengthLabel(passwordStrength)}
                              </Typography>
                            </Stack>
                            <LinearProgress 
                              variant="determinate" 
                              value={passwordStrength}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: alpha(GLASS_COLORS.border, 0.5),
                                '& .MuiLinearProgress-bar': {
                                  background: `linear-gradient(90deg, ${getPasswordStrengthColor(passwordStrength)} 0%, ${alpha(getPasswordStrengthColor(passwordStrength), 0.6)} 100%)`,
                                  borderRadius: 3,
                                  boxShadow: `0 2px 8px ${alpha(getPasswordStrengthColor(passwordStrength), 0.3)}`,
                                }
                              }}
                            />
                          </Box>
                          
                          <Grid container spacing={1}>
                            {PASSWORD_REQUIREMENTS.map((req, index) => {
                              const met = req.validator(formData.password);
                              return (
                                <Grid item xs={12} sm={6} key={index}>
                                  <Stack 
                                    direction="row" 
                                    spacing={1} 
                                    alignItems="center"
                                    sx={{
                                      p: 1,
                                      borderRadius: 2,
                                      background: met ? alpha(GLASS_COLORS.success, 0.1) : 'transparent',
                                      backdropFilter: met ? 'blur(5px)' : 'none',
                                    }}
                                  >
                                    {met ? (
                                      <CheckIcon sx={{ fontSize: 16, color: GLASS_COLORS.success }} />
                                    ) : (
                                      <CancelIcon sx={{ fontSize: 16, color: GLASS_COLORS.error }} />
                                    )}
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        color: met ? GLASS_COLORS.success : GLASS_COLORS.textSecondary,
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                      }}
                                    >
                                      {req.text}
                                    </Typography>
                                  </Stack>
                                </Grid>
                              );
                            })}
                          </Grid>
                        </Stack>
                      </Paper>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <GlassInputField
                      label="Подтвердите пароль"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                      startIcon={<LockIcon sx={{ color: GLASS_COLORS.textSecondary }} />}
                      endIcon={
                        <IconButton
                          onClick={handleShowConfirmPassword}
                          edge="end"
                          sx={{ color: GLASS_COLORS.textSecondary }}
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      }
                      error={passwordError}
                      helperText={passwordError ? "Пароли не совпадают" : undefined}
                    />
                    
                    {/* Password Match Indicator в стеклянном стиле */}
                    {formData.confirmPassword && (
                      <Paper 
                        elevation={0}
                        sx={{ 
                          mt: 2, 
                          p: 2,
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: passwordMatch ? GLASS_COLORS.success : GLASS_COLORS.error,
                          background: passwordMatch ? alpha(GLASS_COLORS.success, 0.1) : alpha(GLASS_COLORS.error, 0.1),
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <Stack 
                          direction="row" 
                          spacing={1} 
                          alignItems="center" 
                          justifyContent="center"
                        >
                          {passwordMatch ? (
                            <>
                              <CheckIcon sx={{ fontSize: 20, color: GLASS_COLORS.success }} />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: GLASS_COLORS.success,
                                  fontWeight: 600,
                                  letterSpacing: '-0.01em',
                                }}
                              >
                                Пароли совпадают
                              </Typography>
                            </>
                          ) : (
                            <>
                              <CancelIcon sx={{ fontSize: 20, color: GLASS_COLORS.error }} />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: GLASS_COLORS.error,
                                  fontWeight: 600,
                                  letterSpacing: '-0.01em',
                                }}
                              >
                                Пароли не совпадают
                              </Typography>
                            </>
                          )}
                        </Stack>
                      </Paper>
                    )}
                  </Grid>
                </Grid>

                <Box sx={{ mt: 4 }}>
                  <GlassButton
                    variant="contained"
                    startIcon={isLoading ? null : <RegisterIcon />}
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <CircularProgress 
                        size={24} 
                        sx={{ color: 'white' }} 
                      />
                    ) : (
                      'Зарегистрироваться'
                    )}
                  </GlassButton>
                </Box>
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
                  У вас уже есть аккаунт?
                </Typography>
              </Box>

              {/* Login Link */}
              <Box sx={{ textAlign: 'center' }}>
                <GlassButton
                  variant="outlined"
                  onClick={() => navigate('/login')}
                >
                  Войти в существующий аккаунт
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
              © {new Date().getFullYear()} InterviewBox. Все права защищены.
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};