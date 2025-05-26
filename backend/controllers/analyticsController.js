const Analytics = require('../models/Analytics');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// Get user analytics
const getUserAnalytics = async (req, res) => {
  try {
    const analytics = await Analytics.find({ user: req.user._id })
      .populate('quiz', 'title category')
      .sort({ lastUpdated: -1 });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get quiz analytics (for teachers/admins)
const getQuizAnalytics = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    // Check if user has permission to view analytics
    if (req.user.role !== 'admin' && 
        quiz.creator.toString() !== req.user._id.toString() && 
        !quiz.collaborators.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to view quiz analytics.' });
    }

    const analytics = await Analytics.find({ quiz: quiz._id })
      .populate('user', 'firstName lastName')
      .sort({ 'userPerformance.averageScore': -1 });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get category performance
const getCategoryPerformance = async (req, res) => {
  try {
    const analytics = await Analytics.find({ user: req.user._id });
    
    const categoryStats = analytics.reduce((acc, curr) => {
      curr.categoryPerformance.forEach(cat => {
        if (!acc[cat.category]) {
          acc[cat.category] = {
            totalAttempts: 0,
            totalScore: 0,
            averageScore: 0
          };
        }
        acc[cat.category].totalAttempts += cat.totalAttempts;
        acc[cat.category].totalScore += cat.averageScore * cat.totalAttempts;
      });
    }, {});

    // Calculate averages
    Object.keys(categoryStats).forEach(category => {
      categoryStats[category].averageScore = 
        categoryStats[category].totalScore / categoryStats[category].totalAttempts;
    });

    res.json(categoryStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get question difficulty analysis
const getQuestionDifficulty = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    // Check if user has permission
    if (req.user.role !== 'admin' && 
        quiz.creator.toString() !== req.user._id.toString() && 
        !quiz.collaborators.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to view question analytics.' });
    }

    const analytics = await Analytics.find({ quiz: quiz._id });
    
    const questionStats = quiz.questions.map(question => {
      const stats = analytics.reduce((acc, curr) => {
        const questionStat = curr.questionStats.find(
          stat => stat.question.toString() === question._id.toString()
        );
        if (questionStat) {
          acc.totalAttempts += questionStat.totalAttempts;
          acc.correctAttempts += questionStat.correctAttempts;
          acc.totalTimeSpent += questionStat.averageTimeSpent * questionStat.totalAttempts;
        }
        return acc;
      }, { totalAttempts: 0, correctAttempts: 0, totalTimeSpent: 0 });

      return {
        questionId: question._id,
        question: question.question,
        difficulty: question.difficulty,
        totalAttempts: stats.totalAttempts,
        correctRate: stats.totalAttempts > 0 ? 
          (stats.correctAttempts / stats.totalAttempts) * 100 : 0,
        averageTimeSpent: stats.totalAttempts > 0 ? 
          stats.totalTimeSpent / stats.totalAttempts : 0
      };
    });

    res.json(questionStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export analytics data
const exportAnalytics = async (req, res) => {
  try {
    const { format, startDate, endDate } = req.query;
    const query = { user: req.user._id };
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const analytics = await Analytics.find(query)
      .populate('quiz', 'title category')
      .populate('user', 'firstName lastName');

    let data;
    switch (format) {
      case 'csv':
        data = convertToCSV(analytics);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
        break;
      case 'json':
        data = JSON.stringify(analytics, null, 2);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=analytics.json');
        break;
      default:
        return res.status(400).json({ error: 'Invalid format specified.' });
    }

    res.send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to convert analytics to CSV
const convertToCSV = (analytics) => {
  const headers = [
    'Quiz Title',
    'Category',
    'Total Attempts',
    'Average Score',
    'Highest Score',
    'Total Time Spent',
    'Last Updated'
  ].join(',');

  const rows = analytics.map(analytics => [
    analytics.quiz.title,
    analytics.quiz.category,
    analytics.userPerformance.totalQuizzesTaken,
    analytics.userPerformance.averageScore,
    analytics.userPerformance.highestScore,
    analytics.userPerformance.timeSpent,
    analytics.lastUpdated
  ].join(','));

  return [headers, ...rows].join('\n');
};

module.exports = {
  getUserAnalytics,
  getQuizAnalytics,
  getCategoryPerformance,
  getQuestionDifficulty,
  exportAnalytics
}; 