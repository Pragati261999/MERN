const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timeLimit: {
    type: Number,
    required: true,
    default: 30
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  questions: [{
    text: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function(v) {
          return v.length >= 2 && v.every(option => option.trim().length > 0);
        },
        message: 'Each question must have at least 2 non-empty options'
      }
    },
    correctOption: {
      type: Number,
      required: true,
      validate: {
        validator: function(v) {
          return v >= 0 && v < this.options.length;
        },
        message: 'Correct option must be a valid index in the options array'
      }
    }
  }],
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema); 