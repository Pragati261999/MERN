import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container,Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Chip,
} from '@mui/material';
import { setQuizzes } from '../../store/slices/quizSlice';
import { quizAPI } from '../../services/api';

const QuizList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  console.log("user : ",user);
  const { quizzes, loading } = useSelector((state) => state.quiz);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await quizAPI.getQuizzes();
        console.log('response:', response);
        dispatch(setQuizzes(response.data));
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    fetchQuizzes();
  }, [dispatch]);

  const handleEdit = (quizId) => {
    navigate(`/quizzes/${quizId}/edit`);
  };

  const handleDelete = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await quizAPI.deleteQuiz(quizId);
        dispatch(setQuizzes(quizzes.filter(quiz => quiz._id !== quizId)));
      } catch (error) {
        console.error('Error deleting quiz:', error);
      }
    }
  };

  const handleTakeQuiz = (quizId) => {
    navigate(`/quizzes/${quizId}/take`);
  };

  const handleViewResults = (quizId) => {
    navigate(`/quizzes/${quizId}/results`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quizzes
        </Typography>
        {(user.role === 'teacher' || user.role === 'admin') && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/quizzes/create')}
          >
            Create Quiz
          </Button>
        )}
      </Box>
      <Grid container spacing={3}>
        {quizzes.map((quiz) => (
          <Grid item xs={12} sm={6} md={4} key={quiz._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  {quiz.title}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {quiz.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={quiz.isPublished ? 'Published' : 'Draft'}
                    color={quiz.isPublished ? 'success' : 'default'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`${quiz.timeLimit} min`}
                    color="info"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`${quiz.questions.length} questions`}
                    color="secondary"
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Created by: {quiz.teacher?.username}
                </Typography>
              </CardContent>
              <CardActions>
                {user.role === 'student' && quiz.isPublished && (
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleTakeQuiz(quiz._id)}
                  >
                    Take Quiz
                  </Button>
                )}
                {(user.role === 'teacher' || user.role === 'admin') && (
                  <>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(quiz._id)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(quiz._id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
                {(user.role === 'teacher' || user.role === 'admin') && (
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => handleViewResults(quiz._id)}
                  >
                    View Results
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default QuizList; 