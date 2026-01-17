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
  error: '#E53E3E',
  gradientStart: '#EDF2F7',
  gradientEnd: '#CBD5E0',
};

// Компонент текстового поля со стилями (такой же как в LoginPage)
const StyledInputField = ({ 
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
      endAdornment={endIcon ? (
        <InputAdornment position="end">
          {endIcon}
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

// Такая же кнопка как в LoginPage
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
    if (strength < 40) return NEUTRAL_COLORS.error;
    if (strength < 70) return '#DD6B20'; // warning orange
    return NEUTRAL_COLORS.success;
  };

  const passwordStrength = calculatePasswordStrength(formData.password);
  const passwordMatch = formData.password === formData.confirmPassword;
  const passwordError = formData.confirmPassword && !passwordMatch;

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
      <Container maxWidth="md">
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
                  <RegisterIcon sx={{ fontSize: 40 }} />
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
                  Зарегистрироваться
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: NEUTRAL_COLORS.textSecondary,
                    fontSize: '1.1rem'
                  }}
                >
                  Присоединяйтесь к InterviewBox, чтобы отточить свои навыки прохождения собеседований.
                </Typography>
              </Box>

              {/* Error Alert */}
              {(error || localError) && (
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
                <Stack container spacing={3}>
                  <Stack item xs={12} sm={6}>
                    <StyledInputField
                      label="Имя"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={isLoading}
                      startIcon={<PersonIcon sx={{ color: NEUTRAL_COLORS.textSecondary }} />}
                    />
                  </Stack>
                  
                  <Stack item xs={12} sm={6}>
                    <StyledInputField
                      label="Фамилия"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={isLoading}
                      startIcon={<PersonIcon sx={{ color: NEUTRAL_COLORS.textSecondary }} />}
                    />
                  </Stack>

                  <Stack item xs={12}>
                    <StyledInputField
                      label="Адресс электронной почты"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                      startIcon={<EmailIcon sx={{ color: NEUTRAL_COLORS.textSecondary }} />}
                    />
                  </Stack>

                  <Stack item xs={12}>
                    <StyledInputField
                      label="Пароль"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                      startIcon={<LockIcon sx={{ color: NEUTRAL_COLORS.textSecondary }} />}
                      endIcon={
                        <IconButton
                          onClick={handleShowPassword}
                          edge="end"
                          sx={{ color: NEUTRAL_COLORS.textSecondary }}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      }
                    />
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <Paper 
                        elevation={0}
                        sx={{ 
                          mt: 2, 
                          p: 2.5,
                          borderRadius: 2,
                          border: `1px solid ${NEUTRAL_COLORS.border}`,
                          backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
                        }}
                      >
                        <Stack spacing={2}>
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: NEUTRAL_COLORS.textPrimary
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
                                {passwordStrength < 40 ? 'Weak' : passwordStrength < 70 ? 'Medium' : 'Strong'}
                              </Typography>
                            </Stack>
                            <LinearProgress 
                              variant="determinate" 
                              value={passwordStrength}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: alpha(NEUTRAL_COLORS.border, 0.5),
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getPasswordStrengthColor(passwordStrength),
                                  borderRadius: 3,
                                }
                              }}
                            />
                          </Box>
                          
                          <Stack container spacing={1}>
                            {PASSWORD_REQUIREMENTS.map((req, index) => {
                              const met = req.validator(formData.password);
                              return (
                                <Stack item xs={12} sm={6} key={index}>
                                  <Stack 
                                    direction="row" 
                                    spacing={1} 
                                    alignItems="center"
                                    sx={{
                                      p: 1,
                                      borderRadius: 1,
                                      backgroundColor: met ? alpha(NEUTRAL_COLORS.success, 0.1) : 'transparent',
                                    }}
                                  >
                                    {met ? (
                                      <CheckIcon sx={{ fontSize: 16, color: NEUTRAL_COLORS.success }} />
                                    ) : (
                                      <CancelIcon sx={{ fontSize: 16, color: NEUTRAL_COLORS.error }} />
                                    )}
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        color: met ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.textSecondary,
                                        fontSize: '0.75rem'
                                      }}
                                    >
                                      {req.text}
                                    </Typography>
                                  </Stack>
                                </Stack>
                              );
                            })}
                          </Stack>
                        </Stack>
                      </Paper>
                    )}
                  </Stack>

                  <Stack item xs={12}>
                    <StyledInputField
                      label="Подтвердите пароль"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                      startIcon={<LockIcon sx={{ color: NEUTRAL_COLORS.textSecondary }} />}
                      endIcon={
                        <IconButton
                          onClick={handleShowConfirmPassword}
                          edge="end"
                          sx={{ color: NEUTRAL_COLORS.textSecondary }}
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      }
                      error={passwordError}
                      helperText={passwordError ? "Passwords don't match" : undefined}
                    />
                    
                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                      <Paper 
                        elevation={0}
                        sx={{ 
                          mt: 2, 
                          p: 2,
                          borderRadius: 2,
                          border: `1px solid ${passwordMatch ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.error}`,
                          backgroundColor: passwordMatch ? alpha(NEUTRAL_COLORS.success, 0.1) : alpha(NEUTRAL_COLORS.error, 0.1),
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
                              <CheckIcon sx={{ fontSize: 20, color: NEUTRAL_COLORS.success }} />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: NEUTRAL_COLORS.success,
                                  fontWeight: 600
                                }}
                              >
                                Пароли совпадают
                              </Typography>
                            </>
                          ) : (
                            <>
                              <CancelIcon sx={{ fontSize: 20, color: NEUTRAL_COLORS.error }} />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: NEUTRAL_COLORS.error,
                                  fontWeight: 600
                                }}
                              >
                                Пароли не совпадают
                              </Typography>
                            </>
                          )}
                        </Stack>
                      </Paper>
                    )}
                  </Stack>
                </Stack>

                <Box sx={{ mt: 4 }}>
                  <StyledButton
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
                  </StyledButton>
                </Box>
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
                  У вас уже есть аккаунт?
                </Typography>
              </Box>

              {/* Login Link */}
              <Box sx={{ textAlign: 'center' }}>
                <StyledButton
                  variant="outlined"
                  onClick={() => navigate('/login')}
                >
                  Войти в существующий аккаунт
                </StyledButton>
                {/* <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 3, 
                    color: NEUTRAL_COLORS.textSecondary,
                    fontSize: '0.875rem'
                  }}
                >
                  Создавая учетную запись, вы соглашаетесь с нашими условиями{' '}
                  <Link 
                    to="/terms" 
                    style={{ 
                      color: NEUTRAL_COLORS.accent, 
                      textDecoration: 'none',
                      fontWeight: 500 
                    }}
                  >
                    Условиями использования
                  </Link>{' '}
                  и{' '}
                  <Link 
                    to="/privacy" 
                    style={{ 
                      color: NEUTRAL_COLORS.accent, 
                      textDecoration: 'none',
                      fontWeight: 500 
                    }}
                  >
                    Политикой конфиденциальности
                  </Link>
                </Typography> */}
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
              © {new Date().getFullYear()} InterviewBox. Все права защищены.
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};