const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq', 'true_false', 'short_answer', 'essay', 'image_based'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: String,
  explanation: String,
  points: {
    type: Number,
    default: 1
  },
  imageUrl: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  settings: {
    timeLimit: {
      type: Number, // in minutes
      default: 30
    },
    randomizeQuestions: {
      type: Boolean,
      default: false
    },
    randomizeOptions: {
      type: Boolean,
      default: false
    },
    showResults: {
      type: Boolean,
      default: true
    },
    passingScore: {
      type: Number,
      default: 60
    },
    attemptsAllowed: {
      type: Number,
      default: 1
    }
  },
  category: {
    type: String,
    required: true
  },
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  analytics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    difficultyRating: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for better search performance
quizSchema.index({ title: 'text', description: 'text', category: 'text', tags: 'text' });

// Method to calculate quiz statistics
quizSchema.methods.calculateStats = async function() {
  const QuizAttempt = mongoose.model('QuizAttempt');
  const attempts = await QuizAttempt.find({ quiz: this._id });
  
  this.analytics.totalAttempts = attempts.length;
  this.analytics.averageScore = attempts.length > 0 
    ? attempts.reduce((acc, attempt) => acc + attempt.score, 0) / attempts.length 
    : 0;
  
  await this.save();
};

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz; 