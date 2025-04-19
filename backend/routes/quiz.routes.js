const express = require("express");
const router = express.Router();
const {
  createQuiz,
  getQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getResults
} = require("../controllers/quiz.controller");
const { auth, authorize } = require("../middleware/auth");

// Protected routes
router.use(auth);

// Quiz routes
router.post("/", authorize("teacher", "admin"), createQuiz);
router.get("/", getQuizzes);
router.get("/:id", getQuiz);
router.patch("/:id", authorize("teacher", "admin"), updateQuiz);
router.delete("/:id", authorize("teacher", "admin"), deleteQuiz);

// Quiz submission and results
router.post("/:id/submit", authorize("student"), submitQuiz);
router.get("/:id/results", getResults);

module.exports = router;
