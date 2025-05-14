import { Category } from '../types';

// Función que obtiene todas las categorías (archivos JSON) desde el servidor
export async function fetchCategories(): Promise<Category[]> {
  const resp = await fetch('/api/categories');
  if (!resp.ok) {
    throw new Error("No se pudieron cargar las categorías.");
  }
  const data = await resp.json();
  return data;
} 