import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { fetchQuizById } from '../../store/slices/quizSlice';

const QuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentQuiz, loading, error, submissionResult } = useSelector(
    (state) => state.quiz
  );

  useEffect(() => {
    dispatch(fetchQuizById(id));
  }, [dispatch, id]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
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

  if (!currentQuiz || !submissionResult) {
    return null;
  }

  const calculateScore = () => {
    const totalPoints = currentQuiz.questions.reduce(
      (sum, question) => sum + question.points,
      0
    );
    const earnedPoints = submissionResult.answers.reduce((sum, answer) => {
      const question = currentQuiz.questions.find((q) => q._id === answer.questionId);
      return sum + (answer.isCorrect ? question.points : 0);
    }, 0);
    return {
      earned: earnedPoints,
      total: totalPoints,
      percentage: (earnedPoints / totalPoints) * 100,
    };
  };

  const score = calculateScore();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Quiz Results
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {currentQuiz.title}
        </Typography>

        <Box sx={{ my: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'primary.main',
                  color: 'white',
                }}
              >
                <Typography variant="h6">Score</Typography>
                <Typography variant="h3">
                  {score.percentage.toFixed(1)}%
                </Typography>
                <Typography variant="body2">
                  {score.earned} out of {score.total} points
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6">Correct Answers</Typography>
                <Typography variant="h3" color="success.main">
                  {submissionResult.answers.filter((a) => a.isCorrect).length}
                </Typography>
                <Typography variant="body2">
                  out of {currentQuiz.questions.length} questions
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6">Time Taken</Typography>
                <Typography variant="h3">
                  {Math.floor(submissionResult.timeTaken / 60)}:
                  {(submissionResult.timeTaken % 60)
                    .toString()
                    .padStart(2, '0')}
                </Typography>
                <Typography variant="body2">minutes</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" gutterBottom>
          Question Review
        </Typography>

        <List>
          {currentQuiz.questions.map((question, index) => {
            const answer = submissionResult.answers.find(
              (a) => a.questionId === question._id
            );
            return (
              <Paper
                key={question._id}
                elevation={1}
                sx={{ mb: 2, p: 2 }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1">
                    Question {index + 1}
                  </Typography>
                  <Chip
                    icon={answer.isCorrect ? <CheckCircleIcon /> : <CancelIcon />}
                    label={answer.isCorrect ? 'Correct' : 'Incorrect'}
                    color={answer.isCorrect ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                <Typography variant="body1" gutterBottom>
                  {question.text}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Your Answer:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {answer.userAnswer}
                  </Typography>
                  {!answer.isCorrect && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">
                        Correct Answer:
                      </Typography>
                      <Typography variant="body2">
                        {question.correctAnswer}
                      </Typography>
                    </>
                  )}
                </Box>
              </Paper>
            );
          })}
        </List>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
          >
            Back to Quizzes
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default QuizResults; 