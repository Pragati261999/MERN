const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  getUserAnalytics,
  getQuizAnalytics,
  getCategoryPerformance,
  getQuestionDifficulty,
  exportAnalytics
} = require('../controllers/analyticsController');

// User analytics routes
router.get('/user', auth, getUserAnalytics);
router.get('/user/categories', auth, getCategoryPerformance);
router.get('/user/export', auth, exportAnalytics);

// Quiz analytics routes (for teachers/admins)
router.get('/quiz/:quizId', auth, authorize('admin', 'teacher'), getQuizAnalytics);
router.get('/quiz/:quizId/questions', auth, authorize('admin', 'teacher'), getQuestionDifficulty);

module.exports = router; 