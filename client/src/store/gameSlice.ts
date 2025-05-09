import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState } from '../types';

const initialState: GameState = {
  currentGame: null,
  questions: [],
  currentQuestion: 0,
  score: 0,
  time: 0,
  isPlaying: false
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state, action: PayloadAction<any>) => {
      state.currentGame = action.payload;
      state.questions = action.payload.questions;
      state.currentQuestion = 0;
      state.score = 0;
      state.time = 0;
      state.isPlaying = true;
    },
    submitAnswer: (state, action: PayloadAction<any>) => {
      state.score += action.payload.score;
      state.currentQuestion += 1;
    },
    endGame: (state) => {
      state.isPlaying = false;
    }
  }
});

export const { startGame, submitAnswer, endGame } = gameSlice.actions;
export default gameSlice.reducer; 