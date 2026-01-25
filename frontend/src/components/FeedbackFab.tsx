import React, { useState } from 'react';
import { Fab, Tooltip } from '@mui/material';
import { Help as HelpIcon } from '@mui/icons-material';
import { FeedbackDialog } from './FeedbackDialog';

export const FeedbackFab: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Tooltip title="Отправить замечание или предложение" arrow placement="left">
        <Fab
          color="secondary"
          aria-label="feedback"
          onClick={() => setDialogOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
            boxShadow: '0 8px 32px rgba(0, 212, 255, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.1) translateY(-4px)',
              boxShadow: '0 12px 48px rgba(0, 212, 255, 0.4)',
              background: 'linear-gradient(135deg, #33e0ff 0%, #00b3e5 100%)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
          }}
        >
          <HelpIcon sx={{ fontSize: '1.5rem' }} />
        </Fab>
      </Tooltip>

      <FeedbackDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};