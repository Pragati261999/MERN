import React, { useEffect } from 'react';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  fetchUserAnalytics,
  fetchUserCategoryAnalytics,
  exportAnalytics,
} from '../../store/slices/analyticsSlice';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const UserAnalytics = () => {
  const dispatch = useDispatch();
  const { userAnalytics, categoryAnalytics, loading, error } = useSelector(
    (state) => state.analytics
  );

  useEffect(() => {
    dispatch(fetchUserAnalytics());
    dispatch(fetchUserCategoryAnalytics());
  }, [dispatch]);

  const handleExport = () => {
    dispatch(exportAnalytics());
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

  if (!userAnalytics || !categoryAnalytics) {
    return null;
  }

  const quizPerformanceData = userAnalytics.quizPerformance.map((quiz) => ({
    name: quiz.title,
    score: quiz.score,
    timeTaken: quiz.timeTaken,
  }));

  const categoryData = categoryAnalytics.map((category) => ({
    name: category.name,
    value: category.averageScore,
  }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Your Analytics</Typography>
        <Button variant="contained" onClick={handleExport}>
          Export Analytics
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Overall Statistics */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Total Quizzes Taken
            </Typography>
            <Typography variant="h3" color="primary">
              {userAnalytics.totalQuizzes}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Average Score
            </Typography>
            <Typography variant="h3" color="primary">
              {userAnalytics.averageScore.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Total Time Spent
            </Typography>
            <Typography variant="h3" color="primary">
              {Math.floor(userAnalytics.totalTimeSpent / 60)}h
            </Typography>
            <Typography variant="body2">
              {userAnalytics.totalTimeSpent % 60}m
            </Typography>
          </Paper>
        </Grid>

        {/* Quiz Performance Chart */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quiz Performance
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="score"
                    name="Score (%)"
                    fill="#8884d8"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="timeTaken"
                    name="Time (minutes)"
                    fill="#82ca9d"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Category Performance Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance by Category
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {userAnalytics.recentActivity.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="subtitle1">{activity.quizTitle}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Score: {activity.score}% | Time: {activity.timeTaken} minutes
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(activity.date).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserAnalytics; 