import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4 as DarkIcon, Brightness7 as LightIcon } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <Tooltip title={mode === 'light' ? 'Тёмная тема' : 'Светлая тема'}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        sx={{
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: mode === 'light' 
              ? '0 0 10px rgba(0, 0, 0, 0.2)'
              : '0 0 10px rgba(0, 212, 255, 0.3)',
          },
        }}
      >
        {mode === 'light' ? (
          <DarkIcon sx={{ color: '#333' }} />
        ) : (
          <LightIcon sx={{ color: '#ffaa00' }} />
        )}
      </IconButton>
    </Tooltip>
  );
};
