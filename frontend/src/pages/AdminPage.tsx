import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Stack,
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
  alpha,
} from '@mui/material';
import {
  ExitToApp as LogoutIcon,
  Home as HomeIcon,
  QuestionAnswer as QuestionsIcon,
  Category as CategoriesIcon,
  Chat as AnswersIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { AdminQuestions } from '../components/Admin/AdminQuestions';
import { AdminCategories } from '../components/Admin/AdminCategories';
import { AdminAnswers } from '../components/Admin/AdminAnswers';

// Нейтральная цветовая палитра (такая же как на главной)
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
  warning: '#DD6B20',
  gradientStart: '#EDF2F7',
  gradientEnd: '#CBD5E0',
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Fade in={value === index} timeout={300}>
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`admin-tabpanel-${index}`}
        aria-labelledby={`admin-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ py: { xs: 2, md: 3 } }}>{children}</Box>
        )}
      </div>
    </Fade>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      document.cookie = 'access_token=; path=/; max-age=0;';
      document.cookie = 'refresh_token=; path=/; max-age=0;';
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  }, [logout, navigate]);

  const handleNavigation = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  if (!user?.is_admin) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${NEUTRAL_COLORS.background} 0%, ${NEUTRAL_COLORS.gradientEnd} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}>
        <Container maxWidth="sm">
          <Fade in timeout={600}>
            <Paper 
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: `1px solid ${NEUTRAL_COLORS.border}`,
                backgroundColor: NEUTRAL_COLORS.surface,
                textAlign: 'center'
              }}
            >
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    fontSize: 28
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Access Denied
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  You do not have permission to access this page
                </Typography>
              </Alert>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                <IconButton
                  onClick={() => handleNavigation('/')}
                  sx={{
                    backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                    color: NEUTRAL_COLORS.accent,
                    '&:hover': {
                      backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.2),
                    }
                  }}
                >
                  <HomeIcon />
                </IconButton>
              </Box>
            </Paper>
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
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 10% 20%, ${alpha(NEUTRAL_COLORS.gradientStart, 0.3)} 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, ${alpha(NEUTRAL_COLORS.gradientEnd, 0.2)} 0%, transparent 40%)
        `,
      }
    }}>
      {/* Навигационная панель */}
      <Fade in timeout={500}>
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{ 
            backgroundColor: alpha(NEUTRAL_COLORS.surface, 0.95),
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${NEUTRAL_COLORS.border}`,
          }}
        >
          <Container maxWidth="xl">
            <Toolbar sx={{ 
              px: { xs: 1, sm: 2 },
              py: 1.5,
              minHeight: '64px !important'
            }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
                <IconButton
                  onClick={() => handleNavigation('/')}
                  size="small"
                  sx={{
                    color: NEUTRAL_COLORS.textPrimary,
                    '&:hover': {
                      backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                      color: NEUTRAL_COLORS.accent,
                    }
                  }}
                >
                  <HomeIcon />
                </IconButton>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: NEUTRAL_COLORS.textPrimary,
                    fontSize: '1.25rem',
                    letterSpacing: '-0.025em',
                  }}
                >
                  Admin<span style={{ color: NEUTRAL_COLORS.accent }}>Panel</span>
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={1.5} alignItems="center">
                {!isMobile && (
                  <>
                    <Chip 
                      label={`${user?.first_name} ${user?.last_name}`}
                      size="medium"
                      sx={{ 
                        fontWeight: 500,
                        backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                        color: NEUTRAL_COLORS.textPrimary,
                      }}
                    />
                    <Chip 
                      icon={<AdminIcon fontSize="small" />}
                      label="Administrator" 
                      size="medium"
                      color="primary"
                      sx={{ 
                        fontWeight: 600,
                        backgroundColor: alpha(NEUTRAL_COLORS.success, 0.1),
                        color: NEUTRAL_COLORS.success,
                      }}
                    />
                  </>
                )}
                
                <IconButton
                  onClick={handleLogout}
                  size="medium"
                  sx={{
                    backgroundColor: alpha(NEUTRAL_COLORS.error, 0.1),
                    color: NEUTRAL_COLORS.error,
                    '&:hover': {
                      backgroundColor: alpha(NEUTRAL_COLORS.error, 0.2),
                    },
                    width: 40,
                    height: 40
                  }}
                >
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Toolbar>
          </Container>
        </AppBar>
      </Fade>

      {/* Основной контент */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 2, md: 3 } }}>
        <Fade in timeout={700}>
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1"
              sx={{ 
                fontWeight: 800,
                color: NEUTRAL_COLORS.textPrimary,
                letterSpacing: '-0.025em',
                mb: 1,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              System Administration
            </Typography>
            <Typography 
              variant="h6"
              sx={{ 
                color: NEUTRAL_COLORS.textSecondary,
                fontWeight: 400,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Manage platform content and configurations
            </Typography>
          </Box>
        </Fade>

        {/* Панель табов */}
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: 3,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
            backgroundColor: NEUTRAL_COLORS.surface,
            overflow: 'hidden',
            mb: 3
          }}
        >
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: NEUTRAL_COLORS.border,
            px: { xs: 1, md: 3 }
          }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="administration sections"
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : undefined}
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: NEUTRAL_COLORS.accent,
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minHeight: 60,
                  color: NEUTRAL_COLORS.textSecondary,
                  '&.Mui-selected': {
                    color: NEUTRAL_COLORS.accent,
                  },
                  '&:hover': {
                    color: NEUTRAL_COLORS.accent,
                    backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
                  }
                }
              }}
            >
              <Tab 
                icon={<QuestionsIcon />} 
                iconPosition="start"
                label="Questions" 
                {...a11yProps(0)} 
              />
              <Tab 
                icon={<AnswersIcon />} 
                iconPosition="start"
                label="Answers" 
                {...a11yProps(1)} 
              />
              <Tab 
                icon={<CategoriesIcon />} 
                iconPosition="start"
                label="Categories" 
                {...a11yProps(2)} 
              />
            </Tabs>
          </Box>

          {/* Содержимое табов */}
          <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <TabPanel value={tabValue} index={0}>
              <AdminQuestions />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <AdminAnswers />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <AdminCategories />
            </TabPanel>
          </Box>
        </Paper>

        {/* Статусная информация */}
        <Fade in timeout={1000}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              borderRadius: 3,
              border: `1px solid ${NEUTRAL_COLORS.border}`,
              backgroundColor: alpha(NEUTRAL_COLORS.surface, 0.8),
              backdropFilter: 'blur(8px)'
            }}
          >
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="space-between" 
              alignItems="center"
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: NEUTRAL_COLORS.textSecondary,
                  fontSize: '0.875rem'
                }}
              >
                Administrator session • Last active: Now
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: alpha(NEUTRAL_COLORS.textSecondary, 0.7),
                  fontSize: '0.75rem'
                }}
              >
                Admin Panel v2.1.0 • {new Date().getFullYear()}
              </Typography>
            </Stack>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};