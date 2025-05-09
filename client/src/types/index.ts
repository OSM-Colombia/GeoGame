export interface Question {
  id: string;
  type: 'position' | 'multiple' | 'text';
  title: string;
  image?: string;
  options?: string[];
  answer: any;
  source: string;
  difficulty: 'easy' | 'hard';
  duration?: number;
}

export interface GameState {
  currentGame: any | null;
  questions: Question[];
  currentQuestion: number;
  score: number;
  time: number;
  isPlaying: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  questions: Question[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  minScore: number;
} 