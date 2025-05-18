import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Grid,
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { setCurrentQuiz, setResults } from '../../store/slices/quizSlice';
import { quizAPI } from '../../services/api';

const QuizResults = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentQuiz, results, loading } = useSelector((state) => state.quiz);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizResponse, resultsResponse] = await Promise.all([
          quizAPI.getQuiz(id),
          quizAPI.getResults(id),
        ]);
        dispatch(setCurrentQuiz(quizResponse.data));
        dispatch(setResults(resultsResponse.data));
      } catch (error) {
        console.error('Error fetching results:', error);
        setError('Failed to load quiz results. Please try again later.');
      }
    };

    fetchData();
  }, [id, dispatch]);

  if (loading || !currentQuiz || !results) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const result = results[0]; // Assuming we're showing the most recent result
  const score = (result.correctAnswers / currentQuiz.questions.length) * 100;
  const passed = score >= currentQuiz.passingScore;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Quiz Results
          </Typography>
          <Typography variant="h5" gutterBottom>
            {currentQuiz.title}
          </Typography>
          <Chip
            label={passed ? 'Passed' : 'Failed'}
            color={passed ? 'success' : 'error'}
            sx={{ fontSize: '1.2rem', p: 2, mb: 2 }}
          />
          <Typography variant="h3" color={passed ? 'success.main' : 'error.main'}>
            {score.toFixed(1)}%
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Correct Answers</Typography>
              <Typography variant="h4">{result.correctAnswers}</Typography>
              <Typography variant="body2">out of {currentQuiz.questions.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Time Taken</Typography>
              <Typography variant="h4">{formatTime(result.timeTaken)}</Typography>
              <Typography variant="body2">out of {currentQuiz.timeLimit} minutes</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Passing Score</Typography>
              <Typography variant="h4">{currentQuiz.passingScore}%</Typography>
              <Typography variant="body2">Required to pass</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Question Review
        </Typography>
        <List>
          {currentQuiz.questions.map((question, index) => {
            const userAnswer = result.answers[question._id];
            const isCorrect = userAnswer === question.options.find(opt => opt.isCorrect)?._id;

            return (
              <React.Fragment key={question._id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isCorrect ? (
                          <CheckIcon color="success" />
                        ) : (
                          <CloseIcon color="error" />
                        )}
                        <Typography variant="subtitle1">
                          Question {index + 1}: {question.questionText}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Your answer:{' '}
                          {question.options.find(opt => opt._id === userAnswer)?.text}
                        </Typography>
                        {!isCorrect && (
                          <Typography variant="body2" color="success.main">
                            Correct answer:{' '}
                            {question.options.find(opt => opt.isCorrect)?.text}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < currentQuiz.questions.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
      </Paper>
    </Container>
  );
};

export default QuizResults; 