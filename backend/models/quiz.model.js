const quizSchema = new mongoose.Schema({
    title: String,
    questions: [
      {
        question: String,
        options: [String],
        answer: Number,
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  });
  module.exports = mongoose.model("Quiz", quizSchema);
  