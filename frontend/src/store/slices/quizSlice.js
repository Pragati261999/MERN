import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  quizzes: [],
  currentQuiz: null,
  results: [],
  loading: false,
  error: null,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setQuizzes: (state, action) => {
      state.quizzes = action.payload;
      state.loading = false;
    },
    setCurrentQuiz: (state, action) => {
      state.currentQuiz = action.payload;
      state.loading = false;
    },
    setResults: (state, action) => {
      // Ensure results is always an array
      if (action.payload === null || action.payload === undefined) {
        state.results = [];
      } else if (!Array.isArray(action.payload)) {
        state.results = [action.payload];
      } else {
        state.results = action.payload;
      }
      state.loading = false;
    },
    addQuiz: (state, action) => {
      state.quizzes.push(action.payload);
      state.loading = false;
    },
    updateQuiz: (state, action) => {
      const index = state.quizzes.findIndex(quiz => quiz._id === action.payload._id);
      if (index !== -1) {
        state.quizzes[index] = action.payload;
      }
      state.loading = false;
    },
    deleteQuiz: (state, action) => {
      state.quizzes = state.quizzes.filter(quiz => quiz._id !== action.payload);
      state.loading = false;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setQuizzes,
  setCurrentQuiz,
  setResults,
  addQuiz,
  updateQuiz,
  deleteQuiz,
} = quizSlice.actions;

export default quizSlice.reducer; 