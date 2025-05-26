import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Box,
  Chip,
  CircularProgress,
  Alert,
  MenuItem,
} from '@mui/material';
import { fetchQuizzes } from '../../store/slices/quizSlice';

const categories = [
  'All',
  'Mathematics',
  'Science',
  'History',
  'Geography',
  'Literature',
  'Computer Science',
];

const QuizList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { quizzes, loading, error } = useSelector((state) => state.quiz);
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || quiz.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuizClick = (quizId) => {
    if (user.role === 'student') {
      navigate(`/quiz/${quizId}/take`);
    } else {
      navigate(`/quiz/${quizId}/edit`);
    }
  };

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
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Quizzes"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {user.role !== 'student' && (
        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/quiz/create')}
          >
            Create New Quiz
          </Button>
        </Box>
      )}

      <Grid container spacing={3}>
        {filteredQuizzes.map((quiz) => (
          <Grid item xs={12} sm={6} md={4} key={quiz._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 6,
                  cursor: 'pointer',
                },
              }}
              onClick={() => handleQuizClick(quiz._id)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {quiz.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {quiz.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={quiz.category}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`${quiz.questions.length} Questions`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`${quiz.timeLimit} minutes`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  {user.role === 'student' ? 'Take Quiz' : 'Edit Quiz'}
                </Button>
                {user.role !== 'student' && (
                  <Button
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/analytics/quiz/${quiz._id}`);
                    }}
                  >
                    View Analytics
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