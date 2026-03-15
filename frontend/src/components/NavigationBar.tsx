import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Stack,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  alpha,
  Divider,
  Typography,
  useMediaQuery,
  useTheme as useMuiTheme,
  Badge,
} from '@mui/material';
import {
  Assignment as QuestionsIcon,
  Business as CompaniesIcon,
  AccountCircle as ProfileIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
  Favorite as FavoriteIcon,
  MapOutlined as RoadmapIcon,
  InterpreterMode as InterpreterModeIcon,
  Bolt as BoltIcon,
  Whatshot as WhatshotIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useThemeContext } from '../context/ThemeContext';

const getGlassColors = (mode: 'light' | 'dark') => {
  if (mode === 'dark') {
    return {
      primary: 'rgba(0, 212, 255, 0.9)',
      secondary: 'rgba(138, 43, 226, 0.8)',
      background: 'rgba(20, 20, 40, 0.6)',
      surface: 'rgba(30, 30, 60, 0.7)',
      surfaceDark: 'rgba(40, 40, 80, 0.8)',
      textPrimary: 'rgba(255, 255, 255, 0.95)',
      textSecondary: 'rgba(180, 180, 200, 0.7)',
      border: 'rgba(0, 212, 255, 0.3)',
      borderGlow: 'rgba(0, 212, 255, 0.6)',
      success: 'rgba(0, 228, 91, 0.9)',
      error: 'rgba(255, 50, 100, 0.9)',
      warning: 'rgba(255, 150, 0, 0.9)',
      purple: 'rgba(200, 100, 255, 0.9)',
      glassHighlight: 'rgba(0, 212, 255, 0.2)',
      interviewGradient: 'linear-gradient(135deg, #00ff87 0%, #60efff 100%)',
      interviewGlow: 'rgba(0, 255, 135, 0.4)',
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
    interviewGradient: 'linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)',
    interviewGlow: 'rgba(200, 80, 192, 0.3)',
  };
};

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  requiredAuth?: boolean;
  isHighlighted?: boolean;
}

interface NavigationBarProps {
  showQuestions?: boolean;
  showCompanies?: boolean;
  showProfile?: boolean;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'compact' | 'full';
  onNavigate?: (path: string) => void;
}

const navItems: NavItem[] = [
  {
    label: 'В главное меню',
    path: '/',
    icon: DashboardIcon,
    requiredAuth: true,
  },
  {
    label: 'Список вопросов',
    path: '/questions',
    icon: QuestionsIcon,
    requiredAuth: true,
  },
  {
    label: 'Пройти собеседование',
    path: '/companies',
    icon: InterpreterModeIcon,
    requiredAuth: false,
    isHighlighted: true,
  },
  {
    label: 'Дорожные карты',
    path: '/roadmap',
    icon: RoadmapIcon,
    requiredAuth: true,
  },
  {
    label: 'Избранные вопросы',
    path: '/favorites',
    icon: FavoriteIcon,
    requiredAuth: true,
  },
];

