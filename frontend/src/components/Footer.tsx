import React from 'react';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Button,
  Chip,
  Stack,
  alpha,
  Fade,
  Divider,
} from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  GitHub as GitHubIcon,
  Telegram as TelegramIcon,
  Email as EmailIcon,
  QuestionAnswer as QuestionIcon,
  Category as CategoryIcon,
  School as SchoolIcon,
  Favorite as FavoriteIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useThemeContext } from '../context/ThemeContext';

const getGlassColors = (mode: 'light' | 'dark') => {
  if (mode === 'dark') {
    return {
      primary: 'rgba(0, 212, 255, 0.9)',
      secondary: 'rgba(138, 43, 226, 0.8)',
      accent: 'rgba(90, 200, 250, 0.9)',
      background: 'rgba(20, 20, 40, 0.6)',
      surface: 'rgba(30, 30, 60, 0.7)',
      surfaceDark: 'rgba(40, 40, 70, 0.8)',
      textPrimary: 'rgba(255, 255, 255, 0.95)',
      textSecondary: 'rgba(180, 180, 200, 0.7)',
      border: 'rgba(0, 212, 255, 0.3)',
      borderGlow: 'rgba(0, 212, 255, 0.6)',
      success: 'rgba(0, 200, 100, 0.8)',
      error: 'rgba(255, 50, 100, 0.9)',
      warning: 'rgba(255, 170, 0, 0.8)',
      purple: 'rgba(180, 100, 255, 0.8)',
      info: 'rgba(90, 200, 250, 0.8)',
      glassHighlight: 'rgba(255, 255, 255, 0.1)',
      gradientStart: 'rgba(255, 255, 255, 0.1)',
      gradientEnd: 'rgba(255, 255, 255, 0.05)',
      mainColor: 'linear-gradient(135deg, #464646ff 0%, #292929ff 50%, #000000ff 100%)',
    };
  }

  return {
    primary: 'rgba(10, 132, 255, 0.8)',
    secondary: 'rgba(94, 92, 230, 0.75)',
    accent: 'rgba(90, 200, 250, 0.9)',
    background: 'rgba(240, 244, 250, 0.4)',
    surface: 'rgba(255, 255, 255, 0.6)',
    surfaceDark: 'rgba(255, 255, 255, 0.8)',
    textPrimary: 'rgba(0, 0, 0, 0.8)',
    textSecondary: 'rgba(60, 60, 67, 0.6)',
    border: 'rgba(255, 255, 255, 0.5)',
    borderGlow: 'rgba(255, 255, 255, 0.8)',
    success: 'rgba(52, 199, 89, 0.8)',
    error: 'rgba(255, 59, 48, 0.8)',
    warning: 'rgba(255, 149, 0, 0.8)',
    purple: 'rgba(175, 82, 222, 0.8)',
    info: 'rgba(90, 200, 250, 0.8)',
    glassHighlight: 'rgba(255, 255, 255, 0.5)',
    gradientStart: 'rgba(255, 255, 255, 0.3)',
    gradientEnd: 'rgba(255, 255, 255, 0.1)',
    mainColor: 'linear-gradient(135deg, #E0F0FF 0%, #D0E4FF 50%, #B8D8FF 100%)',
  };
};

