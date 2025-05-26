import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  fetchQuizAnalytics,
  fetchQuizQuestionAnalytics,
} from '../../store/slices/analyticsSlice';

const QuizAnalytics = () => {
  const { quizId } = useParams();
  const dispatch = useDispatch();
  const { quizAnalytics, questionAnalytics, loading, error } = useSelector(
    (state) => state.analytics
  );

  useEffect(() => {
    dispatch(fetchQuizAnalytics(quizId));
    dispatch(fetchQuizQuestionAnalytics(quizId));
  }, [dispatch, quizId]);

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

  if (!quizAnalytics || !questionAnalytics) {
    return null;
  }

  const scoreDistributionData = quizAnalytics.scoreDistribution.map((item) => ({
    range: `${item.min}-${item.max}%`,
    count: item.count,
  }));

  const timeDistributionData = quizAnalytics.timeDistribution.map((item) => ({
    range: `${item.min}-${item.max} min`,
    count: item.count,
  }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Quiz Analytics: {quizAnalytics.title}
      </Typography>

      <Grid container spacing={3}>
        {/* Overall Statistics */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Total Attempts
            </Typography>
            <Typography variant="h3" color="primary">
              {quizAnalytics.totalAttempts}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Average Score
            </Typography>
            <Typography variant="h3" color="primary">
              {quizAnalytics.averageScore.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Average Time
            </Typography>
            <Typography variant="h3" color="primary">
              {quizAnalytics.averageTime.toFixed(1)}
            </Typography>
            <Typography variant="body2">minutes</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Completion Rate
            </Typography>
            <Typography variant="h3" color="primary">
              {quizAnalytics.completionRate.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>

        {/* Score Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Score Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Number of Students" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Time Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Time Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Number of Students"
                    stroke="#8884d8"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Question Analysis */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Question Analysis
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Question</TableCell>
                    <TableCell align="right">Type</TableCell>
                    <TableCell align="right">Correct Rate</TableCell>
                    <TableCell align="right">Average Time</TableCell>
                    <TableCell align="right">Difficulty</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {questionAnalytics.map((question, index) => (
                    <TableRow key={index}>
                      <TableCell>{question.text}</TableCell>
                      <TableCell align="right">{question.type}</TableCell>
                      <TableCell align="right">
                        {question.correctRate.toFixed(1)}%
                      </TableCell>
                      <TableCell align="right">
                        {question.averageTime.toFixed(1)}s
                      </TableCell>
                      <TableCell align="right">{question.difficulty}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default QuizAnalytics; 