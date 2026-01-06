import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { questionService } from '../services/questionService';
import { answerService } from '../services/answerService';
import { ContentRenderer } from '../components/ContentRenderer';
import type { Question, Answer } from '../types';

export const QuestionDetailPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [questionId]);

  const loadData = async () => {
    if (!questionId) return;

    try {
      setIsLoading(true);
      setError(null);
      const questionData = await questionService.getQuestion(questionId);
      console.log('Question loaded:', questionData);
      setQuestion(questionData);
      
      try {
        const answersData = await answerService.getAnswers(questionId);
        console.log('Answers loaded:', answersData);
        setAnswers(answersData);
      } catch (answerErr) {
        console.warn('Failed to load answers:', answerErr);
        setAnswers([]);
      }
    } catch (err) {
      console.error('Failed to load question:', err);
      setError('Failed to load question details');
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

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" sx={{ py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !question) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/questions')}
          sx={{ mb: 2 }}
        >
          Back to Questions
        </Button>
        <Alert severity="error">{error || 'Question not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: '#0a0e27', minHeight: '100vh' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/questions')}
        sx={{ mb: 3, color: '#00d4ff' }}
        variant="text"
      >
        ← Back to Questions
      </Button>

      {/* Question Card */}
      <Card sx={{ mb: 4, p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: '300px' }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2, background: 'linear-gradient(135deg, #00d4ff 0%, #ff006e 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {question.title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Chip
              label={question.difficulty.toUpperCase()}
              color={getDifficultyColor(question.difficulty) as any}
              variant="filled"
              sx={{ fontWeight: 700, fontSize: '0.85rem' }}
            />
            {question.is_published ? (
              <Chip label="Published" color="success" variant="filled" sx={{ fontWeight: 700 }} />
            ) : (
              <Chip label="Draft" color="default" variant="outlined" sx={{ fontWeight: 700 }} />
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 3, color: '#e0e0e0', fontSize: '1.05rem', lineHeight: 1.8 }}>
          <ContentRenderer blocks={question.content} />
        </Box>
      </Card>

      {/* Answers Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#00d4ff' }}>
          💡 Solutions ({answers.length})
        </Typography>
      </Box>

      {answers.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="textSecondary" sx={{ fontSize: '1.1rem' }}>
            No answers available yet
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {answers.map((answer, index) => (
            <Accordion key={answer.id} defaultExpanded={index === 0} sx={{ 
              '& .MuiAccordionSummary-root': {
                backgroundColor: 'rgba(0, 212, 255, 0.05)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 212, 255, 0.1)',
                },
              },
              '& .MuiAccordionDetails-root': {
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: '#e0e0e0',
              },
            }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#00d4ff' }}>
                  ✓ Solution {index + 1}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ width: '100%', color: '#e0e0e0', fontSize: '1.05rem', lineHeight: 1.8 }}>
                  <ContentRenderer blocks={answer.content} />
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Container>
  );
};
