import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  Fade,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Info as InfoIcon,
  Shield as ShieldIcon,
  CheckCircle as VerifiedIcon,
  AccessTime as ClockIcon,
  Image as ImageIcon,
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
  warning: '#DD6B20',
  error: '#E53E3E',
  info: '#3182CE',
};

// Компонент текстового поля со стилями
const StyledInputField = ({
  label,
  type = 'text',
  value,
  onChange,
  disabled = false,
  startIcon,
  error = false,
  helperText,
  readOnly = false,
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
      disabled={disabled || readOnly}
      error={error}
      label={label}
      readOnly={readOnly}
      startAdornment={startIcon ? (
        <InputAdornment position="start">
          {startIcon}
        </InputAdornment>
      ) : undefined}
      sx={{
        borderRadius: 2,
        backgroundColor: readOnly ? alpha(NEUTRAL_COLORS.background, 0.5) : NEUTRAL_COLORS.surface,
        '& .MuiOutlinedInput-input': {
          color: NEUTRAL_COLORS.textPrimary,
          '&:read-only': {
            color: NEUTRAL_COLORS.textSecondary,
          },
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: NEUTRAL_COLORS.border,
          borderWidth: 1.5,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: readOnly ? NEUTRAL_COLORS.border : NEUTRAL_COLORS.accent,
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
          fontSize: '0.75rem',
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
        },
      }),
      ...(variant === 'outlined' && {
        borderWidth: 1.5,
        borderColor: NEUTRAL_COLORS.border,
        color: NEUTRAL_COLORS.textPrimary,
        '&:hover': {
          borderColor: NEUTRAL_COLORS.accent,
          backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
        },
      }),
      ...(variant === 'text' && {
        color: NEUTRAL_COLORS.accent,
        '&:hover': {
          backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
        },
      }),
    }}
  >
    {children}
  </Button>
);

