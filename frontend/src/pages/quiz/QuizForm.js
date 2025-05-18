import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { quizAPI } from '../../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentQuiz } from '../../store/slices/quizSlice';

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  timeLimit: Yup.number()
    .required('Time limit is required')
    .min(1, 'Time limit must be at least 1 minute')
    .max(120, 'Time limit cannot exceed 120 minutes'),
  questions: Yup.array().of(
    Yup.object().shape({
      text: Yup.string().required('Question text is required'),
      options: Yup.array().of(
        Yup.object().shape({
          text: Yup.string().required('Option text is required'),
          isCorrect: Yup.boolean(),
        })
      ).min(2, 'At least 2 options are required'),
      correctOption: Yup.number()
        .required('Correct option is required')
        .min(0, 'Invalid option')
        .test('is-valid-option', 'Invalid correct option', function(value) {
          return value < this.parent.options.length;
        }),
    })
  ).min(1, 'At least 1 question is required'),
});

const QuizForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentQuiz } = useSelector((state) => state.quiz);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
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
    }
  }, [id, dispatch]);

  const formik = useFormik({
    initialValues: {
      title: currentQuiz?.title || '',
      description: currentQuiz?.description || '',
      timeLimit: currentQuiz?.timeLimit || 30,
      questions: currentQuiz?.questions || [
        {
          text: '',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ],
          correctOption: 0,
        },
      ],
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        if (id) {
          await quizAPI.updateQuiz(id, values);
        } else {
          await quizAPI.createQuiz(values);
        }
        navigate('/quizzes');
      } catch (error) {
        setError('Failed to save quiz');
        setLoading(false);
      }
    },
  });

  const handleAddQuestion = () => {
    formik.setFieldValue('questions', [
      ...formik.values.questions,
      {
        text: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
        correctOption: 0,
      },
    ]);
  };

  const handleRemoveQuestion = (index) => {
    const questions = [...formik.values.questions];
    questions.splice(index, 1);
    formik.setFieldValue('questions', questions);
  };

  const handleAddOption = (questionIndex) => {
    const questions = [...formik.values.questions];
    questions[questionIndex].options.push({ text: '', isCorrect: false });
    formik.setFieldValue('questions', questions);
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const questions = [...formik.values.questions];
    questions[questionIndex].options.splice(optionIndex, 1);
    formik.setFieldValue('questions', questions);
  };

  if (loading && !formik.values.title) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {id ? 'Edit Quiz' : 'Create Quiz'}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={formik.handleSubmit}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Time Limit (minutes)"
                  name="timeLimit"
                  type="number"
                  value={formik.values.timeLimit}
                  onChange={formik.handleChange}
                  error={formik.touched.timeLimit && Boolean(formik.errors.timeLimit)}
                  helperText={formik.touched.timeLimit && formik.errors.timeLimit}
                />
              </Grid>
            </Grid>
          </Paper>

          {formik.values.questions.map((question, questionIndex) => (
            <Paper key={questionIndex} sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Question {questionIndex + 1}</Typography>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveQuestion(questionIndex)}
                      disabled={formik.values.questions.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Question Text"
                    name={`questions.${questionIndex}.text`}
                    value={question.text}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.questions?.[questionIndex]?.text &&
                      Boolean(formik.errors.questions?.[questionIndex]?.text)
                    }
                    helperText={
                      formik.touched.questions?.[questionIndex]?.text &&
                      formik.errors.questions?.[questionIndex]?.text
                    }
                  />
                </Grid>
                {question.options.map((option, optionIndex) => (
                  <Grid item xs={12} key={optionIndex}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        label={`Option ${optionIndex + 1}`}
                        name={`questions.${questionIndex}.options.${optionIndex}.text`}
                        value={option.text}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.questions?.[questionIndex]?.options?.[optionIndex]?.text &&
                          Boolean(formik.errors.questions?.[questionIndex]?.options?.[optionIndex]?.text)
                        }
                        helperText={
                          formik.touched.questions?.[questionIndex]?.options?.[optionIndex]?.text &&
                          formik.errors.questions?.[questionIndex]?.options?.[optionIndex]?.text
                        }
                      />
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                        disabled={question.options.length === 2}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    onClick={() => handleAddOption(questionIndex)}
                    sx={{ mr: 2 }}
                  >
                    Add Option
                  </Button>
                  <TextField
                    select
                    label="Correct Option"
                    name={`questions.${questionIndex}.correctOption`}
                    value={question.correctOption}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.questions?.[questionIndex]?.correctOption &&
                      Boolean(formik.errors.questions?.[questionIndex]?.correctOption)
                    }
                    helperText={
                      formik.touched.questions?.[questionIndex]?.correctOption &&
                      formik.errors.questions?.[questionIndex]?.correctOption
                    }
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {question.options.map((_, index) => (
                      <option key={index} value={index}>
                        Option {index + 1}
                      </option>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
          ))}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddQuestion}
              sx={{ mr: 2 }}
            >
              Add Question
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Quiz'}
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default QuizForm; 