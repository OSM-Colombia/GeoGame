import { Category } from '../types';

export interface ICategory extends Omit<Category, 'id'> {}

// Ya no se necesitan los esquemas ni los índices de Mongoose.
// La definición de Category está en ../types/index.ts y se carga desde JSON. 