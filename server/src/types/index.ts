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

export interface Game {
  id: string;
  categoryId: string;
  userId: string;
  score: number;
  time: number;
  answers: Answer[];
  createdAt: Date;
}

export interface Answer {
  questionId: string;
  answer: any;
  score: number;
  time: number;
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