// Компонент для отображения информационного поля (только для чтения)
const InfoField = ({
  label,
  value,
  icon,
  verified = false,
}: {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
  verified?: boolean;
}) => (
  <Box
    sx={{
      p: 2.5,
      borderRadius: 2,
      backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
      border: `1px solid ${NEUTRAL_COLORS.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: alpha(NEUTRAL_COLORS.background, 0.8),
        borderColor: alpha(NEUTRAL_COLORS.accent, 0.3),
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
      {icon && (
        <Box
          sx={{
            p: 1,
            borderRadius: '50%',
            backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
            color: NEUTRAL_COLORS.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: NEUTRAL_COLORS.textSecondary,
            display: 'block',
            mb: 0.5,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.75rem',
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: NEUTRAL_COLORS.textPrimary,
            fontWeight: 500,
            fontSize: '1rem',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
    {verified && (
      <Tooltip title="Подтверждено">
        <VerifiedIcon
          sx={{
            color: NEUTRAL_COLORS.success,
            fontSize: 20,
            flexShrink: 0,
            ml: 1,
          }}
        />
      </Tooltip>
    )}
  </Box>
);

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, updateProfile, error: authError, clearError } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Редактируемые поля
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  // Обновляем локальное состояние при изменении пользователя
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleSaveChanges = useCallback(async () => {
    setLocalError('');
    setSuccessMessage('');
    clearError();

    // Валидация
    if (!firstName.trim() || !lastName.trim()) {
      setLocalError('Имя и фамилия не могут быть пустыми');
      return;
    }

    if (firstName.trim().length < 2) {
      setLocalError('Имя должно содержать минимум 2 символа');
      return;
    }

    if (lastName.trim().length < 2) {
      setLocalError('Фамилия должна содержать минимум 2 символа');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile(firstName.trim(), lastName.trim(), avatarUrl.trim() || undefined);
      setSuccessMessage('Профиль успешно обновлен');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Ошибка при обновлении профиля';
      setLocalError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  }, [firstName, lastName, avatarUrl, updateProfile, clearError]);

  const handleCancel = useCallback(() => {
    setFirstName(user?.first_name || '');
    setLastName(user?.last_name || '');
    setAvatarUrl(user?.avatar_url || '');
    setIsEditing(false);
    setLocalError('');
  }, [user]);

  if (authLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${NEUTRAL_COLORS.background} 0%, ${alpha(NEUTRAL_COLORS.background, 0.8)} 100%)`,
        }}
      >
        <CircularProgress size={48} sx={{ color: NEUTRAL_COLORS.accent }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2, color: NEUTRAL_COLORS.accent }}
        >
          Вернуться на главную
        </Button>
        
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Пользователь не найден. Пожалуйста, авторизуйтесь.
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${NEUTRAL_COLORS.background} 0%, ${alpha(NEUTRAL_COLORS.background, 0.8)} 100%)`,
        py: 4,
        position: 'relative',
      }}
    >
      <Container maxWidth="md">
        {/* Кнопка назад */}
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center'
        }}
      >        
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/questions')}
          sx={{
            borderRadius: 2,
            backgroundColor: NEUTRAL_COLORS.accent,
            color: NEUTRAL_COLORS.surface,
            px: 3,
            py: 1,
            fontWeight: 600,
            '&:hover': {
              backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.9),
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${alpha(NEUTRAL_COLORS.accent, 0.3)}`,
            },
            transition: 'all 0.2s',
          }}
          variant="contained"
        >
          К вопросам
        </Button>
      </Stack>

        {/* Уведомления */}
        {(authError || localError) && (
          <Fade in>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                border: `1px solid ${alpha(NEUTRAL_COLORS.error, 0.2)}`,
              }}
              onClose={() => {
                clearError();
                setLocalError('');
              }}
            >
              {authError || localError}
            </Alert>
          </Fade>
        )}

        {successMessage && (
          <Fade in>
            <Alert
              severity="success"
              sx={{
                mb: 3,
                borderRadius: 2,
                border: `1px solid ${alpha(NEUTRAL_COLORS.success, 0.2)}`,
              }}
              onClose={() => setSuccessMessage('')}
            >
              {successMessage}
            </Alert>
          </Fade>
        )}

        {/* Основная карточка профиля */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
            backgroundColor: NEUTRAL_COLORS.surface,
            mb: 4,
          }}
        >
          {/* Заголовок с кнопкой редактирования */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 4,
              pb: 3,
              borderBottom: `1px solid ${alpha(NEUTRAL_COLORS.border, 0.5)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '50%',
                  backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                  color: NEUTRAL_COLORS.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: NEUTRAL_COLORS.textPrimary,
                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                  }}
                >
                  Мой профиль
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: NEUTRAL_COLORS.textSecondary,
                    mt: 0.5,
                  }}
                >
                  Управляйте информацией вашего аккаунта
                </Typography>
              </Box>
            </Box>

            {!isEditing && (
              <Tooltip title="Редактировать профиль">
                <IconButton
                  onClick={() => setIsEditing(true)}
                  sx={{
                    backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                    color: NEUTRAL_COLORS.accent,
                    '&:hover': {
                      backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.2),
                    },
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Содержимое профиля */}
          {!isEditing ? (
            // Режим просмотра
            <Stack spacing={3}>
              {/* Аватар */}
              {user.avatar_url && (
                <InfoField
                  label="Аватар"
                  value={
                    <Box
                      component="img"
                      src={user.avatar_url}
                      alt="Avatar"
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 2,
                        objectFit: 'cover',
                        border: `2px solid ${NEUTRAL_COLORS.border}`,
                      }}
                    />
                  }
                  icon={<ImageIcon />}
                />
              )}

              {/* Имя */}
              <InfoField
                label="Имя"
                value={user.first_name}
                icon={<PersonIcon />}
              />

              {/* Фамилия */}
              <InfoField
                label="Фамилия"
                value={user.last_name}
                icon={<PersonIcon />}
              />

              {/* Email */}
              <InfoField
                label="Email"
                value={user.email}
                icon={<EmailIcon />}
                verified={user.email_verified}
              />

              {/* Роль */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
                  border: `1px solid ${NEUTRAL_COLORS.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: '50%',
                      backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                      color: NEUTRAL_COLORS.success,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShieldIcon />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: NEUTRAL_COLORS.textSecondary,
                        display: 'block',
                        mb: 0.5,
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.75rem',
                      }}
                    >
                      Роль
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: NEUTRAL_COLORS.textPrimary,
                        fontWeight: 500,
                        fontSize: '1rem',
                      }}
                    >
                      {user.is_admin ? 'Администратор' : 'Пользователь'}
                    </Typography>
                  </Box>
                </Box>
                {user.is_admin && (
                  <Chip
                    label="Admin"
                    size="small"
                    sx={{
                      backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                      color: NEUTRAL_COLORS.success,
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>

              {/* Статус активности */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
                  border: `1px solid ${NEUTRAL_COLORS.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: '50%',
                      backgroundColor: alpha(
                        user.is_active ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.error,
                        0.1
                      ),
                      color: user.is_active ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.error,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <VerifiedIcon />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: NEUTRAL_COLORS.textSecondary,
                        display: 'block',
                        mb: 0.5,
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.75rem',
                      }}
                    >
                      Статус аккаунта
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: NEUTRAL_COLORS.textPrimary,
                        fontWeight: 500,
                        fontSize: '1rem',
                      }}
                    >
                      {user.is_active ? 'Активен' : 'Неактивен'}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={user.is_active ? 'Активен' : 'Неактивен'}
                  size="small"
                  sx={{
                    backgroundColor: alpha(
                      user.is_active ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.error,
                      0.1
                    ),
                    color: user.is_active ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.error,
                    fontWeight: 600,
                  }}
                />
              </Box>

              {/* Последний вход */}
              {user.last_login && (
                <InfoField
                  label="Последний вход"
                  value={new Date(user.last_login).toLocaleString('ru-RU')}
                  icon={<ClockIcon />}
                />
              )}
            </Stack>
          ) : (
            // Режим редактирования
            <Stack spacing={3}>
              <StyledInputField
                label="Имя"
                type="text"
                value={firstName}
                onChange={(e: any) => setFirstName(e.target.value)}
                disabled={isSaving}
                startIcon={<PersonIcon sx={{ color: NEUTRAL_COLORS.textSecondary }} />}
              />

              <StyledInputField
                label="Фамилия"
                type="text"
                value={lastName}
                onChange={(e: any) => setLastName(e.target.value)}
                disabled={isSaving}
                startIcon={<PersonIcon sx={{ color: NEUTRAL_COLORS.textSecondary }} />}
              />

              <StyledInputField
                label="URL аватара (опционально)"
                type="url"
                value={avatarUrl}
                onChange={(e: any) => setAvatarUrl(e.target.value)}
                disabled={isSaving}
                startIcon={<ImageIcon sx={{ color: NEUTRAL_COLORS.textSecondary }} />}
                helperText="Введите полный URL изображения (например, https://example.com/avatar.jpg)"
              />

              {/* Кнопки действий */}
              <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                <StyledButton
                  variant="contained"
                  startIcon={isSaving ? null : <SaveIcon />}
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  fullWidth
                >
                  {isSaving ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Сохранить изменения'
                  )}
                </StyledButton>

                <StyledButton
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={isSaving}
                  fullWidth
                >
                  Отмена
                </StyledButton>
              </Box>
            </Stack>
          )}
        </Paper>

        {/* Дополнительная информация */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px dashed ${NEUTRAL_COLORS.border}`,
            backgroundColor: alpha(NEUTRAL_COLORS.info, 0.05),
          }}
        >
          <Stack spacing={2}>
            <Typography
              variant="h6"
              sx={{
                color: NEUTRAL_COLORS.info,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <InfoIcon />
              Информация об аккаунте
            </Typography>
            <Stack spacing={1}>
              <Typography
                variant="body2"
                sx={{ color: NEUTRAL_COLORS.textSecondary }}
              >
                • Вы можете редактировать только имя, фамилию и аватар
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: NEUTRAL_COLORS.textSecondary }}
              >
                • Email и роль не могут быть изменены в этом интерфейсе
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: NEUTRAL_COLORS.textSecondary }}
              >
                • Для изменения пароля обратитесь в службу поддержки
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
