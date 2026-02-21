import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, GlobalStyles } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { QuestionsPage } from './pages/QuestionsPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { AdminPage } from './pages/AdminPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { RoadmapsPage } from './pages/RoadmapsPage';

const theme = createTheme({
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
    // Стили для полей ввода
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px #ffffffff inset !important',
            WebkitTextFillColor: '#000000ff !important',
            caretColor: '#ffffff',
            borderRadius: 'inherit',
          },
          '& input:-webkit-autofill:hover': {
            WebkitBoxShadow: '0 0 0 1000px #ffffffff inset !important',
            WebkitTextFillColor: '#000000ff !important',
          },
          '& input:-webkit-autofill:focus': {
            WebkitBoxShadow: '0 0 0 1000px #fcfdffff inset !important',
            WebkitTextFillColor: '#000000ff !important',
          },
          '& input:-webkit-autofill:active': {
            WebkitBoxShadow: '0 0 0 1000px #ffffffff inset !important',
            WebkitTextFillColor: '#000000ff !important',
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

// Глобальные стили для автозаполнения
const autocompleteStyles = {
  '@keyframes autofill': {
    '0%,100%': {
      color: '#ffffff',
      background: '#1a1f3a',
    },
  },
  'input:-webkit-autofill': {
    animationName: 'autofill',
    animationDuration: '0s',
    animationFillMode: 'forwards',
    WebkitAnimationName: 'autofill',
    WebkitAnimationDuration: '0s',
    WebkitAnimationFillMode: 'forwards',
    transition: 'background-color 9999s ease-in-out 0s',
    WebkitTransition: 'background-color 9999s ease-in-out 0s',
    caretColor: '#ffffff !important',
    WebkitTextFillColor: '#ffffff !important',
    color: '#ffffff !important',
    // backgroundColor: '#1a1f3a !important',
    backgroundClip: 'content-box !important',
    boxShadow: '0 0 0 1000px #1a1f3a inset !important',
    WebkitBoxShadow: '0 0 0 1000px #1a1f3a inset !important',
    border: 'none',
  },
  'input:-webkit-autofill:hover': {
    WebkitBoxShadow: '0 0 0 1000px #1a1f3a inset !important',
    WebkitTextFillColor: '#ffffff !important',
  },
  'input:-webkit-autofill:focus': {
    WebkitBoxShadow: '0 0 0 1000px #1a1f3a inset !important',
    WebkitTextFillColor: '#ffffff !important',
  },
  'input:-webkit-autofill:active': {
    WebkitBoxShadow: '0 0 0 1000px #1a1f3a inset !important',
    WebkitTextFillColor: '#ffffff !important',
  },
  // Для Firefox
  'input:autofill': {
    // backgroundColor: '#1a1f3a !important',
    color: '#ffffff !important',
    boxShadow: '0 0 0 1000px #1a1f3a inset !important',
  },
  // Для Edge
  'input:-internal-autofill-selected': {
    // backgroundColor: '#1a1f3a !important',
    color: '#ffffff !important',
    boxShadow: '0 0 0 1000px #1a1f3a inset !important',
  },
  // Для всех браузеров через анимацию
  'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active': {
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: '#ffffff !important',
    transition: 'background-color 5000s ease-in-out 0s',
    boxShadow: 'inset 0 0 20px 20px #1a1f3a !important',
  },
  // Специфичные селекторы для разных браузеров
  'input:-webkit-autofill, textarea:-webkit-autofill, select:-webkit-autofill': {
    '&, &:hover, &:focus, &:active': {
      WebkitBoxShadow: '0 0 0 1000px #1a1f3a inset !important',
      WebkitTextFillColor: '#ffffff !important',
      caretColor: '#ffffff',
      transition: 'background-color 5000s ease-in-out 0s',
    },
  },
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Глобальные стили для автозаполнения */}
      <GlobalStyles
        styles={autocompleteStyles}
      />
      <Router>
        <AuthProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Protected Routes */}
                <Route
                  path="/questions"
                  element={
                    <ProtectedRoute>
                      <QuestionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/questions/:questionId"
                  element={
                    <ProtectedRoute>
                      <QuestionDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/roadmap"
                  element={
                    <ProtectedRoute>
                      <RoadmapsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <FavoritesPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Box>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;