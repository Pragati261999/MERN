import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
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
  fetchDashboardStats,
  fetchRecentActivity,
} from '../../store/slices/analyticsSlice';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, recentActivity, loading, error } = useSelector(
    (state) => state.analytics
  );

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchRecentActivity());
  }, [dispatch]);

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography color="text.secondary" gutterBottom>
              Total Users
            </Typography>
            <Typography component="p" variant="h4">
              {stats?.totalUsers || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography color="text.secondary" gutterBottom>
              Total Quizzes
            </Typography>
            <Typography component="p" variant="h4">
              {stats?.totalQuizzes || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography color="text.secondary" gutterBottom>
              Total Attempts
            </Typography>
            <Typography component="p" variant="h4">
              {stats?.totalAttempts || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography color="text.secondary" gutterBottom>
              Average Score
            </Typography>
            <Typography component="p" variant="h4">
              {stats?.averageScore
                ? `${(stats.averageScore * 100).toFixed(1)}%`
                : '0%'}
            </Typography>
          </Paper>
        </Grid>

        {/* Quiz Performance Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quiz Performance
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.quizPerformance || []}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="attempts"
                    name="Attempts"
                    fill="#8884d8"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="averageScore"
                    name="Average Score"
                    fill="#82ca9d"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Category Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.categoryDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {(stats?.categoryDistribution || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {recentActivity?.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 1,
                    borderBottom:
                      index < recentActivity.length - 1
                        ? '1px solid #eee'
                        : 'none',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {new Date(activity.timestamp).toLocaleString()}
                  </Typography>
                  <Typography variant="body1">{activity.description}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 