const NavButton: React.FC<{
  item: NavItem;
  onNavigate: (path: string) => void;
  GLASS_COLORS: any;
  isActive?: boolean;
}> = ({ item, onNavigate, GLASS_COLORS, isActive = false }) => {
  const Icon = item.icon;
  const isHighlighted = item.isHighlighted;

  // Базовые стили для всех кнопок
  const baseStyles = {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    borderRadius: 2.5,
    px: 2.5,
    py: 1,
    transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
    position: 'relative',
    overflow: 'hidden',
  };

  // Стили для выделенной кнопки "Пройти собеседование"
  if (isHighlighted) {
    return (
      <Tooltip title={item.label}>
        <Button
          onClick={() => onNavigate(item.path)}
          startIcon={<Icon sx={{ fontSize: '1.3rem' }} />}
          sx={{
            ...baseStyles,
            background: GLASS_COLORS.interviewGradient,
            color: '#fff',
            border: 'none',
            boxShadow: `0 4px 15px ${GLASS_COLORS.interviewGlow}`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              transition: 'left 0.5s ease',
            },
            '&:hover': {
              transform: 'translateY(-2px) scale(1.05)',
              boxShadow: `0 8px 25px ${GLASS_COLORS.interviewGlow}`,
              '&::before': {
                left: '100%',
              },
            },
            '&:active': {
              transform: 'translateY(0) scale(0.95)',
            },
          }}
        >
          {item.label}
        </Button>
      </Tooltip>
    );
  }

  // Стили для обычных кнопок
  return (
    <Tooltip title={item.label}>
      <Button
        onClick={() => onNavigate(item.path)}
        startIcon={<Icon sx={{ fontSize: '1.3rem' }} />}
        sx={{
          ...baseStyles,
          color: isActive ? '#fff' : GLASS_COLORS.textPrimary,
          background: isActive
            ? `linear-gradient(135deg, ${GLASS_COLORS.primary}, ${alpha(GLASS_COLORS.primary, 0.7)})`
            : alpha(GLASS_COLORS.primary, 0.05),
          border: '1px solid',
          borderColor: isActive ? GLASS_COLORS.primary : GLASS_COLORS.border,
          backdropFilter: 'blur(10px)',
          '&:hover': {
            background: isActive
              ? `linear-gradient(135deg, ${alpha(GLASS_COLORS.primary, 0.9)}, ${alpha(GLASS_COLORS.primary, 0.6)})`
              : alpha(GLASS_COLORS.primary, 0.15),
            borderColor: GLASS_COLORS.primary,
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 16px ${alpha(GLASS_COLORS.primary, 0.1)}`,
          },
        }}
      >
        {item.label}
      </Button>
    </Tooltip>
  );
};

const MobileNavMenu: React.FC<{
  items: NavItem[];
  user: any;
  isAuthenticated: boolean;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  GLASS_COLORS: any;
}> = ({ items, user, isAuthenticated, onNavigate, GLASS_COLORS }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path: string) => {
    onNavigate(path);
    handleMenuClose();
  };

  const filteredItems = items.filter((item) => {
    if (item.adminOnly && !user?.is_admin) return false;
    if (item.requiredAuth && !isAuthenticated) return false;
    return true;
  });

  // Находим выделенную кнопку для мобильной версии
  const highlightedItem = filteredItems.find(item => item.isHighlighted);
  const regularItems = filteredItems.filter(item => !item.isHighlighted);

  return (
    <>
      <IconButton
        onClick={handleMenuOpen}
        size="small"
        sx={{
          color: GLASS_COLORS.primary,
          background: alpha(GLASS_COLORS.primary, 0.1),
          border: '1px solid',
          borderColor: GLASS_COLORS.border,
          backdropFilter: 'blur(10px)',
          '&:hover': {
            background: alpha(GLASS_COLORS.primary, 0.2),
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: GLASS_COLORS.surface,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: GLASS_COLORS.border,
            borderRadius: 3,
            minWidth: '200px',
            mt: 1,
            boxShadow: `0 8px 32px ${alpha(GLASS_COLORS.primary, 0.15)}`,
          },
        }}
      >
        {highlightedItem && (
          <>
            <MenuItem
              onClick={() => handleMenuItemClick(highlightedItem.path)}
              sx={{
                background: GLASS_COLORS.interviewGradient,
                color: '#fff',
                fontWeight: 600,
                '&:hover': {
                  background: GLASS_COLORS.interviewGradient,
                  filter: 'brightness(1.1)',
                },
                mx: 1,
                borderRadius: 2,
              }}
            >
              <InterpreterModeIcon sx={{ mr: 1.5, fontSize: '1.1rem' }} />
              {highlightedItem.label}
            </MenuItem>
            <Divider sx={{ my: 1, borderColor: GLASS_COLORS.border }} />
          </>
        )}

        {regularItems.map((item) => {
          const Icon = item.icon;
          return (
            <MenuItem
              key={item.path}
              onClick={() => handleMenuItemClick(item.path)}
              sx={{
                color: GLASS_COLORS.textPrimary,
                '&:hover': {
                  background: alpha(GLASS_COLORS.primary, 0.1),
                },
              }}
            >
              <Icon sx={{ mr: 1.5, fontSize: '1.1rem' }} />
              {item.label}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export const NavigationBar: React.FC<NavigationBarProps> = ({
  showQuestions = true,
  showCompanies = true,
  showProfile = true,
  variant = 'full',
  onNavigate: onNavigateCallback,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { mode: themeMode } = useThemeContext();
  const GLASS_COLORS = getGlassColors(themeMode);
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigateCallback?.(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Фильтруем элементы навигации
  let displayItems = [...navItems];

  if (!showQuestions) {
    displayItems = displayItems.filter((item) => item.path !== '/questions');
  }
  if (!showCompanies) {
    displayItems = displayItems.filter((item) => item.path !== '/companies');
  }

  // Фильтруем по аутентификации
  displayItems = displayItems.filter((item) => {
    if (item.adminOnly && !user?.is_admin) return false;
    if (item.requiredAuth && !isAuthenticated) return false;
    return true;
  });

  // Компактный вариант - только основные кнопки
  if (variant === 'compact') {
    displayItems = displayItems.filter(
      (item) => item.path === '/questions' || item.path === '/companies'
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: isMobile ? 1 : 2,
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: isMobile ? 'space-between' : 'center',
        p: isMobile ? 1.5 : 2,
        borderRadius: 3,
        background: GLASS_COLORS.surface,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: GLASS_COLORS.border,
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
          opacity: 0.3,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Главные кнопки навигации */}
      <Stack
        direction="row"
        spacing={isMobile ? 0.5 : 1}
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          justifyContent: 'center',
        }}
      >
        {isMobile && displayItems.length > 2 ? (
          <MobileNavMenu
            items={displayItems}
            user={user}
            isAuthenticated={isAuthenticated}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            GLASS_COLORS={GLASS_COLORS}
          />
        ) : (
          displayItems.map((item) => (
            <NavButton
              key={item.path}
              item={item}
              onNavigate={handleNavigate}
              GLASS_COLORS={GLASS_COLORS}
            />
          ))
        )}
      </Stack>
    </Box>
  );
};