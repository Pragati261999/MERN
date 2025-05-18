import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import { quizAPI } from '../../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentQuiz } from '../../store/slices/quizSlice';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentQuiz } = useSelector((state) => state.quiz);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await quizAPI.getQuiz(id);
        dispatch(setCurrentQuiz(response.data));
        setTimeLeft(response.data.timeLimit * 60); // Convert minutes to seconds
        setLoading(false);
      } catch (error) {
        setError('Failed to load quiz');
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, dispatch]);

  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (quizCompleted) return;

    try {
      setLoading(true);
      const response = await quizAPI.submitQuiz(id, {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer: parseInt(answer),
        })),
      });
      setQuizCompleted(true);
      navigate(`/quizzes/${id}/results`);
    } catch (error) {
      setError('Failed to submit quiz');
      setLoading(false);
    }
  };

  if (loading && !currentQuiz) {
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

  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              {currentQuiz.title}
            </Typography>
            <Typography variant="h6" color="primary">
              Time Left: {minutes}:{seconds.toString().padStart(2, '0')}
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
          <Typography variant="body1">
            Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {currentQuestion.text}
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={answers[currentQuestion._id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
            >
              {currentQuestion.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index.toString()}
                  control={<Radio />}
                  label={option.text}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="contained"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          {currentQuestionIndex === currentQuiz.questions.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading || quizCompleted}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Quiz'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default TakeQuiz; 