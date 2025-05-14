import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState } from '../types';

const initialState: GameState = {
  currentGame: null,
  questions: [],
  currentQuestion: 0,
  score: 0,
  time: 0,
  isPlaying: false,
  selectedAnswer: null,
  hintsUsed: [],
  isGameOver: false,
  currentCategory: null
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state, action: PayloadAction<any>) => {
      state.currentGame = {
        id: action.payload.categoryId + '_' + Date.now(),
        categoryId: action.payload.category.categoryId,
        startTime: action.payload.startTime,
        score: 0,
        answers: [],
        status: 'active'
      };
      state.questions = action.payload.questions;
      state.currentCategory = action.payload.category;
      state.currentQuestion = 0;
      state.score = 0;
      state.time = 0;
      state.isPlaying = true;
      state.isGameOver = false;
      state.selectedAnswer = null;
      state.hintsUsed = [];
    },
    submitAnswer: (state, action: PayloadAction<any>) => {
      if (!state.isPlaying || state.isGameOver) return;

      state.score += action.payload.questionScore;

      if (state.currentGame && state.questions[state.currentQuestion]) {
        state.currentGame.answers.push({
          questionId: state.questions[state.currentQuestion]._id,
          answer: state.selectedAnswer,
          score: action.payload.questionScore,
          time: 0,
          hintsUsed: [...state.hintsUsed]
        });
      }

      state.currentQuestion += 1;

      state.selectedAnswer = null;
      state.hintsUsed = [];

      if (state.currentQuestion >= state.questions.length) {
        state.isPlaying = false;
        state.isGameOver = true;
        if (state.currentGame) {
          state.currentGame.status = 'completed';
          state.currentGame.endTime = Date.now();
          state.currentGame.score = state.score;
        }
      }
    },
    endGame: (state) => {
      state.isPlaying = false;
      state.isGameOver = true;
      if(state.currentGame) {
        state.currentGame.status = state.currentGame.status === 'completed' ? 'completed' : 'abandoned';
        if (!state.currentGame.endTime) state.currentGame.endTime = Date.now();
        state.currentGame.score = state.score;
      }
    }
  }
});

export const { startGame, submitAnswer, endGame } = gameSlice.actions;
export default gameSlice.reducer; 