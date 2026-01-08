import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
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

// Компонент текстового поля со стилями
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

const StyledButton = ({ 
  children, 
  variant = 'contained', 
  startIcon, 
  onClick,
  disabled = false,
  fullWidth = true,
  size = 'large',
  type = 'button',   // ← default
  ...props           // ← важно: соберите остаток props
}: any) => (
  <Button
    variant={variant}
    startIcon={startIcon}
    onClick={onClick}
    disabled={disabled}
    fullWidth={fullWidth}
    size={size}
    type={type}        // ← передаём type
    {...props}         // ← и остальные пропсы: form, id, name, data-*, etc.
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
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setLocalError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
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
              Back to Home
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
                  <LoginIcon sx={{ fontSize: 40 }} />
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
                  Welcome Back
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: NEUTRAL_COLORS.textSecondary,
                    fontSize: '1.1rem'
                  }}
                >
                  Sign in to your InterviewPro account
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

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <StyledInputField
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                    disabled={isLoading}
                    startIcon={<EmailIcon sx={{ color: NEUTRAL_COLORS.textSecondary }} />}
                  />

                  <StyledInputField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
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

                  <Box sx={{ textAlign: 'right' }}>
                    <Link
                      to="/forgot-password"
                      style={{
                        color: NEUTRAL_COLORS.accent,
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        '&:hover': {
                          textDecoration: 'underline',
                        }
                      }}
                    >
                      Forgot your password?
                    </Link>
                  </Box>

                  <StyledButton
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
                      'Sign In'
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
                  Don't have an account?
                </Typography>
              </Box>

              {/* Register Link */}
              <Box sx={{ textAlign: 'center' }}>
                <StyledButton
                  variant="outlined"
                  onClick={() => navigate('/register')}
                >
                  Create New Account
                </StyledButton>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 3, 
                    color: NEUTRAL_COLORS.textSecondary,
                    fontSize: '0.875rem'
                  }}
                >
                  By signing in, you agree to our{' '}
                  <Link 
                    to="/terms" 
                    style={{ 
                      color: NEUTRAL_COLORS.accent, 
                      textDecoration: 'none',
                      fontWeight: 500 
                    }}
                  >
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link 
                    to="/privacy" 
                    style={{ 
                      color: NEUTRAL_COLORS.accent, 
                      textDecoration: 'none',
                      fontWeight: 500 
                    }}
                  >
                    Privacy Policy
                  </Link>
                </Typography>
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
              © {new Date().getFullYear()} InterviewPro. Professional interview preparation platform.
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};