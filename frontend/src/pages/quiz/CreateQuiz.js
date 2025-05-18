import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { quizAPI } from '../../services/api';
import { addQuiz } from '../../store/slices/quizSlice';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  console.log("User:", user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    isPublished: false,
    questions: [
      {
        text: '',
        options: ['', ''],
        correctOption: 0,
      },
    ],
  });

  useEffect(() => {
    // Debug log to check user data
    console.log('Current user:', user);
    
    // Debug log to inspect quiz structure
    console.log('Initial quiz structure:', JSON.stringify(quiz, null, 2));
  }, [user, quiz]);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
    };
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...quiz.questions];
    // Ensure options are strings, not objects
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          text: '',
          options: ['', ''],
          correctOption: 0,
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = quiz.questions.filter((_, i) => i !== index);
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...quiz.questions];
    // Add an empty string, not an object
    newQuestions[questionIndex].options.push('');
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...quiz.questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    // Adjust correctOption if needed
    if (newQuestions[questionIndex].correctOption >= newQuestions[questionIndex].options.length) {
      newQuestions[questionIndex].correctOption = newQuestions[questionIndex].options.length - 1;
    }
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    // e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      console.log("User:", user);
      
      // Validate all fields are filled
      const hasEmptyFields = quiz.questions.some(question => 
        !question.text.trim() || 
        question.options.some(option => 
          (typeof option === 'string' && !option.trim()) || 
          (typeof option === 'object' && !option.text?.trim())
        ) ||
        question.correctOption === undefined
      );

      if (hasEmptyFields) {
        throw new Error('Please fill in all fields');
      }

      if (!user || !user._id) {
        throw new Error('User information is missing. Please log in again.');
      }

      // Format the questions based on the updated model schema
      const formattedQuestions = quiz.questions.map(question => {
        // Convert simple string options to objects with text and isCorrect properties
        const formattedOptions = question.options.map((option, index) => {
          if (typeof option === 'string') {
            return {
              text: option.trim(),
              isCorrect: index === question.correctOption
            };
          } else if (typeof option === 'object') {
            return {
              text: option.text.trim(),
              isCorrect: index === question.correctOption
            };
          }
        });

        return {
          text: question.text.trim(),
          options: formattedOptions,
          correctOption: question.correctOption
        };
      });

      // Prepare quiz data with the correct format and explicit createdBy
      const quizData = {
        title: quiz.title.trim(),
        description: quiz.description.trim(),
        timeLimit: quiz.timeLimit,
        isPublished: quiz.isPublished,
        createdBy: user.id,
        questions: formattedQuestions
      };

      console.log('User ID being sent:', user.id);
      console.log('Sending quiz data:', JSON.stringify(quizData, null, 2));

      const response = await quizAPI.createQuiz(quizData);
      dispatch(addQuiz(response.data));
      navigate('/quizzes');
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Quiz
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quiz Title"
                  value={quiz.title}
                  onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={quiz.description}
                  onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Time Limit (minutes)"
                  type="number"
                  value={quiz.timeLimit}
                  onChange={(e) => setQuiz({ ...quiz, timeLimit: parseInt(e.target.value) })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={quiz.isPublished}
                      onChange={(e) => setQuiz({ ...quiz, isPublished: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Publish Quiz"
                />
              </Grid>
            </Grid>

            {quiz.questions.map((question, questionIndex) => (
              <Box key={questionIndex} sx={{ mt: 4, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={11}>
                    <TextField
                      fullWidth
                      label={`Question ${questionIndex + 1}`}
                      value={question.text}
                      onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton
                      color="error"
                      onClick={() => removeQuestion(questionIndex)}
                      disabled={quiz.questions.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>

                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Options (click ✓ to mark correct answer)
                </Typography>

                <Grid container spacing={2}>
                  {question.options.map((option, optionIndex) => (
                    <Grid item xs={12} sm={6} key={optionIndex}>
                      <TextField
                        fullWidth
                        label={`Option ${optionIndex + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                        required
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              onClick={() => handleQuestionChange(questionIndex, 'correctOption', optionIndex)}
                              color={question.correctOption === optionIndex ? 'primary' : 'default'}
                            >
                              ✓
                            </IconButton>
                          ),
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => addOption(questionIndex)}
                  >
                    Add Option
                  </Button>
                  {question.options.length > 2 && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeOption(questionIndex, question.options.length - 1)}
                    >
                      Remove Last Option
                    </Button>
                  )}
                </Box>
              </Box>
            ))}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addQuestion}
              >
                Add Question
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Quiz'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateQuiz; 