import { Category } from '../types';

// Función que obtiene todas las categorías (archivos JSON) desde el servidor
export async function fetchCategories(): Promise<Category[]> {
  const resp = await fetch('/api/categories');
  console.log('Respuesta cruda de /api/categories:', resp);
  if (!resp.ok) {
    throw new Error("No se pudieron cargar las categorías.");
  }
  const data = await resp.json();
  console.log('JSON recibido de /api/categories:', data);
  return data;
} 