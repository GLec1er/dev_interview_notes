import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Pagination,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { questionService } from '../services/questionService';
import type { Question } from '../types';

const ITEMS_PER_PAGE = 10;

export const QuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [isPublished, setIsPublished] = useState<string>('');

  useEffect(() => {
    loadQuestions();
  }, [page, search, difficulty, isPublished]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const skip = (page - 1) * ITEMS_PER_PAGE;
      const data = await questionService.getQuestions(
        skip,
        ITEMS_PER_PAGE,
        isPublished === '' ? undefined : isPublished === 'true',
        difficulty || undefined
      );
      setQuestions(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: '#0a0e27', minHeight: '100vh' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #00d4ff 0%, #ff006e 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
          🚀 Interview Questions
        </Typography>
        <Typography variant="body1" sx={{ color: '#a0a0a0' }}>
          Master your technical interview skills
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={2}>
          <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, px: 1 }}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#e0e0e0',
                  '& fieldset': {
                    borderColor: 'rgba(0, 212, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 212, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00d4ff',
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: '#707070',
                  opacity: 1,
                },
              }}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, px: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: '#a0a0a0' }}>Difficulty</InputLabel>
              <Select
                value={difficulty}
                label="Difficulty"
                onChange={(e) => {
                  setDifficulty(e.target.value);
                  setPage(1);
                }}
                sx={{
                  color: '#e0e0e0',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 212, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 212, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#00d4ff',
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, px: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: '#a0a0a0' }}>Status</InputLabel>
              <Select
                value={isPublished}
                label="Status"
                onChange={(e) => {
                  setIsPublished(e.target.value);
                  setPage(1);
                }}
                sx={{
                  color: '#e0e0e0',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 212, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 212, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#00d4ff',
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Published</MenuItem>
                <MenuItem value="false">Draft</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, px: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearch('');
                setDifficulty('');
                setIsPublished('');
                setPage(1);
              }}
            >
              Reset
            </Button>
          </Box>
        </Grid>
      </Card>

      {/* Questions List */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
          <CircularProgress sx={{ color: '#00d4ff' }} />
        </Box>
      ) : filteredQuestions.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="textSecondary">No questions found</Typography>
        </Card>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
            {filteredQuestions.map((question) => (
              <Card
                key={question.id}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(0, 212, 255, 0.2)',
                    transform: 'translateY(-4px)',
                    borderColor: 'rgba(0, 212, 255, 0.5)',
                  },
                }}
                onClick={() => navigate(`/questions/${question.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h6" sx={{ flex: 1, minWidth: '200px', color: '#e0e0e0', fontWeight: 600 }}>
                      {question.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, ml: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <Chip
                        label={question.difficulty.toUpperCase()}
                        color={getDifficultyColor(question.difficulty) as any}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                      {question.is_published ? (
                        <Chip label="Published" color="success" size="small" sx={{ fontWeight: 700 }} />
                      ) : (
                        <Chip label="Draft" color="default" size="small" sx={{ fontWeight: 700 }} />
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#a0a0a0' }}>
                    Click to view details and answers →
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#a0a0a0',
                  borderColor: 'rgba(0, 212, 255, 0.3)',
                  '&.Mui-selected': {
                    backgroundColor: '#00d4ff',
                    color: '#0a0e27',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  },
                },
              }}
            />
          </Box>
        </>
      )}
    </Container>
  );
};
