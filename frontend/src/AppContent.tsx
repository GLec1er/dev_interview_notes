import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyles, Box, useTheme as useMuiTheme } from '@mui/material';
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
import { CompaniesPage } from './pages/CompaniesPage';
import { CompanyQuestionsPage } from './pages/CompanyQuestionsPage';
import { InterviewModePage } from './pages/InterviewModePage';

function AppContent() {
  const theme = useMuiTheme();

  // Глобальные стили в зависимости от темы
  const globalStyles = {
    'html, body, #root': {
      width: '100%',
      height: '100%',
      minHeight: '100vh',
    },
    body: {
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
      transition: 'background-color 0.3s ease, color 0.3s ease',
    },
    '#root': {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.background.default,
    },
    main: {
      flex: 1,
    },
    // Scrollbar styling
    '::-webkit-scrollbar': {
      width: '10px',
      height: '10px',
    },
    '::-webkit-scrollbar-track': {
      background: theme.palette.mode === 'dark' 
        ? 'rgba(0, 212, 255, 0.05)' 
        : 'rgba(0, 0, 0, 0.05)',
    },
    '::-webkit-scrollbar-thumb': {
      background: theme.palette.mode === 'dark' 
        ? 'rgba(0, 212, 255, 0.3)' 
        : 'rgba(0, 0, 0, 0.3)',
      borderRadius: '5px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: theme.palette.mode === 'dark' 
        ? 'rgba(0, 212, 255, 0.5)' 
        : 'rgba(0, 0, 0, 0.5)',
    },
  };

  return (
    <>
      <GlobalStyles styles={globalStyles} />
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
                  path="/companies"
                  element={
                    <ProtectedRoute>
                      <CompaniesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/companies/:companyId/questions"
                  element={
                    <ProtectedRoute>
                      <CompanyQuestionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/companies/:companyId/interview/:questionIndex"
                  element={
                    <ProtectedRoute>
                      <InterviewModePage />
                    </ProtectedRoute>
                  }
                />
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
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <FavoritesPage />
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

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Box>
        </AuthProvider>
      </Router>
    </>
  );
}

export default AppContent;
