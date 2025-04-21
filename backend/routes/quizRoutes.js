const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const auth = require('../middleware/auth');

// Get all quizzes
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // If user is a student, only show published quizzes assigned to them
    if (req.user.role === 'student') {
      query = {
        isPublished: true,
        assignedTo: req.user.id
      };
    }
    
    const quizzes = await Quiz.find(query)
      .populate('createdBy', 'username')
      .populate('assignedTo', 'username')
      .sort({ createdAt: -1 });
      
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single quiz
router.get('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('assignedTo', 'username');
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Allow access if:
    // 1. User is admin
    // 2. User is the creator of the quiz
    // 3. User is a student and quiz is published and assigned to them
    if (
      req.user.role === 'admin' ||
      quiz.createdBy._id.toString() === req.user.id ||
      (req.user.role === 'student' && 
       quiz.isPublished && 
       quiz.assignedTo.some(student => student._id.toString() === req.user.id))
    ) {
      return res.json(quiz);
    }

    res.status(403).json({ message: 'Access denied' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new quiz
router.post('/', auth, async (req, res) => {
  try {
    // Only teachers and admins can create quizzes
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const quiz = new Quiz({
      ...req.body,
      createdBy: req.user.id,
    });

    const newQuiz = await quiz.save();
    res.status(201).json(newQuiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a quiz
router.put('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Only allow the creator or admin to update
    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('createdBy', 'username');

    res.json(updatedQuiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a quiz
router.delete('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Only allow the creator or admin to delete
    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await quiz.remove();
    res.json({ message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit quiz results
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Only students can submit quiz results
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if student is assigned to this quiz
    if (!quiz.assignedTo.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not assigned to this quiz' });
    }

    // Calculate score
    let score = 0;
    const answers = req.body.answers;
    
    for (let i = 0; i < quiz.questions.length; i++) {
      if (answers[i] === quiz.questions[i].correctOption) {
        score++;
      }
    }

    score = (score / quiz.questions.length) * 100;

    const result = new Result({
      quiz: quiz._id,
      user: req.user.id,
      answers: req.body.answers,
      score,
      timeTaken: req.body.timeTaken,
    });

    const savedResult = await result.save();
    res.status(201).json(savedResult);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get quiz results
router.get('/:id/results', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Allow access if:
    // 1. User is admin
    // 2. User is the creator of the quiz
    // 3. User is the student who took the quiz
    const results = await Result.find({ quiz: quiz._id })
      .populate('user', 'username');

    const filteredResults = results.filter(result => 
      req.user.role === 'admin' ||
      quiz.createdBy.toString() === req.user.id ||
      result.user._id.toString() === req.user.id
    );

    res.json(filteredResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 