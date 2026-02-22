import { useTheme } from '@mui/material';

/**
 * Получить цвета в зависимости от текущей темы
 * Используется в компонентах для адаптивного отображения
 */
export const useGlassColors = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (isDark) {
    return {
      primary: 'rgba(0, 212, 255, 0.8)',
      secondary: 'rgba(94, 92, 230, 0.75)',
      accent: 'rgba(90, 200, 250, 0.9)',
      background: 'rgba(10, 15, 40, 0.4)',
      surface: 'rgba(26, 31, 58, 0.6)',
      surfaceDark: 'rgba(26, 31, 58, 0.8)',
      textPrimary: 'rgba(255, 255, 255, 0.95)',
      textSecondary: 'rgba(180, 180, 180, 0.6)',
      border: 'rgba(0, 212, 255, 0.2)',
      borderGlow: 'rgba(0, 212, 255, 0.8)',
      success: 'rgba(0, 255, 136, 0.8)',
      error: 'rgba(255, 51, 51, 0.8)',
      warning: 'rgba(255, 170, 0, 0.8)',
      purple: 'rgba(175, 82, 222, 0.8)',
      blue: 'rgba(0, 212, 255, 0.8)',
      info: 'rgba(90, 200, 250, 0.8)',
      gradientStart: 'rgba(0, 212, 255, 0.3)',
      gradientEnd: 'rgba(94, 92, 230, 0.1)',
      glassOverlay: 'rgba(0, 212, 255, 0.1)',
      glassHighlight: 'rgba(255, 255, 255, 0.3)',
      question: 'rgba(158, 63, 167, 0.8)',
    };
  }

  // Светлая тема
  return {
    primary: 'rgba(0, 102, 204, 0.8)',
    secondary: 'rgba(102, 51, 153, 0.75)',
    accent: 'rgba(51, 153, 204, 0.9)',
    background: 'rgba(240, 244, 250, 0.4)',
    surface: 'rgba(255, 255, 255, 0.8)',
    surfaceDark: 'rgba(255, 255, 255, 0.95)',
    textPrimary: 'rgba(20, 20, 30, 0.95)',
    textSecondary: 'rgba(100, 100, 120, 0.6)',
    border: 'rgba(0, 102, 204, 0.15)',
    borderGlow: 'rgba(0, 102, 204, 0.6)',
    success: 'rgba(34, 177, 76, 0.8)',
    error: 'rgba(220, 50, 50, 0.8)',
    warning: 'rgba(255, 153, 0, 0.8)',
    purple: 'rgba(153, 51, 204, 0.8)',
    blue: 'rgba(0, 102, 204, 0.8)',
    info: 'rgba(51, 153, 204, 0.8)',
    gradientStart: 'rgba(255, 255, 255, 0.5)',
    gradientEnd: 'rgba(200, 220, 255, 0.2)',
    glassOverlay: 'rgba(200, 220, 255, 0.2)',
    glassHighlight: 'rgba(255, 255, 255, 0.7)',
    question: 'rgba(153, 51, 153, 0.8)',
  };
};

/**
 * Получить цвет категории в зависимости от её названия
 * Работает для обеих тем
 */
export const getCategoryColor = (categoryName: string, isDark: boolean = true): string => {
  const colorMap: Record<string, { dark: string; light: string }> = {
    'javascript': { dark: 'rgba(255, 170, 0, 0.8)', light: 'rgba(255, 153, 0, 0.8)' },
    'react': { dark: 'rgba(0, 212, 255, 0.8)', light: 'rgba(0, 102, 204, 0.8)' },
    'typescript': { dark: 'rgba(90, 200, 250, 0.9)', light: 'rgba(51, 153, 204, 0.9)' },
    'python': { dark: 'rgba(48, 105, 152, 0.8)', light: 'rgba(70, 130, 180, 0.8)' },
    'java': { dark: 'rgba(0, 115, 150, 0.8)', light: 'rgba(0, 102, 153, 0.8)' },
    'sql': { dark: 'rgba(255, 170, 0, 0.8)', light: 'rgba(255, 153, 0, 0.8)' },
    'system design': { dark: 'rgba(0, 255, 136, 0.8)', light: 'rgba(34, 177, 76, 0.8)' },
    'algorithms': { dark: 'rgba(175, 82, 222, 0.8)', light: 'rgba(153, 51, 204, 0.8)' },
    'data structures': { dark: 'rgba(228, 77, 38, 0.8)', light: 'rgba(204, 85, 34, 0.8)' },
    'behavioral': { dark: 'rgba(255, 51, 51, 0.8)', light: 'rgba(220, 50, 50, 0.8)' },
    'html': { dark: 'rgba(227, 79, 38, 0.8)', light: 'rgba(204, 85, 34, 0.8)' },
    'css': { dark: 'rgba(21, 114, 182, 0.8)', light: 'rgba(0, 102, 153, 0.8)' },
    'node.js': { dark: 'rgba(51, 153, 51, 0.8)', light: 'rgba(34, 139, 34, 0.8)' },
    'docker': { dark: 'rgba(36, 150, 237, 0.8)', light: 'rgba(0, 119, 182, 0.8)' },
    'aws': { dark: 'rgba(255, 170, 0, 0.8)', light: 'rgba(255, 153, 0, 0.8)' },
    'git': { dark: 'rgba(240, 80, 50, 0.8)', light: 'rgba(204, 85, 34, 0.8)' },
  };

  const lowerName = categoryName.toLowerCase();
  for (const [key, colors] of Object.entries(colorMap)) {
    if (lowerName.includes(key)) {
      return isDark ? colors.dark : colors.light;
    }
  }

  const darkColors = [
    'rgba(0, 212, 255, 0.8)',
    'rgba(0, 255, 136, 0.8)',
    'rgba(255, 170, 0, 0.8)',
    'rgba(255, 51, 51, 0.8)',
    'rgba(175, 82, 222, 0.8)',
    'rgba(0, 212, 255, 0.8)',
  ];

  const lightColors = [
    'rgba(0, 102, 204, 0.8)',
    'rgba(34, 177, 76, 0.8)',
    'rgba(255, 153, 0, 0.8)',
    'rgba(220, 50, 50, 0.8)',
    'rgba(153, 51, 204, 0.8)',
    'rgba(0, 102, 204, 0.8)',
  ];

  const colors = isDark ? darkColors : lightColors;

  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
