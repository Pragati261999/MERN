import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  School as SchoolIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { setQuizzes, setResults } from '../store/slices/quizSlice';
import { quizAPI } from '../services/api';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { quizzes, results, loading } = useSelector((state) => state.quiz);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizzesResponse, resultsResponse] = await Promise.all([
          quizAPI.getQuizzes(),
          quizAPI.getResults(),
        ]);
        dispatch(setQuizzes(quizzesResponse.data));
        dispatch(setResults(resultsResponse.data));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, [dispatch]);

  const getStats = () => {
    const safeResults = Array.isArray(results) ? results : [];
    
    if (user.role === 'student') {
      return {
        totalQuizzes: quizzes.filter(q => q.isPublished).length,
        completedQuizzes: safeResults.length,
        averageScore: safeResults.length > 0
          ? (safeResults.reduce((acc, curr) => acc + curr.score, 0) / safeResults.length).toFixed(1)
          : 0,
      };
    } else if (user.role === 'teacher') {
      const teacherQuizzes = quizzes.filter(q => q.teacher === user._id);
      return {
        totalQuizzes: teacherQuizzes.length,
        publishedQuizzes: teacherQuizzes.filter(q => q.isPublished).length,
        totalStudents: new Set(safeResults.map(r => r.student)).size,
      };
    } else {
      return {
        totalQuizzes: quizzes.length,
        totalTeachers: new Set(quizzes.map(q => q.teacher)).size,
        totalStudents: new Set(safeResults.map(r => r.student)).size,
      };
    }
  };

  const stats = getStats();

  const StatCard = ({ title, value, icon }) => (
    <Grid item xs={12} sm={6} md={4}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {icon}
        <Typography variant="h4" component="div" sx={{ mt: 2 }}>
          {value}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {title}
        </Typography>
      </Paper>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {user.role === 'student' && (
          <>
            <StatCard
              title="Available Quizzes"
              value={stats.totalQuizzes}
              icon={<QuizIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
            />
            <StatCard
              title="Completed Quizzes"
              value={stats.completedQuizzes}
              icon={<SchoolIcon sx={{ fontSize: 40, color: 'success.main' }} />}
            />
            <StatCard
              title="Average Score"
              value={`${stats.averageScore}%`}
              icon={<PeopleIcon sx={{ fontSize: 40, color: 'info.main' }} />}
            />
          </>
        )}
        {user.role === 'teacher' && (
          <>
            <StatCard
              title="Total Quizzes"
              value={stats.totalQuizzes}
              icon={<QuizIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
            />
            <StatCard
              title="Published Quizzes"
              value={stats.publishedQuizzes}
              icon={<SchoolIcon sx={{ fontSize: 40, color: 'success.main' }} />}
            />
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon={<PeopleIcon sx={{ fontSize: 40, color: 'info.main' }} />}
            />
          </>
        )}
        {user.role === 'admin' && (
          <>
            <StatCard
              title="Total Quizzes"
              value={stats.totalQuizzes}
              icon={<QuizIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
            />
            <StatCard
              title="Total Teachers"
              value={stats.totalTeachers}
              icon={<SchoolIcon sx={{ fontSize: 40, color: 'success.main' }} />}
            />
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon={<PeopleIcon sx={{ fontSize: 40, color: 'info.main' }} />}
            />
          </>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard; 