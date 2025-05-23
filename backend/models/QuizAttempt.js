const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  answer: mongoose.Schema.Types.Mixed, // Can be string, array, or object depending on question type
  isCorrect: Boolean,
  pointsEarned: Number,
  feedback: String
});

const quizAttemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [answerSchema],
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  score: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  ipAddress: String,
  userAgent: String,
  proctoringData: {
    browserSwitches: Number,
    tabSwitches: Number,
    suspiciousActivities: [{
      type: String,
      timestamp: Date
    }]
  }
}, {
  timestamps: true
});

// Calculate final score
quizAttemptSchema.methods.calculateScore = function() {
  this.score = this.answers.reduce((total, answer) => total + (answer.pointsEarned || 0), 0);
  return this.score;
};

// Check if attempt is within time limit
quizAttemptSchema.methods.isWithinTimeLimit = function(quizTimeLimit) {
  const timeSpent = (this.endTime - this.startTime) / 1000 / 60; // Convert to minutes
  return timeSpent <= quizTimeLimit;
};

// Index for better query performance
quizAttemptSchema.index({ quiz: 1, user: 1 });
quizAttemptSchema.index({ status: 1, createdAt: -1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = QuizAttempt; 