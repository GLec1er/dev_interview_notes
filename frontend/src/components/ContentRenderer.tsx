import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { CodeBlock } from './CodeBlock';
import type { ContentBlock } from '../types';

interface ContentRendererProps {
  blocks: ContentBlock[];
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ blocks }) => {
  return (
    <Box>
      {blocks.map((block, index) => {
        const data = block.data || {};
        
        switch (block.type) {
          case 'heading':
            return (
              <Typography key={index} variant="h5" sx={{ mt: 3, mb: 2, fontWeight: 'bold', color: '#00d4ff' }}>
                {data.text}
              </Typography>
            );

          case 'paragraph':
            return (
              <Typography key={index} variant="body1" sx={{ mb: 2, lineHeight: 1.8, color: '#e0e0e0' }}>
                {data.text}
              </Typography>
            );

          case 'code':
            return (
              <CodeBlock
                key={index}
                code={data.text || ''}
                language={data.language}
              />
            );

          case 'info':
            return (
              <Alert key={index} severity="info" sx={{ mb: 2, backgroundColor: 'rgba(0, 212, 255, 0.1)', color: '#00d4ff', border: '1px solid rgba(0, 212, 255, 0.3)' }}>
                {data.text || data.content}
              </Alert>
            );

          case 'warning':
            return (
              <Alert key={index} severity="warning" sx={{ mb: 2, backgroundColor: 'rgba(255, 170, 0, 0.1)', color: '#ffaa00', border: '1px solid rgba(255, 170, 0, 0.3)' }}>
                {data.text || data.content}
              </Alert>
            );

          case 'image':
            return (
              <Paper key={index} sx={{ mb: 2, overflow: 'hidden', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
                <img
                  src={data.url}
                  alt={data.alt || 'Image'}
                  style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                />
              </Paper>
            );

          default:
            return null;
        }
      })}
    </Box>
  );
};
