import React from 'react';
import { Box, Paper } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ProgrammingLanguage } from '../types';

interface CodeBlockProps {
  code: string;
  language?: ProgrammingLanguage;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'text' }) => {
  return (
    <Paper elevation={2} sx={{ my: 2, overflow: 'hidden', border: '1px solid rgba(0, 212, 255, 0.2)', borderRadius: '8px' }}>
      <Box sx={{ backgroundColor: '#1a1f3a', p: 2, position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 8, right: 12, fontSize: '0.75rem', color: '#00d4ff', fontWeight: 700, opacity: 0.7 }}>
          {language}
        </Box>
        <SyntaxHighlighter
          language={language}
          style={dracula}
          customStyle={{
            margin: 0,
            padding: 0,
            backgroundColor: 'transparent',
            fontSize: '14px',
            fontFamily: '"Fira Code", "Courier New", monospace',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </Box>
    </Paper>
  );
};
