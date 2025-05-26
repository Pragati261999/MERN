import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchUserAnalytics = createAsyncThunk(
  'analytics/fetchUserAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/analytics/user');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserCategoryAnalytics = createAsyncThunk(
  'analytics/fetchUserCategoryAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/analytics/user/categories');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchQuizAnalytics = createAsyncThunk(
  'analytics/fetchQuizAnalytics',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/analytics/quiz/${quizId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchQuizQuestionAnalytics = createAsyncThunk(
  'analytics/fetchQuizQuestionAnalytics',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/analytics/quiz/${quizId}/questions`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const exportAnalytics = createAsyncThunk(
  'analytics/exportAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/analytics/user/export', {
        responseType: 'blob',
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'analytics.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  userAnalytics: null,
  categoryAnalytics: null,
  quizAnalytics: null,
  questionAnalytics: null,
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalytics: (state) => {
      state.userAnalytics = null;
      state.categoryAnalytics = null;
      state.quizAnalytics = null;
      state.questionAnalytics = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Analytics
      .addCase(fetchUserAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.userAnalytics = action.payload;
      })
      .addCase(fetchUserAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch user analytics';
      })
      // Fetch User Category Analytics
      .addCase(fetchUserCategoryAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCategoryAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryAnalytics = action.payload;
      })
      .addCase(fetchUserCategoryAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch category analytics';
      })
      // Fetch Quiz Analytics
      .addCase(fetchQuizAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.quizAnalytics = action.payload;
      })
      .addCase(fetchQuizAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch quiz analytics';
      })
      // Fetch Quiz Question Analytics
      .addCase(fetchQuizQuestionAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizQuestionAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.questionAnalytics = action.payload;
      })
      .addCase(fetchQuizQuestionAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch question analytics';
      })
      // Export Analytics
      .addCase(exportAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportAnalytics.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to export analytics';
      });
  },
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer; 