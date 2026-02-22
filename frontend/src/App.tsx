import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AppContent from './AppContent';

// Светлая тема
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0066cc',
      light: '#3385ff',
      dark: '#004499',
    },
    secondary: {
      main: '#cc0066',
      light: '#ff3399',
      dark: '#990044',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    success: {
      main: '#00aa44',
    },
    warning: {
      main: '#ff8800',
    },
    error: {
      main: '#cc0000',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
          border: '1px solid rgba(0, 102, 204, 0.15)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: 'rgba(0, 102, 204, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 102, 204, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          transition: 'all 0.3s ease',
        },
        contained: {
          background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #3385ff 0%, #0055bb 100%)',
            boxShadow: '0 8px 24px rgba(0, 102, 204, 0.3)',
          },
        },
        outlined: {
          borderColor: 'rgba(0, 102, 204, 0.5)',
          color: '#0066cc',
          '&:hover': {
            borderColor: '#0066cc',
            backgroundColor: 'rgba(0, 102, 204, 0.1)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: '6px',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
          border: '1px solid rgba(0, 102, 204, 0.15)',
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            borderColor: 'rgba(0, 102, 204, 0.3)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
            WebkitTextFillColor: '#212121 !important',
            caretColor: '#212121',
            borderRadius: 'inherit',
          },
          '& input:-webkit-autofill:hover': {
            WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
            WebkitTextFillColor: '#212121 !important',
          },
          '& input:-webkit-autofill:focus': {
            WebkitBoxShadow: '0 0 0 1000px #fcfdff inset !important',
            WebkitTextFillColor: '#212121 !important',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
            WebkitTextFillColor: '#212121 !important',
            caretColor: '#212121',
            borderRadius: 'inherit',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
            WebkitTextFillColor: '#212121 !important',
          },
        },
      },
    },
  },
});

// Тёмная тема
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff',
      light: '#33e0ff',
      dark: '#0099cc',
    },
    secondary: {
      main: '#ff006e',
      light: '#ff3385',
      dark: '#cc0056',
    },
    background: {
      default: '#0a0e27',
      paper: '#1a1f3a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    success: {
      main: '#00ff88',
    },
    warning: {
      main: '#ffaa00',
    },
    error: {
      main: '#ff3333',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, #1a1f3a 0%, #252d4a 100%)',
          border: '1px solid rgba(0, 212, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: 'rgba(0, 212, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 212, 255, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          transition: 'all 0.3s ease',
        },
        contained: {
          background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #33e0ff 0%, #00b3e5 100%)',
            boxShadow: '0 8px 24px rgba(0, 212, 255, 0.3)',
          },
        },
        outlined: {
          borderColor: 'rgba(0, 212, 255, 0.5)',
          color: '#00d4ff',
          '&:hover': {
            borderColor: '#00d4ff',
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: '6px',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, #1a1f3a 0%, #252d4a 100%)',
          border: '1px solid rgba(0, 212, 255, 0.1)',
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            borderColor: 'rgba(0, 212, 255, 0.3)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px #1a1f3a inset !important',
            WebkitTextFillColor: '#ffffff !important',
            caretColor: '#ffffff',
            borderRadius: 'inherit',
          },
          '& input:-webkit-autofill:hover': {
            WebkitBoxShadow: '0 0 0 1000px #1a1f3a inset !important',
            WebkitTextFillColor: '#ffffff !important',
          },
          '& input:-webkit-autofill:focus': {
            WebkitBoxShadow: '0 0 0 1000px #1a1f3a inset !important',
            WebkitTextFillColor: '#ffffff !important',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px #1a1f3a inset !important',
            WebkitTextFillColor: '#ffffff !important',
            caretColor: '#ffffff',
            borderRadius: 'inherit',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px #1a1f3a inset !important',
            WebkitTextFillColor: '#ffffff !important',
          },
        },
      },
    },
  },
});

function AppWithTheme() {
  const { mode } = useTheme();
  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AppContent />
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}

export default App;