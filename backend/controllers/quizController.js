const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// Create new quiz
const createQuiz = async (req, res) => {
  try {
    const quiz = new Quiz({
      ...req.body,
      creator: req.user._id
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all quizzes (with filters)
const getQuizzes = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$text = { $search: search };
    }

    // If not admin, only show published quizzes
    if (req.user.role !== 'admin') {
      query.status = 'published';
    }

    const quizzes = await Quiz.find(query)
      .populate('creator', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get quiz by ID
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('creator', 'firstName lastName')
      .populate('collaborators', 'firstName lastName');

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update quiz
const updateQuiz = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'description', 'questions', 'settings', 'category', 'tags', 'status'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates.' });
  }

  try {
    updates.forEach(update => req.resource[update] = req.body[update]);
    await req.resource.save();
    res.json(req.resource);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete quiz
const deleteQuiz = async (req, res) => {
  try {
    await req.resource.remove();
    res.json({ message: 'Quiz deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Start quiz attempt
const startQuizAttempt = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    // Check if user has already reached attempt limit
    const attempts = await QuizAttempt.countDocuments({
      quiz: quiz._id,
      user: req.user._id,
      status: 'completed'
    });

    if (attempts >= quiz.settings.attemptsAllowed) {
      return res.status(400).json({ error: 'Maximum attempts reached for this quiz.' });
    }

    const attempt = new QuizAttempt({
      quiz: quiz._id,
      user: req.user._id,
      startTime: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    await attempt.save();
    res.status(201).json(attempt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Submit quiz attempt
const submitQuizAttempt = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.attemptId);
    if (!attempt) {
      return res.status(404).json({ error: 'Quiz attempt not found.' });
    }

    if (attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to submit this attempt.' });
    }

    const quiz = await Quiz.findById(attempt.quiz);
    
    // Grade answers
    attempt.answers = req.body.answers.map(answer => {
      const question = quiz.questions.id(answer.question);
      const isCorrect = gradeAnswer(answer, question);
      return {
        ...answer,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0
      };
    });

    attempt.endTime = new Date();
    attempt.status = 'completed';
    attempt.timeSpent = (attempt.endTime - attempt.startTime) / 1000;
    attempt.calculateScore();

    await attempt.save();
    
    // Update quiz analytics
    await quiz.calculateStats();

    res.json(attempt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get quiz results
const getQuizResults = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      quiz: req.params.id,
      user: req.user._id
    }).sort({ createdAt: -1 });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to grade answers
const gradeAnswer = (answer, question) => {
  switch (question.type) {
    case 'mcq':
      return answer.answer === question.correctAnswer;
    case 'true_false':
      return answer.answer === question.correctAnswer;
    case 'short_answer':
      return answer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
    case 'essay':
      // Essay questions need manual grading
      return null;
    default:
      return false;
  }
};

module.exports = {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  startQuizAttempt,
  submitQuizAttempt,
  getQuizResults
}; 