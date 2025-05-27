import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetchQuizById, updateQuiz } from '../../store/slices/quizSlice';

const categories = [
  'Mathematics',
  'Science',
  'History',
  'Geography',
  'Literature',
  'Computer Science',
];

const questionTypes = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'true-false', label: 'True/False' },
  { value: 'short-answer', label: 'Short Answer' },
];

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  category: Yup.string().required('Category is required'),
  timeLimit: Yup.number()
    .min(1, 'Time limit must be at least 1 minute')
    .required('Time limit is required'),
  questions: Yup.array()
    .of(
      Yup.object({
        text: Yup.string().required('Question text is required'),
        type: Yup.string().required('Question type is required'),
        options: Yup.array().when('type', {
          is: 'multiple-choice',
          then: Yup.array()
            .min(2, 'At least 2 options are required')
            .required('Options are required'),
        }),
        correctAnswer: Yup.string().required('Correct answer is required'),
        points: Yup.number()
          .min(1, 'Points must be at least 1')
          .required('Points are required'),
      })
    )
    .min(1, 'At least one question is required')
    .required('Questions are required'),
});

const QuizEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentQuiz, loading, error } = useSelector((state) => state.quiz);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    dispatch(fetchQuizById(id));
  }, [dispatch, id]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: currentQuiz || {
      title: '',
      description: '',
      category: '',
      timeLimit: 30,
      questions: [
        {
          text: '',
          type: 'multiple-choice',
          options: ['', ''],
          correctAnswer: '',
          points: 1,
        },
      ],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(updateQuiz({ id, quizData: values })).unwrap();
        navigate('/');
      } catch (err) {
        setSubmitError(err.message || 'Failed to update quiz');
      }
    },
  });

  const addQuestion = () => {
    formik.setFieldValue('questions', [
      ...formik.values.questions,
      {
        text: '',
        type: 'multiple-choice',
        options: ['', ''],
        correctAnswer: '',
        points: 1,
      },
    ]);
  };

  const removeQuestion = (index) => {
    const questions = [...formik.values.questions];
    questions.splice(index, 1);
    formik.setFieldValue('questions', questions);
  };

  const addOption = (questionIndex) => {
    const questions = [...formik.values.questions];
    questions[questionIndex].options.push('');
    formik.setFieldValue('questions', questions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const questions = [...formik.values.questions];
    questions[questionIndex].options.splice(optionIndex, 1);
    formik.setFieldValue('questions', questions);
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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Quiz
        </Typography>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quiz Title"
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
                multiline
                rows={3}
                label="Description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={
                  formik.touched.description && Boolean(formik.errors.description)
                }
                helperText={
                  formik.touched.description && formik.errors.description
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.category && Boolean(formik.errors.category)
                  }
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Time Limit (minutes)"
                name="timeLimit"
                value={formik.values.timeLimit}
                onChange={formik.handleChange}
                error={
                  formik.touched.timeLimit && Boolean(formik.errors.timeLimit)
                }
                helperText={formik.touched.timeLimit && formik.errors.timeLimit}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Questions</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addQuestion}
                  variant="outlined"
                >
                  Add Question
                </Button>
              </Box>
            </Grid>

            {formik.values.questions.map((question, questionIndex) => (
              <Grid item xs={12} key={questionIndex}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1">
                      Question {questionIndex + 1}
                    </Typography>
                    <IconButton
                      color="error"
                      onClick={() => removeQuestion(questionIndex)}
                      disabled={formik.values.questions.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2}>
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

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Question Type</InputLabel>
                        <Select
                          name={`questions.${questionIndex}.type`}
                          value={question.type}
                          onChange={formik.handleChange}
                          label="Question Type"
                        >
                          {questionTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Points"
                        name={`questions.${questionIndex}.points`}
                        value={question.points}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.questions?.[questionIndex]?.points &&
                          Boolean(formik.errors.questions?.[questionIndex]?.points)
                        }
                        helperText={
                          formik.touched.questions?.[questionIndex]?.points &&
                          formik.errors.questions?.[questionIndex]?.points
                        }
                      />
                    </Grid>

                    {question.type === 'multiple-choice' && (
                      <>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Options
                          </Typography>
                          {question.options.map((option, optionIndex) => (
                            <Box
                              key={optionIndex}
                              sx={{ display: 'flex', gap: 1, mb: 1 }}
                            >
                              <TextField
                                fullWidth
                                label={`Option ${optionIndex + 1}`}
                                name={`questions.${questionIndex}.options.${optionIndex}`}
                                value={option}
                                onChange={formik.handleChange}
                              />
                              <IconButton
                                color="error"
                                onClick={() =>
                                  removeOption(questionIndex, optionIndex)
                                }
                                disabled={question.options.length === 2}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))}
                          <Button
                            startIcon={<AddIcon />}
                            onClick={() => addOption(questionIndex)}
                            variant="outlined"
                            size="small"
                            sx={{ mt: 1 }}
                          >
                            Add Option
                          </Button>
                        </Grid>

                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <InputLabel>Correct Answer</InputLabel>
                            <Select
                              name={`questions.${questionIndex}.correctAnswer`}
                              value={question.correctAnswer}
                              onChange={formik.handleChange}
                              label="Correct Answer"
                              error={
                                formik.touched.questions?.[questionIndex]
                                  ?.correctAnswer &&
                                Boolean(
                                  formik.errors.questions?.[questionIndex]
                                    ?.correctAnswer
                                )
                              }
                            >
                              {question.options.map((option, index) => (
                                <MenuItem key={index} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </>
                    )}

                    {question.type === 'true-false' && (
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Correct Answer</InputLabel>
                          <Select
                            name={`questions.${questionIndex}.correctAnswer`}
                            value={question.correctAnswer}
                            onChange={formik.handleChange}
                            label="Correct Answer"
                            error={
                              formik.touched.questions?.[questionIndex]
                                ?.correctAnswer &&
                              Boolean(
                                formik.errors.questions?.[questionIndex]
                                  ?.correctAnswer
                              )
                            }
                          >
                            <MenuItem value="true">True</MenuItem>
                            <MenuItem value="false">False</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}

                    {question.type === 'short-answer' && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Correct Answer"
                          name={`questions.${questionIndex}.correctAnswer`}
                          value={question.correctAnswer}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.questions?.[questionIndex]
                              ?.correctAnswer &&
                            Boolean(
                              formik.errors.questions?.[questionIndex]
                                ?.correctAnswer
                            )
                          }
                          helperText={
                            formik.touched.questions?.[questionIndex]
                              ?.correctAnswer &&
                            formik.errors.questions?.[questionIndex]?.correctAnswer
                          }
                        />
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Updating...' : 'Update Quiz'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default QuizEdit; 