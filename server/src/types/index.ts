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
  geometry?: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface Category {
  _id: string;
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

// Extender Request de Express para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
      };
    }
  }
} 