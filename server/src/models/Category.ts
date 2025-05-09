import mongoose, { Schema, Document } from 'mongoose';
import { Category } from '../types';

export interface ICategory extends Document, Omit<Category, 'id'> {}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  questions: [{
    type: { type: String, enum: ['position', 'multiple', 'text'], required: true },
    title: { type: String, required: true },
    image: String,
    options: [String],
    answer: { type: Schema.Types.Mixed, required: true },
    source: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'hard'], required: true },
    duration: Number
  }],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  timeLimit: { type: Number, required: true },
  minScore: { type: Number, required: true }
});

export default mongoose.model<ICategory>('Category', CategorySchema); 