export interface Position {
  lat: number;
  lng: number;
  radius?: number;
}

export interface Option {
  text: string;
  isCorrect: boolean;
}

export interface Hint {
  _id: string;
  text: string;
  penalty: number;
}

export interface OsmTag {
  key: string;
  value: string;
}

export interface Question {
  _id: string;
  type: 'position' | 'multiple' | 'text';
  title: string;
  description: string;
  image?: string;
  options?: Option[];
  answer: {
    position?: Position;
    text?: string;
    multipleChoice?: number;
  };
  source: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  hints: Hint[];
  osmTags: OsmTag[];
}

export interface GameState {
  currentGame: {
    id: string;
    categoryId: string;
    startTime: number;
    endTime?: number;
    score: number;
    answers: Array<{
      questionId: string;
      answer: any;
      score: number;
      time: number;
      hintsUsed: string[];
    }>;
    status: 'active' | 'completed' | 'abandoned';
  } | null;
  questions: Question[];
  currentQuestion: number;
  score: number;
  time: number;
  isPlaying: boolean;
  selectedAnswer: any;
  hintsUsed: string[];
  isGameOver: boolean;
  currentCategory: Category | null;
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
  osmArea: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
  tags: string[];
  isActive: boolean;
}

export interface GameResult {
  id: string;
  categoryId: string;
  userId: string;
  score: number;
  time: number;
  answers: Array<{
    questionId: string;
    answer: any;
    score: number;
    time: number;
    hintsUsed: string[];
  }>;
  createdAt: Date;
  isHighScore: boolean;
} 