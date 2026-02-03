import React, { useState } from 'react';
import { Box, Paper, IconButton, Tooltip, alpha, useTheme, useMediaQuery } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ContentCopy as CopyIcon, Check as CheckIcon } from '@mui/icons-material';
import type { ProgrammingLanguage } from '../types';

interface CodeBlockProps {
  code: string;
  language?: ProgrammingLanguage;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'text' }) => {
  const [copied, setCopied] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Определяем размер шрифта в зависимости от размера экрана
  const getFontSize = () => {
    if (isMobile) return '12px';      // Мобильные
    if (isTablet) return '13px';      // Планшеты
    return '14px';                    // Десктоп
  };

  // Определяем размер номеров строк
  const getLineNumberStyle = () => ({
    fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
    fontSize: getFontSize(),
    minWidth: isMobile ? '2em' : '3em',
    paddingRight: isMobile ? '0.5em' : '1em',
    textAlign: 'right',
  });

  return (
    <Box 
      sx={{ 
        my: 2, 
        overflow: 'hidden', 
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        backgroundColor: '#1e1e1eff',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.4)',
        }
      }}
    >
      {/* Верхняя панель с языком и кнопкой копирования */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.23)',
        padding: isMobile ? '6px 12px' : '8px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        {/* Язык */}
        <Box sx={{ 
          fontSize: isMobile ? '0.7rem' : '0.85rem', 
          color: '#00fbffff', 
          fontWeight: 600,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>
          {language}
        </Box>

        {/* Кнопка копирования */}
        <Tooltip title={copied ? "Скопировано!" : "Скопировать код"} arrow placement="left">
          <IconButton
            onClick={handleCopy}
            sx={{
              backgroundColor: copied ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              color: copied ? '#4ade80' : '#94a3b8',
              width: isMobile ? 28 : 32,
              height: isMobile ? 28 : 32,
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: copied ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                transform: 'scale(1.05)',
              },
            }}
            size="small"
          >
            {copied ? 
              <CheckIcon fontSize={isMobile ? "small" : "small"} /> : 
              <CopyIcon fontSize={isMobile ? "small" : "small"} />
            }
          </IconButton>
        </Tooltip>
      </Box>

      {/* Код */}
      <Box sx={{ 
        position: 'relative',
        overflowX: 'auto',
        '& pre': {
          margin: 0,
          padding: isMobile ? '12px' : '16px',
          backgroundColor: 'transparent',
          fontSize: getFontSize(),
          fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
          lineHeight: isMobile ? 1.5 : 1.6,
          minHeight: isMobile ? '40px' : '60px',
        },
        '& code': {
          fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
          fontSize: 'inherit',
          lineHeight: 'inherit',
        },
      }}>
        <SyntaxHighlighter
          language={language}
          style={dracula}
          customStyle={{
            margin: 0,
            padding: isMobile ? '12px' : '16px',
            backgroundColor: 'transparent',
            fontSize: getFontSize(),
            fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
            lineHeight: isMobile ? 1.5 : 1.6,
          }}
          showLineNumbers={!isMobile} // На мобильных скрываем номера строк для экономии места
          lineNumberStyle={getLineNumberStyle()}
          wrapLines={isMobile} // Перенос строк на мобильных
          wrapLongLines={isMobile} // Перенос длинных строк на мобильных
        >
          {code}
        </SyntaxHighlighter>
      </Box>
    </Box>
  );
};