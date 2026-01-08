// CodeBlock.tsx - улучшенная версия с кнопкой копирования
import React, { useState } from 'react';
import { Box, Paper, IconButton, Tooltip, alpha } from '@mui/material';
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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
        padding: '8px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        {/* Язык */}
        <Box sx={{ 
          fontSize: '0.85rem', 
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
              width: 32,
              height: 32,
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: copied ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                transform: 'scale(1.05)',
              },
            }}
            size="small"
          >
            {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Код */}
      <Box sx={{ position: 'relative' }}>
        <SyntaxHighlighter
          language={language}
          style={dracula}
          customStyle={{
            margin: 0,
            padding: '16px',
            backgroundColor: 'transparent',
            fontSize: '16px',
            fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
            lineHeight: 1.6,
          }}
          showLineNumbers={true}
        >
          {code}
        </SyntaxHighlighter>
      </Box>
    </Box>
  );
};