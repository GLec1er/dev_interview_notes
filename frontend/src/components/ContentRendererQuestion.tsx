// ContentRendererQuestion.tsx - исправленная версия
import React from 'react';
import { Box, Typography, Paper, Alert, alpha } from '@mui/material';
import { CodeBlock } from './CodeBlock';
import type { ContentBlock } from '../types';
import { FormattedText } from './FormattedText';
import { useTheme as useThemeContext } from '../context/ThemeContext';

// Стеклянная цветовая палитра iOS 26 Liquid Glass - теперь реагирует на смену темы
const getGlassColors = (mode: 'light' | 'dark') => {
  if (mode === 'dark') {
    return {
      primary: 'rgba(0, 212, 255, 0.9)', // Яркий киберпанк голубой
      secondary: 'rgba(138, 43, 226, 0.8)', // Яркий фиолетовый
      accent: 'rgba(0, 255, 200, 0.9)', // Киберпанк аква
      background: 'rgba(20, 20, 40, 0.6)', // Тёмный фон
      surface: 'rgba(30, 30, 60, 0.7)', // Тёмная поверхность
      surfaceDark: 'rgba(40, 40, 80, 0.8)', // Ещё темнее
      textPrimary: 'rgba(255, 255, 255, 0.95)',
      textSecondary: 'rgba(180, 180, 200, 0.7)',
      border: 'rgba(0, 212, 255, 0.3)', // Тёмная граница
      borderGlow: 'rgba(0, 212, 255, 0.6)',
      success: 'rgba(0, 228, 91, 0.9)', // Яркий зеленый
      error: 'rgba(255, 50, 100, 0.9)', // Яркий красный
      warning: 'rgba(255, 150, 0, 0.9)', // Яркий оранжевый
      info: 'rgba(90, 200, 250, 0.8)',
      purple: 'rgba(200, 100, 255, 0.9)', // Яркий фиолетовый
      blue: 'rgba(0, 180, 255, 0.9)', // Яркий голубой
      gradientStart: 'rgba(0, 212, 255, 0.2)',
      gradientEnd: 'rgba(138, 43, 226, 0.1)',
      glassOverlay: 'rgba(0, 212, 255, 0.1)',
      glassHighlight: 'rgba(0, 212, 255, 0.2)',
      mainColor: 'linear-gradient(135deg, #464646ff 0%, #292929ff 50%, #000000ff 100%)',
    };
  }
  
  // Light mode
  return {
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
    info: 'rgba(90, 200, 250, 0.8)',
    purple: 'rgba(175, 82, 222, 0.8)', // iOS фиолетовый
    blue: 'rgba(0, 122, 255, 0.8)', // iOS синий
    gradientStart: 'rgba(255, 255, 255, 0.3)',
    gradientEnd: 'rgba(255, 255, 255, 0.1)',
    glassOverlay: 'rgba(255, 255, 255, 0.2)',
    glassHighlight: 'rgba(255, 255, 255, 0.5)',
    mainColor: 'linear-gradient(135deg, #E0F0FF 0%, #D0E4FF 50%, #B8D8FF 100%)',
  };
};

// Старая константа оставляем для совместимости, по умолчанию light mode
const GLASS_COLORS = getGlassColors('light');

interface ContentRendererQuestionProps {
  blocks: ContentBlock[];
}

