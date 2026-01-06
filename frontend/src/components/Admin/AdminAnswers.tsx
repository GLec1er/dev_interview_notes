import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { questionService } from '../../services/questionService';
import { answerService } from '../../services/answerService';
import type { Question, Answer } from '../../types';

export const AdminAnswers: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<Answer | null>(null);
  const [formData, setFormData] = useState({
    content: JSON.stringify([{ type: 'paragraph', data: { text: '' } }]),
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (selectedQuestionId) {
      loadAnswers();
    }
  }, [selectedQuestionId]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const data = await questionService.getQuestions(0, 100);
      setQuestions(data.items);
    } catch (err) {
      console.error('Failed to load questions:', err);
      setError('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnswers = async () => {
    if (!selectedQuestionId) return;
    try {
      const data = await answerService.getAnswers(selectedQuestionId);
      setAnswers(data);
    } catch (err) {
      console.error('Failed to load answers:', err);
      setError('Failed to load answers');
    }
  };

  const handleOpenDialog = (answer?: Answer) => {
    if (answer) {
      setEditingAnswer(answer);
      setFormData({
        content: JSON.stringify(answer.content),
      });
    } else {
      setEditingAnswer(null);
      setFormData({
        content: JSON.stringify([{ type: 'paragraph', data: { text: '' } }]),
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAnswer(null);
  };

  const handleSave = async () => {
    if (!selectedQuestionId) return;
    try {
      setError(null);
      const content = JSON.parse(formData.content);
      
      if (editingAnswer) {
        await answerService.updateAnswer(selectedQuestionId, editingAnswer.id, {
          content,
        });
      } else {
        await answerService.createAnswer(selectedQuestionId, {
          content,
        });
      }
      handleCloseDialog();
      loadAnswers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save answer');
    }
  };

  const handleDelete = async (answerId: string) => {
    if (!selectedQuestionId) return;
    if (window.confirm('Are you sure you want to delete this answer?')) {
      try {
        setError(null);
        await answerService.deleteAnswer(selectedQuestionId, answerId);
        loadAnswers();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete answer');
      }
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Question</InputLabel>
        <Select
          value={selectedQuestionId}
          label="Select Question"
          onChange={(e) => setSelectedQuestionId(e.target.value)}
        >
          <MenuItem value="">-- Choose a question --</MenuItem>
          {questions.map((q) => (
            <MenuItem key={q.id} value={q.id}>
              {q.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedQuestionId && (
        <>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Answer
            </Button>
          </Box>

          <TableContainer component={Card}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Content Preview</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {answers.map((answer) => (
                  <TableRow key={answer.id}>
                    <TableCell>
                      {answer.content[0]?.data?.text?.substring(0, 100) || 'No content'}...
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(answer)}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(answer.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {answers.length === 0 && (
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Box color="textSecondary">No answers for this question yet</Box>
            </Card>
          )}
        </>
      )}

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAnswer ? 'Edit Answer' : 'Add Answer'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Content (JSON)"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            margin="normal"
            multiline
            rows={6}
            helperText="Enter content as JSON array"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
