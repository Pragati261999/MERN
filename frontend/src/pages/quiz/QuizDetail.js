import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { quizAPI } from '../../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentQuiz } from '../../store/slices/quizSlice';

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentQuiz } = useSelector((state) => state.quiz);
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await quizAPI.getQuiz(id);
        dispatch(setCurrentQuiz(response.data));
        setLoading(false);
      } catch (error) {
        setError('Failed to load quiz');
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, dispatch]);

  const handleEdit = () => {
    navigate(`/quizzes/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        setLoading(true);
        await quizAPI.deleteQuiz(id);
        navigate('/quizzes');
      } catch (error) {
        setError('Failed to delete quiz');
        setLoading(false);
      }
    }
  };

  const handleTakeQuiz = () => {
    navigate(`/quizzes/${id}/take`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!currentQuiz) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          Quiz not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="h1">
                {currentQuiz.title}
              </Typography>
              <Box>
                {user?.role === 'teacher' && (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleEdit}
                      sx={{ mr: 2 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleDelete}
                    >
                      Delete
                    </Button>
                  </>
                )}
                {user?.role === 'student' && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleTakeQuiz}
                  >
                    Take Quiz
                  </Button>
                )}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="body1" paragraph>
                {currentQuiz.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip
                  label={`Time Limit: ${currentQuiz.timeLimit} minutes`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`Questions: ${currentQuiz.questions.length}`}
                  color="secondary"
                  variant="outlined"
                />
                <Chip
                  label={`Created by: ${currentQuiz.createdBy?.username || 'Unknown'}`}
                  color="default"
                  variant="outlined"
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Questions
            </Typography>
            {currentQuiz.questions.map((question, index) => (
              <Paper key={index} sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Question {index + 1}
                </Typography>
                <Typography variant="body1" paragraph>
                  {question.text}
                </Typography>
                <Grid container spacing={2}>
                  {question.options.map((option, optionIndex) => (
                    <Grid item xs={12} key={optionIndex}>
                      <Typography
                        variant="body1"
                        sx={{
                          color: optionIndex === question.correctOption ? 'success.main' : 'text.primary',
                          fontWeight: optionIndex === question.correctOption ? 'bold' : 'normal',
                        }}
                      >
                        {optionIndex + 1}. {option.text}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            ))}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default QuizDetail; 