export const ContentRendererQuestion: React.FC<ContentRendererQuestionProps> = ({ blocks }) => {  
  const { mode: themeMode } = useThemeContext();
  const GLASS_COLORS = getGlassColors(themeMode);

  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return <Typography variant="body1">Нет контента для отображения</Typography>;
  }

  const extractData = (block: ContentBlock) => {
    // Если есть вложенность data.data, извлекаем внутренний data
    if (block.data && block.data.data) {
      return block.data.data;
    }
    return block.data || {};
  };

  return (
    <Box>
      {blocks.map((block, index) => {
        
        if (!block || typeof block !== 'object') {
          return null;
        }
        
        const data = extractData(block); // Используем функцию извлечения данных
        const text = data.text || data.content || '';
        
        switch (block.type) {
          case 'heading':
            const level = data.level || 1;
            const variant = `h${Math.min(6, level + 1)}` as const;
            return (
              <FormattedText
                key={index}
                text={text}
                variant={variant}
                component="div"
                sx={{ 
                  mt: level === 1 ? 4 : 3,
                  mb: 2,
                  fontWeight: 700,
                  color: GLASS_COLORS.textPrimary,
                  lineHeight: 1.3,
                  fontSize: '1.7rem',
                }}
              />
            );

          case 'paragraph':
          case 'text':
            return (
              <FormattedText
                key={index}
                text={text}
                variant="body1"
                component="div"
                sx={{ 
                  mb: 2.5, 
                  fontWeight: 400,
                  lineHeight: 1.8,
                  color: GLASS_COLORS.textPrimary,
                  fontSize: '1.15rem',
                }}
              />
            );

          case 'code':
            return (
              <Box key={index} sx={{ mb: 3 }}>
                <CodeBlock
                  code={data.code || data.text || ''}
                  language={data.language || 'text'}
                />
              </Box>
            );

          case 'info':
          case 'warning':
            return (
              <Alert 
                key={index} 
                severity={block.type}
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(GLASS_COLORS[block.type], 0.3)}`,
                  backgroundColor: alpha(GLASS_COLORS[block.type], 0.05),
                  color: GLASS_COLORS.textPrimary,
                  '& .MuiAlert-icon': {
                    color: GLASS_COLORS[block.type],
                  },
                  alignItems: 'flex-start',
                  py: 2,
                }}
              >
                <Box sx={{ lineHeight: 1.7, fontSize: '1.05rem' }}>
                  <FormattedText text={text} variant="body1" />
                </Box>
              </Alert>
            );

          case 'image':
            return (
              <Paper 
                key={index} 
                sx={{ 
                  mb: 3, 
                  p: 2,
                  overflow: 'hidden',
                  borderRadius: 2,
                  border: `1px solid ${GLASS_COLORS.border}`,
                  backgroundColor: GLASS_COLORS.background,
                  textAlign: 'center',
                }}
              >
                <img
                  src={data.url}
                  alt={data.alt || 'Image'}
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto', 
                    display: 'block',
                    borderRadius: '8px',
                    margin: '0 auto',
                    backgroundColor: GLASS_COLORS.background,
                  }}
                  onError={(e) => {
                    console.error('Image failed to load:', data.url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {data.caption && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block',
                      mt: 2,
                      textAlign: 'center',
                      color: GLASS_COLORS.textSecondary,
                      fontStyle: 'italic',
                      fontSize: '0.9rem',
                    }}
                  >
                    {data.caption}
                  </Typography>
                )}
              </Paper>
            );

          case 'list':
            const items = data.items || [];
            const ListComponent = data.style === 'ordered' ? 'ol' : 'ul';
            return (
              <Box 
                key={index} 
                component={ListComponent}
                sx={{ 
                  mb: 2.5,
                  pl: 3,
                  color: GLASS_COLORS.textPrimary,
                  '& li': {
                    mb: 1,
                    lineHeight: 1.7,
                    fontSize: '1.1rem',
                  },
                }}
              >
                {items.map((item: string, itemIndex: number) => (
                  <Typography 
                    key={itemIndex} 
                    component="li"
                    sx={{ mb: 1 }}
                  >
                    <FormattedText text={item} variant="body1" />
                  </Typography>
                ))}
              </Box>
            );

          case 'quote':
            return (
              <Paper 
                key={index}
                sx={{ 
                  mb: 3,
                  p: 3,
                  borderRadius: 2,
                  borderLeft: `4px solid ${GLASS_COLORS.accent}`,
                  backgroundColor: alpha(GLASS_COLORS.background, 0.7),
                  fontStyle: 'italic',
                }}
              >
                <FormattedText
                  text={text}
                  variant="body1"
                  sx={{ 
                    color: GLASS_COLORS.textPrimary,
                    lineHeight: 1.8,
                    fontSize: '1.1rem',
                    mb: data.caption ? 2 : 0,
                  }}
                />
                {data.caption && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block',
                      color: GLASS_COLORS.textSecondary,
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    — {data.caption}
                  </Typography>
                )}
              </Paper>
            );

          case 'delimiter':
            return (
              <Box 
                key={index}
                sx={{ 
                  my: 4,
                  height: '1px',
                  backgroundColor: GLASS_COLORS.border,
                  width: '100%',
                }}
              />
            );

          default:
            console.warn(`Unknown block type: ${block.type}`, block);
            return null;
        }
      })}
    </Box>
  );
};