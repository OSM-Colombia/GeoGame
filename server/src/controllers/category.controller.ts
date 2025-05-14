import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { CategorySchema } from '../schemas/categorySchema';

// Directorio donde se almacenan los archivos JSON de categorías
const CATEGORIES_DIR = path.join(__dirname, '../data/categories');

export async function getAllCategories(req: Request, res: Response) {
  try {
    const files = await fs.readdir(CATEGORIES_DIR);
    const categories = [];
    const errors: string[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(CATEGORIES_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);
        const result = CategorySchema.safeParse(data);
        if (result.success) {
           categories.push(result.data);
        } else {
           errors.push(`El archivo ${file} no cumple con el esquema de categoría: ${result.error.message}`);
        }
      }
    }

    if (errors.length > 0) {
       console.error("Errores de validación:", errors);
       res.status(500).json({ error: "Algunas categorías no son válidas", details: errors });
       return;
    }

    res.json(categories);
  } catch (error) {
    console.error("Error al leer las categorías:", error);
    res.status(500).json({ error: "Error al cargar las categorías" });
  }
} 