import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { quizAPI } from '../../services/api';
import { setQuizzes, setResults } from '../../store/slices/quizSlice';

const StudentQuizzes = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { quizzes, results } = useSelector((state) => state.quiz);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quizzesData, resultsData] = await Promise.all([
          quizAPI.getQuizzes(),
          quizAPI.getResults(),
        ]);
        dispatch(setQuizzes(quizzesData));
        dispatch(setResults(resultsData || []));
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch quizzes');
        dispatch(setResults([]));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTakeQuiz = (quizId) => {
    navigate(`/quiz/${quizId}/take`);
  };

  const handleViewResults = (quizId) => {
    navigate(`/quiz/${quizId}/results`);
  };

  const getAvailableQuizzes = () => {
    const completedQuizIds = (results || []).map((result) => result.quiz._id);
    return (quizzes || []).filter(
      (quiz) =>
        quiz.isPublished &&
        !completedQuizIds.includes(quiz._id) &&
        quiz.assignedTo.includes(user._id)
    );
  };

  const getCompletedQuizzes = () => {
    const completedQuizIds = (results || []).map((result) => result.quiz._id);
    return (quizzes || []).filter(
      (quiz) =>
        quiz.isPublished &&
        completedQuizIds.includes(quiz._id) &&
        quiz.assignedTo.includes(user._id)
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const availableQuizzes = getAvailableQuizzes();
  const completedQuizzes = getCompletedQuizzes();

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Quizzes
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Available Quizzes" />
            <Tab label="Completed Quizzes" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <Grid container spacing={3}>
            {availableQuizzes.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">No available quizzes at the moment.</Alert>
              </Grid>
            ) : (
              availableQuizzes.map((quiz) => (
                <Grid item xs={12} sm={6} md={4} key={quiz._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {quiz.title}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        {quiz.description}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Time Limit: {quiz.timeLimit} minutes
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Questions: {quiz.questions.length}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleTakeQuiz(quiz._id)}
                      >
                        Take Quiz
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}

        {tabValue === 1 && (
          <Grid container spacing={3}>
            {completedQuizzes.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">No completed quizzes yet.</Alert>
              </Grid>
            ) : (
              completedQuizzes.map((quiz) => {
                const result = (results || []).find((r) => r.quiz._id === quiz._id);
                return (
                  <Grid item xs={12} sm={6} md={4} key={quiz._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {quiz.title}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                          {quiz.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Score: {result?.score || 0}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Time Taken: {result?.timeTaken || 0} minutes
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleViewResults(quiz._id)}
                        >
                          View Results
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default StudentQuizzes; 