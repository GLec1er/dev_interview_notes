import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { questionService } from '../services/questionService';
import { categoryService } from '../services/categoryService';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({ questions: 0, categories: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [questionsData, categoriesData] = await Promise.all([
          questionService.getQuestions(0, 1),
          categoryService.getCategories(0, 1),
        ]);
        setStats({
          questions: questionsData.total,
          categories: categoriesData.total,
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container maxWidth="lg">
        <Box sx={{ py: 8, textAlign: 'center', color: 'white' }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            Interview Questions
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Master your interview skills with our comprehensive question bank
          </Typography>

          {!isAuthenticated ? (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 6 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ px: 4, py: 1.5 }}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                sx={{
                  px: 4,
                  py: 1.5,
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
                size="large"
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 6 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/questions')}
                sx={{ px: 4, py: 1.5 }}
              >
                Start Learning
              </Button>
              {user?.is_admin && (
                <Button
                  variant="outlined"
                  sx={{
                    px: 4,
                    py: 1.5,
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  size="large"
                  onClick={() => navigate('/admin')}
                >
                  Admin Panel
                </Button>
              )}
            </Box>
          )}
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Box sx={{ width: { xs: '100%', sm: '50%' }, p: 1.5 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="textSecondary" gutterBottom>
                    Total Questions
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                    {stats.questions}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '50%' }, p: 1.5 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="textSecondary" gutterBottom>
                    Categories
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#764ba2' }}>
                    {stats.categories}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        )}

        <Box sx={{ py: 4, color: 'white', textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © 2026 Interview Questions. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
