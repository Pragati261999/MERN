const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
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
  questionStats: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    totalAttempts: {
      type: Number,
      default: 0
    },
    correctAttempts: {
      type: Number,
      default: 0
    },
    averageTimeSpent: {
      type: Number,
      default: 0
    },
    difficultyRating: {
      type: Number,
      default: 0
    }
  }],
  userPerformance: {
    totalQuizzesTaken: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    highestScore: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0
    },
    improvementRate: {
      type: Number,
      default: 0
    }
  },
  categoryPerformance: [{
    category: {
      type: String,
      required: true
    },
    averageScore: {
      type: Number,
      default: 0
    },
    totalAttempts: {
      type: Number,
      default: 0
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
analyticsSchema.index({ quiz: 1, user: 1 });
analyticsSchema.index({ 'userPerformance.totalQuizzesTaken': -1 });
analyticsSchema.index({ 'userPerformance.averageScore': -1 });

// Method to update question statistics
analyticsSchema.methods.updateQuestionStats = async function(questionId, isCorrect, timeSpent) {
  const questionStat = this.questionStats.find(stat => stat.question.toString() === questionId.toString());
  
  if (questionStat) {
    questionStat.totalAttempts += 1;
    if (isCorrect) questionStat.correctAttempts += 1;
    questionStat.averageTimeSpent = (questionStat.averageTimeSpent * (questionStat.totalAttempts - 1) + timeSpent) / questionStat.totalAttempts;
  } else {
    this.questionStats.push({
      question: questionId,
      totalAttempts: 1,
      correctAttempts: isCorrect ? 1 : 0,
      averageTimeSpent: timeSpent
    });
  }
  
  await this.save();
};

// Method to update user performance
analyticsSchema.methods.updateUserPerformance = async function(score, timeSpent) {
  this.userPerformance.totalQuizzesTaken += 1;
  this.userPerformance.averageScore = (this.userPerformance.averageScore * (this.userPerformance.totalQuizzesTaken - 1) + score) / this.userPerformance.totalQuizzesTaken;
  this.userPerformance.highestScore = Math.max(this.userPerformance.highestScore, score);
  this.userPerformance.timeSpent += timeSpent;
  
  await this.save();
};

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics; 