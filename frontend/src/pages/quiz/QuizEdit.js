import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  IconButton,
  Grid,
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { updateQuiz, setCurrentQuiz } from '../../store/slices/quizSlice';
import { quizAPI } from '../../services/api';

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string(),
  timeLimit: yup
    .number()
    .min(1, 'Time limit must be at least 1 minute')
    .required('Time limit is required'),
  passingScore: yup
    .number()
    .min(0, 'Passing score must be at least 0')
    .max(100, 'Passing score cannot exceed 100')
    .required('Passing score is required'),
  isPublished: yup.boolean(),
});

const QuizEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentQuiz, loading } = useSelector((state) => state.quiz);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizAPI.getQuiz(id);
        dispatch(setCurrentQuiz(response.data));
        setQuestions(response.data.questions);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        navigate('/quizzes');
      }
    };

    fetchQuiz();
  }, [id, dispatch, navigate]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: currentQuiz?.title || '',
      description: currentQuiz?.description || '',
      timeLimit: currentQuiz?.timeLimit || 30,
      passingScore: currentQuiz?.passingScore || 60,
      isPublished: currentQuiz?.isPublished || false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const quizData = {
          ...values,
          questions,
        };
        const response = await quizAPI.updateQuiz(id, quizData);
        dispatch(updateQuiz(response.data));
        navigate('/quizzes');
      } catch (error) {
        console.error('Error updating quiz:', error);
      }
    },
  });

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
        points: 1,
      },
    ]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
    };
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = {
      ...newQuestions[questionIndex].options[optionIndex],
      [field]: value,
    };
    setQuestions(newQuestions);
  };

  const handleAddOption = (questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push({
      text: '',
      isCorrect: false,
    });
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setQuestions(newQuestions);
  };

  if (loading || !currentQuiz) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Quiz
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Quiz Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="timeLimit"
                name="timeLimit"
                label="Time Limit (minutes)"
                type="number"
                value={formik.values.timeLimit}
                onChange={formik.handleChange}
                error={formik.touched.timeLimit && Boolean(formik.errors.timeLimit)}
                helperText={formik.touched.timeLimit && formik.errors.timeLimit}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="passingScore"
                name="passingScore"
                label="Passing Score (%)"
                type="number"
                value={formik.values.passingScore}
                onChange={formik.handleChange}
                error={formik.touched.passingScore && Boolean(formik.errors.passingScore)}
                helperText={formik.touched.passingScore && formik.errors.passingScore}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isPublished}
                    onChange={(e) => formik.setFieldValue('isPublished', e.target.checked)}
                  />
                }
                label="Publish Quiz"
              />
            </Grid>
          </Grid>

          {questions.map((question, questionIndex) => (
            <Paper
              key={questionIndex}
              elevation={2}
              sx={{ p: 2, mt: 3, position: 'relative' }}
            >
              <IconButton
                onClick={() => handleRemoveQuestion(questionIndex)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <DeleteIcon />
              </IconButton>
              <TextField
                fullWidth
                label={`Question ${questionIndex + 1}`}
                value={question.questionText}
                onChange={(e) =>
                  handleQuestionChange(questionIndex, 'questionText', e.target.value)
                }
                sx={{ mb: 2 }}
              />
              {question.options.map((option, optionIndex) => (
                <Box key={optionIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    fullWidth
                    label={`Option ${optionIndex + 1}`}
                    value={option.text}
                    onChange={(e) =>
                      handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)
                    }
                    sx={{ mr: 1 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={option.isCorrect}
                        onChange={(e) =>
                          handleOptionChange(
                            questionIndex,
                            optionIndex,
                            'isCorrect',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Correct"
                  />
                  <IconButton
                    onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                    disabled={question.options.length <= 2}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={() => handleAddOption(questionIndex)}
                startIcon={<AddIcon />}
                sx={{ mt: 1 }}
              >
                Add Option
              </Button>
            </Paper>
          ))}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handleAddQuestion}
              startIcon={<AddIcon />}
            >
              Add Question
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Update Quiz
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default QuizEdit; 