import { Request, Response } from 'express';
import { OverpassService } from '../services/overpass.service';
import Category from '../models/Category';

export class GameController {
  private overpassService: OverpassService;

  constructor() {
    this.overpassService = new OverpassService();
  }

  startGame = async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId } = req.body;
      const category = await Category.findById(categoryId);
      
      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      res.json({
        category,
        questions: category.questions
      });
    } catch (error) {
      res.status(500).json({ error: 'Error starting game' });
    }
  };

  submitAnswer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { questionId, answer, time } = req.body;
      const score = await this.calculateScore(questionId, answer, time);
      res.json({ score });
    } catch (error) {
      res.status(500).json({ error: 'Error submitting answer' });
    }
  };

  private async calculateScore(questionId: string, answer: any, time: number): Promise<number> {
    // Implementar lógica de cálculo de puntuación
    const baseScore = 1000;
    const timePenalty = time / 1000; // Convertir a segundos
    return Math.max(0, baseScore - timePenalty);
  }
} 