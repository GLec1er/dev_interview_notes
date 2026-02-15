// ContentRenderer.tsx - исправленная версия
import React from 'react';
import { Box, Typography, Paper, Alert, alpha } from '@mui/material';
import { CodeBlock } from './CodeBlock';
import type { ContentBlock } from '../types';
import { FormattedText } from './FormattedText';

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

interface ContentRendererProps {
  blocks: ContentBlock[];
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ blocks }) => {  
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
                  color: NEUTRAL_COLORS.textPrimary,
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
                  color: NEUTRAL_COLORS.textPrimary,
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
                  border: `1px solid ${alpha(NEUTRAL_COLORS[block.type], 0.3)}`,
                  backgroundColor: alpha(NEUTRAL_COLORS[block.type], 0.05),
                  color: NEUTRAL_COLORS.textPrimary,
                  '& .MuiAlert-icon': {
                    color: NEUTRAL_COLORS[block.type],
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
                  border: `1px solid ${NEUTRAL_COLORS.border}`,
                  backgroundColor: NEUTRAL_COLORS.background,
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
                    backgroundColor: NEUTRAL_COLORS.background,
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
                      color: NEUTRAL_COLORS.textSecondary,
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
                  color: NEUTRAL_COLORS.textPrimary,
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
                  borderLeft: `4px solid ${NEUTRAL_COLORS.accent}`,
                  backgroundColor: alpha(NEUTRAL_COLORS.background, 0.7),
                  fontStyle: 'italic',
                }}
              >
                <FormattedText
                  text={text}
                  variant="body1"
                  sx={{ 
                    color: NEUTRAL_COLORS.textPrimary,
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
                      color: NEUTRAL_COLORS.textSecondary,
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
                  backgroundColor: NEUTRAL_COLORS.border,
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