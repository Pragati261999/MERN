import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import theme from './theme';

// Layout Components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Quiz Components
import QuizList from './components/quiz/QuizList';
import QuizCreate from './components/quiz/QuizCreate';
import QuizEdit from './components/quiz/QuizEdit';
import QuizTake from './components/quiz/QuizTake';
import QuizResults from './components/quiz/QuizResults';

// Analytics Components
import UserAnalytics from './components/analytics/UserAnalytics';
import QuizAnalytics from './components/analytics/QuizAnalytics';

// Admin Components
import UserManagement from './components/admin/UserManagement';
import Dashboard from './components/admin/Dashboard';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<Layout />}>
              {/* Student Routes */}
              <Route path="/" element={<PrivateRoute roles={['student', 'teacher', 'admin']}><QuizList /></PrivateRoute>} />
              <Route path="/quiz/:id/take" element={<PrivateRoute roles={['student']}><QuizTake /></PrivateRoute>} />
              <Route path="/quiz/:id/results" element={<PrivateRoute roles={['student']}><QuizResults /></PrivateRoute>} />
              <Route path="/analytics/user" element={<PrivateRoute roles={['student']}><UserAnalytics /></PrivateRoute>} />

              {/* Teacher Routes */}
              <Route path="/quiz/create" element={<PrivateRoute roles={['teacher', 'admin']}><QuizCreate /></PrivateRoute>} />
              <Route path="/quiz/:id/edit" element={<PrivateRoute roles={['teacher', 'admin']}><QuizEdit /></PrivateRoute>} />
              <Route path="/analytics/quiz/:id" element={<PrivateRoute roles={['teacher', 'admin']}><QuizAnalytics /></PrivateRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<PrivateRoute roles={['admin']}><Dashboard /></PrivateRoute>} />
              <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><UserManagement /></PrivateRoute>} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