interface FooterProps {
  showBackground?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ showBackground = true }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { mode: themeMode } = useThemeContext();
  const GLASS_COLORS = getGlassColors(themeMode);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Fade in timeout={800}>
      <Box
        component="footer"
        sx={{
          background: showBackground ? GLASS_COLORS.surface : 'transparent',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
          mt: 4,
          py: 6,
          borderTop: '1px solid',
          borderColor: GLASS_COLORS.border,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: `linear-gradient(135deg, ${GLASS_COLORS.glassHighlight} 0%, transparent 100%)`,
            opacity: 0.3,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -50,
            left: -50,
            right: -50,
            bottom: -50,
            background: `
              radial-gradient(circle at 20% 30%, ${alpha(GLASS_COLORS.primary, 0.1)} 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, ${alpha(GLASS_COLORS.secondary, 0.08)} 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, ${alpha(GLASS_COLORS.info, 0.1)} 0%, transparent 60%)
            `,
            opacity: showBackground ? 0.5 : 0,
            zIndex: -1,
            filter: 'blur(40px)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Основной контент футера */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 4,
              mb: 4,
            }}
          >
            {/* Левая часть - логотип и описание */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: GLASS_COLORS.textPrimary,
                  fontSize: '1.6rem',
                  cursor: 'pointer',
                  letterSpacing: '-0.02em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  mb: 1.5,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: GLASS_COLORS.primary,
                    transform: 'translateX(4px)',
                  },
                }}
                onClick={() => handleNavigation('/')}
              >
                Interview<span style={{ color: GLASS_COLORS.primary }}>Box</span>
                <Chip
                  label="beta"
                  size="small"
                  sx={{
                    ml: 1.5,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    height: 20,
                    backgroundColor: alpha(GLASS_COLORS.primary, 0.15),
                    backdropFilter: 'blur(10px)',
                    color: GLASS_COLORS.primary,
                    border: '1px solid',
                    borderColor: alpha(GLASS_COLORS.primary, 0.3),
                  }}
                />
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: GLASS_COLORS.textSecondary,
                  maxWidth: '320px',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                }}
              >
                Платформа для подготовки к техническим собеседованиям.
                Большая база вопросов с подробными ответами.
              </Typography>
            </Box>

            {/* Правая часть - навигация, соцсети и кнопка */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 4,
              }}
            >
              {/* Быстрая навигация */}
              <Stack direction="row" spacing={2}>
                <IconButton
                  onClick={() => handleNavigation('/questions')}
                  size="small"
                  sx={{
                    color: GLASS_COLORS.textSecondary,
                    backgroundColor: alpha(GLASS_COLORS.background, 0.8),
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: GLASS_COLORS.border,
                    '&:hover': {
                      backgroundColor: alpha(GLASS_COLORS.primary, 0.1),
                      color: GLASS_COLORS.primary,
                      borderColor: GLASS_COLORS.primary,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  title="Вопросы"
                >
                  <QuestionIcon fontSize="small" />
                </IconButton>
                
                {isAuthenticated && (
                  <>
                    <IconButton
                      onClick={() => handleNavigation('/favorites')}
                      size="small"
                      sx={{
                        color: GLASS_COLORS.textSecondary,
                        backgroundColor: alpha(GLASS_COLORS.background, 0.8),
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: GLASS_COLORS.border,
                        '&:hover': {
                          backgroundColor: alpha(GLASS_COLORS.warning, 0.1),
                          color: GLASS_COLORS.warning,
                          borderColor: GLASS_COLORS.warning,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                      title="Избранное"
                    >
                      <FavoriteIcon fontSize="small" />
                    </IconButton>
                    
                    <IconButton
                      onClick={() => handleNavigation('/profile')}
                      size="small"
                      sx={{
                        color: GLASS_COLORS.textSecondary,
                        backgroundColor: alpha(GLASS_COLORS.background, 0.8),
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: GLASS_COLORS.border,
                        '&:hover': {
                          backgroundColor: alpha(GLASS_COLORS.purple, 0.1),
                          color: GLASS_COLORS.purple,
                          borderColor: GLASS_COLORS.purple,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                      title="Профиль"
                    >
                      <PersonIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
                
                {user?.is_admin && (
                  <IconButton
                    onClick={() => handleNavigation('/admin')}
                    size="small"
                    sx={{
                      color: GLASS_COLORS.textSecondary,
                      backgroundColor: alpha(GLASS_COLORS.background, 0.8),
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: GLASS_COLORS.border,
                      '&:hover': {
                        backgroundColor: alpha(GLASS_COLORS.success, 0.1),
                        color: GLASS_COLORS.success,
                        borderColor: GLASS_COLORS.success,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                    title="Админ-панель"
                  >
                    <AdminIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>

              {/* Социальные сети */}
              <Stack direction="row" spacing={1}>
                <IconButton
                  component="a"
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    color: GLASS_COLORS.textPrimary,
                    backgroundColor: alpha(GLASS_COLORS.background, 0.8),
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: GLASS_COLORS.border,
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: GLASS_COLORS.primary,
                      color: '#FFFFFF',
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.primary, 0.3)}`,
                      borderColor: GLASS_COLORS.primary,
                    },
                  }}
                >
                  <GitHubIcon fontSize="small" />
                </IconButton>

                <IconButton
                  component="a"
                  href="https://t.me/sandbox_devv"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    color: GLASS_COLORS.textPrimary,
                    backgroundColor: alpha(GLASS_COLORS.background, 0.8),
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: GLASS_COLORS.border,
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: GLASS_COLORS.info,
                      color: '#FFFFFF',
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.info, 0.3)}`,
                      borderColor: GLASS_COLORS.info,
                    },
                  }}
                >
                  <TelegramIcon fontSize="small" />
                </IconButton>

                {/* <IconButton
                  component="a"
                  href="mailto:support@interviewbox.com"
                  size="small"
                  sx={{
                    color: GLASS_COLORS.textPrimary,
                    backgroundColor: alpha(GLASS_COLORS.background, 0.8),
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: GLASS_COLORS.border,
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: GLASS_COLORS.secondary,
                      color: '#FFFFFF',
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.secondary, 0.3)}`,
                      borderColor: GLASS_COLORS.secondary,
                    },
                  }}
                >
                  <EmailIcon fontSize="small" />
                </IconButton> */}
              </Stack>

              {/* Кнопка действия */}
              <Button
                variant="contained"
                size="small"
                endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
                onClick={() => handleNavigation('/questions')}
                sx={{
                  background: `linear-gradient(135deg, ${GLASS_COLORS.primary} 0%, ${GLASS_COLORS.secondary} 100%)`,
                  borderRadius: '30px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  px: 3,
                  py: 1,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha('#FFFFFF', 0.3),
                  boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.primary, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateX(4px)',
                    boxShadow: `0 8px 20px ${alpha(GLASS_COLORS.primary, 0.3)}`,
                    background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)} 0%, ${alpha(GLASS_COLORS.secondary, 0.9)} 100%)`,
                  },
                }}
              >
                Практиковаться
              </Button>
            </Box>
          </Box>

          {/* Разделитель */}
          <Divider sx={{ 
            borderColor: GLASS_COLORS.border,
            my: 3,
          }} />

          {/* Нижняя часть с копирайтом и версией */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: alpha(GLASS_COLORS.textSecondary, 0.7),
                fontSize: '0.85rem',
              }}
            >
              © 2026 InterviewBox. Все права защищены.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  color: alpha(GLASS_COLORS.textSecondary, 0.5),
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: GLASS_COLORS.primary,
                  },
                }}
                onClick={() => handleNavigation('/terms')}
              >
                Условия использования
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: alpha(GLASS_COLORS.textSecondary, 0.5),
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: GLASS_COLORS.primary,
                  },
                }}
                onClick={() => handleNavigation('/privacy')}
              >
                Политика конфиденциальности
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: alpha(GLASS_COLORS.textSecondary, 0.5),
                  fontSize: '0.75rem',
                }}
              >
                v1.0.0
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Fade>
  );
};