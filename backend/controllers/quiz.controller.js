const Quiz = require("../models/Quiz");
const Result = require("../models/Result");

// Create a new quiz (teacher only)
exports.createQuiz = async (req, res) => {
  try {
    const quiz = new Quiz({
      ...req.body,
      createdBy: req.user._id
    });
    const validationError = quiz.validateSync();
    if (validationError) {
      return res.status(400).json({ error: validationError.message });
    }
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all quizzes (with role-based filtering)
exports.getQuizzes = async (req, res) => {
  try {
    let query = {};
    
    // Teachers can only see their own quizzes
    if (req.user.role === 'teacher') {
      query.teacher = req.user._id;
    }
    // Students can only see published quizzes
    else if (req.user.role === 'student') {
      query.isPublished = true;
    }

    const quizzes = await Quiz.find(query)
      .populate('teacher', 'username email')
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('teacher', 'username email');

      console.log("quizzz::  ",quiz);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }


    // Students can only access published quizzes
    if (req.user.role === 'student' && !quiz.isPublished) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Teachers can only access their own quizzes
    if (req.user.role === 'teacher' && quiz.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a quiz (teacher only)
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Only the teacher who created the quiz can update it
    if (quiz.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedQuiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a quiz (teacher or admin)
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Only the teacher who created the quiz or an admin can delete it
    if (quiz.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await quiz.remove();
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit quiz results (student only)
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, timeTaken } = req.body;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    answers.forEach((answer, index) => {
      if (quiz.questions[index].options[answer.selectedOption].isCorrect) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / totalQuestions) * 100;

    // Create result
    const result = new Result({
      student: req.user._id,
      quiz: quizId,
      score,
      totalQuestions,
      correctAnswers,
      timeTaken,
      answers
    });

    await result.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get quiz results
exports.getResults = async (req, res) => {
  try {
    let query = {};

    // Teachers can see results of their quizzes
    if (req.user.role === 'teacher') {
      const teacherQuizzes = await Quiz.find({ teacher: req.user._id }).select('_id');
      query.quiz = { $in: teacherQuizzes.map(q => q._id) };
    }
    // Students can only see their own results
    else if (req.user.role === 'student') {
      query.student = req.user._id;
    }

    const results = await Result.find(query)
      .populate('quiz', 'title')
      .populate('student', 'username')
      .sort({ completedAt: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};