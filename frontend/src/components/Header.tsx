import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  Chip,
  Container,
  alpha,
  useMediaQuery,
  useTheme as useMuiTheme,
  Fade,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  Map as MapIcon,
  Business as CompanyIcon,
  AccountBox as AccountBoxIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useThemeContext } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

const getGlassColors = (mode: 'light' | 'dark') => {
  if (mode === 'dark') {
    return {
      primary: 'rgba(0, 212, 255, 0.9)',
      secondary: 'rgba(138, 43, 226, 0.8)',
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
      glassHighlight: 'rgba(255, 255, 255, 0.1)',
    };
  }

  return {
    primary: 'rgba(10, 132, 255, 0.8)',
    secondary: 'rgba(94, 92, 230, 0.75)',
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
    glassHighlight: 'rgba(255, 255, 255, 0.5)',
  };
};

interface HeaderProps {
  onAddQuestion?: () => void;
  showAddButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onAddQuestion, showAddButton = false }) => {
  const navigate = useNavigate();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, isAuthenticated, logout } = useAuth();
  const { mode: themeMode } = useThemeContext();
  const GLASS_COLORS = getGlassColors(themeMode);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <Box sx={{ 
      position: 'sticky', 
      zIndex: 1200, 
      mb: 2, 
    }}>
      <Fade in timeout={400}>
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            top: 0,
            background: GLASS_COLORS.surface,
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderBottom: '1px solid',
            borderColor: GLASS_COLORS.border,
            transition: 'all 0.3s ease',
          }}
        >
          <Container maxWidth="xl">
            <Toolbar sx={{ 
              px: { xs: 1, sm: 2 },
              py: 1.5,
              minHeight: '64px !important',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              {/* Логотип */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: GLASS_COLORS.textPrimary,
                  fontSize: { xs: '1.25rem', sm: '1.45rem' },
                  cursor: 'pointer',
                  letterSpacing: '-0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': {
                    color: GLASS_COLORS.primary,
                    opacity: 0.9,
                  },
                }}
                onClick={() => handleNavigation('/')}
              >
                Interview<span style={{ color: GLASS_COLORS.primary }}>Box</span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: GLASS_COLORS.primary,
                  marginLeft: '6px',
                  backgroundColor: alpha('#FFFFFF', 0.3),
                  padding: '2px 6px',
                  borderRadius: '6px',
                  alignSelf: 'flex-start',
                  marginTop: '2px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: alpha(GLASS_COLORS.primary, 0.3),
                }}>
                  beta
                </span>
              </Typography>

              {/* Desktop меню */}
              {!isMobile && (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {isAuthenticated && (
                    <>
                      <Chip 
                        label={`${user?.first_name} ${user?.last_name}`}
                        size="medium"
                        onClick={() => handleNavigation('/profile')}
                        sx={{ 
                          fontWeight: 500,
                          backgroundColor: alpha(GLASS_COLORS.primary, 0.1),
                          color: GLASS_COLORS.textPrimary,
                          cursor: 'pointer',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid',
                          borderColor: alpha(GLASS_COLORS.primary, 0.2),
                            '& .MuiChip-label': {
                              px: 1.5,
                            },
                            '&:hover': {
                              backgroundColor: alpha(GLASS_COLORS.primary, 0.2),
                            }
                        }}
                      />
                      {user?.is_admin && (
                        <Chip 
                          label="Admin"
                          onClick={() => navigate('/admin')}
                          size="medium"
                          sx={{ 
                            fontWeight: 600,
                            backgroundColor: alpha(GLASS_COLORS.success, 0.15),
                            backdropFilter: 'blur(10px)',
                            color: GLASS_COLORS.success,
                            border: '1px solid',
                            borderColor: alpha(GLASS_COLORS.success, 0.3),
                          }}
                        />
                      )}
                    </>
                  )}

                  {showAddButton && isAuthenticated && user?.is_admin && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={onAddQuestion}
                      sx={{
                        background: `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${alpha(GLASS_COLORS.primary, 0.7)})`,
                        borderRadius: 3,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        px: 2,
                        py: 1,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: alpha('#FFFFFF', 0.3),
                        boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.primary, 0.2)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.primary, 0.6)})`,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 20px ${alpha(GLASS_COLORS.primary, 0.3)}`,
                        },
                      }}
                    >
                      Добавить
                    </Button>
                  )}

                  <ThemeToggle />

                  {isAuthenticated ? (
                    <IconButton
                      onClick={handleLogout}
                      size="medium"
                      sx={{
                        backgroundColor: alpha(GLASS_COLORS.error, 0.15),
                        backdropFilter: 'blur(10px)',
                        color: GLASS_COLORS.error,
                        border: '1px solid',
                        borderColor: alpha(GLASS_COLORS.error, 0.3),
                        '&:hover': {
                          backgroundColor: alpha(GLASS_COLORS.error, 0.25),
                        },
                        width: 40,
                        height: 40
                      }}
                      title="Выход"
                    >
                      <LogoutIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleNavigation('/login')}
                      sx={{
                        background: `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${alpha(GLASS_COLORS.primary, 0.7)})`,
                        borderRadius: 3,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        px: 3,
                        py: 1,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: alpha('#FFFFFF', 0.3),
                        boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.primary, 0.2)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.primary, 0.6)})`,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 20px ${alpha(GLASS_COLORS.primary, 0.3)}`,
                        },
                      }}
                    >
                      Вход
                    </Button>
                  )}
                </Stack>
              )}

              {/* Mobile меню */}
              {isMobile && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <ThemeToggle />
                  <IconButton
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    sx={{
                      backgroundColor: alpha(GLASS_COLORS.background, 0.8),
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: GLASS_COLORS.border,
                      color: GLASS_COLORS.textPrimary,
                      '&:hover': {
                        backgroundColor: alpha(GLASS_COLORS.primary, 0.1),
                        borderColor: GLASS_COLORS.primary,
                      },
                    }}
                  >
                    {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                  </IconButton>
                </Stack>
              )}
            </Toolbar>
          </Container>
        </AppBar>
      </Fade>

      {/* Mobile меню */}
      {isMobile && mobileMenuOpen && (
        <Fade in timeout={300}>
          <Box
            sx={{
              position: 'absolute',
              top: '64px',
              left: 0,
              right: 0,
              background: GLASS_COLORS.surfaceDark,
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderBottom: '1px solid',
              borderColor: GLASS_COLORS.border,
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
              zIndex: 1199,
            }}
          >
            <Container maxWidth="xl">
              <Stack
                spacing={1}
                sx={{
                  py: 2,
                }}
              >
                {isAuthenticated && (
                  <>
                    <Button
                        fullWidth
                        startIcon={<AccountBoxIcon />}
                        sx={{
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          color: GLASS_COLORS.warning,
                          fontWeight: 500,
                          fontSize: '0.95rem',
                          px: 2,
                          py: 1.5,
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          backgroundColor: alpha(GLASS_COLORS.warning, 0.05),
                          '&:hover': {
                            backgroundColor: alpha(GLASS_COLORS.warning, 0.15),
                          },
                        }}
                        onClick={() => handleNavigation('/companies')}
                      >
                        {user?.first_name} {user?.last_name}
                      </Button>
                    {user?.is_admin && (
                      <Button
                        fullWidth
                        startIcon={<CompanyIcon />}
                        sx={{
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          color: GLASS_COLORS.purple,
                          fontWeight: 500,
                          fontSize: '0.95rem',
                          px: 2,
                          py: 1.5,
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          backgroundColor: alpha(GLASS_COLORS.purple, 0.05),
                          '&:hover': {
                            backgroundColor: alpha(GLASS_COLORS.purple, 0.15),
                          },
                        }}
                        onClick={() => handleNavigation('/companies')}
                      >
                        Пройти собеседование
                      </Button>
                    )}
                    {user?.is_admin && (
                      <Button
                        fullWidth
                        startIcon={<MapIcon />}
                        sx={{
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          color: GLASS_COLORS.primary,
                          fontWeight: 500,
                          fontSize: '0.95rem',
                          px: 2,
                          py: 1.5,
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          backgroundColor: alpha(GLASS_COLORS.primary, 0.05),
                          '&:hover': {
                            backgroundColor: alpha(GLASS_COLORS.primary, 0.15),
                          },
                        }}
                        onClick={() => handleNavigation('/roadmap')}
                      >
                        Дорожные карты
                      </Button>
                    )}
                    
                    {user?.is_admin && (
                      <Button
                        fullWidth
                        sx={{
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          color: GLASS_COLORS.success,
                          fontWeight: 500,
                          fontSize: '0.95rem',
                          px: 2,
                          py: 1.5,
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          backgroundColor: alpha(GLASS_COLORS.success, 0.05),
                          '&:hover': {
                            backgroundColor: alpha(GLASS_COLORS.success, 0.15),
                          },
                        }}
                        onClick={() => handleNavigation('/admin')}
                      >
                        Админ-панель
                      </Button>
                    )}
                  </>
                )}

                {showAddButton && isAuthenticated && user?.is_admin && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      onAddQuestion?.();
                      setMobileMenuOpen(false);
                    }}
                    sx={{
                      background: `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${alpha(GLASS_COLORS.primary, 0.7)})`,
                      borderRadius: 3,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      py: 1.5,
                      mt: 1,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: alpha('#FFFFFF', 0.3),
                      boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.primary, 0.2)}`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.primary, 0.6)})`,
                      },
                    }}
                  >
                    Добавить вопрос
                  </Button>
                )}

                <Button
                  fullWidth
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    color: GLASS_COLORS.error,
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    backgroundColor: alpha(GLASS_COLORS.error, 0.05),
                    '&:hover': {
                      backgroundColor: alpha(GLASS_COLORS.error, 0.15),
                    },
                  }}
                >
                  Выход
                </Button>

                {!isAuthenticated && (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleNavigation('/login')}
                    sx={{
                      background: `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${alpha(GLASS_COLORS.primary, 0.7)})`,
                      borderRadius: 3,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      py: 1.5,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: alpha('#FFFFFF', 0.3),
                      boxShadow: `0 4px 12px ${alpha(GLASS_COLORS.primary, 0.2)}`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.primary, 0.6)})`,
                      },
                    }}
                  >
                    Вход
                  </Button>
                )}
              </Stack>
            </Container>
          </Box>
        </Fade>
      )}
    </Box>
  );
};