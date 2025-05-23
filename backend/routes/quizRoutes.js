const express = require('express');
const router = express.Router();
const { auth, authorize, checkOwnership } = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  startQuizAttempt,
  submitQuizAttempt,
  getQuizResults
} = require('../controllers/quizController');

// Quiz creation and management routes
router.post('/', auth, authorize('admin', 'teacher'), createQuiz);
router.get('/', auth, getQuizzes);
router.get('/:id', auth, getQuizById);
router.patch('/:id', auth, authorize('admin', 'teacher'), checkOwnership(Quiz), updateQuiz);
router.delete('/:id', auth, authorize('admin', 'teacher'), checkOwnership(Quiz), deleteQuiz);

// Quiz attempt routes
router.post('/:id/attempt', auth, authorize('student'), startQuizAttempt);
router.post('/attempt/:attemptId/submit', auth, authorize('student'), submitQuizAttempt);
router.get('/:id/results', auth, getQuizResults);

module.exports = router; 