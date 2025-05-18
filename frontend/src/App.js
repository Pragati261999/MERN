import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useSelector } from 'react-redux';

// Layout Components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Quiz Pages
import Dashboard from './pages/Dashboard';
import QuizList from './pages/quiz/QuizList';
import QuizForm from './pages/quiz/QuizForm';
import QuizDetail from './pages/quiz/QuizDetail';
import TakeQuiz from './pages/quiz/TakeQuiz';
import QuizResults from './pages/quiz/QuizResults';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import StudentQuizzes from './pages/student/StudentQuizzes';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          
          {/* Quiz Routes */}
          <Route path="quizzes">
            <Route index element={<QuizList />} />
            <Route path="create" element={<PrivateRoute roles={['teacher', 'admin']}><QuizForm /></PrivateRoute>} />
            <Route path=":id" element={<QuizDetail />} />
            <Route path=":id/edit" element={<PrivateRoute roles={['teacher', 'admin']}><QuizForm /></PrivateRoute>} />
            <Route path=":id/take" element={<PrivateRoute roles={['student']}><TakeQuiz /></PrivateRoute>} />
            <Route path=":id/results" element={<QuizResults />} />
          </Route>

          {/* Admin Routes */}
          <Route path="admin">
            <Route path="users" element={<PrivateRoute roles={['admin']}><UserManagement /></PrivateRoute>} />
          </Route>

          {/* Student Routes */}
          <Route path="student">
            <Route path="quizzes" element={<PrivateRoute roles={['student']}><StudentQuizzes /></PrivateRoute>} />
          </Route>
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
