import { Request, Response } from 'express';
import { OverpassService } from '../services/overpass.service';
import fs from 'fs';
import path from 'path';
// import Category from '../models/Category'; // Ya no se usa Mongoose para categorías
import { Question, Position, Hint, Option, Category as CategoryType } from '../types'; // Importar Category como CategoryType
import * as turf from '@turf/turf';
import { Feature, Point, Polygon, MultiPolygon } from 'geojson';

const MAX_POINTS_PER_QUESTION = 1000;
const MAX_SCORE_TIME_PORTION = MAX_POINTS_PER_QUESTION * 0.5;
const MAX_SCORE_PRECISION_PORTION = MAX_POINTS_PER_QUESTION * 0.5;

interface PopulatedQuestion extends Omit<Question, 'answer' | 'options' | 'hints'> {
  _id: any;
  questionId: string;
  duration: number;
  type: 'position' | 'multiple' | 'text';
  geometry?: Polygon | MultiPolygon;
  answer: {
    text?: string;
    position?: Position;
    multipleChoice?: number;
  };
  options?: Option[];
  hints: (Hint & { _id?: any })[];
}

export class GameController {
  private overpassService: OverpassService;
  private categoriesPath = path.join(__dirname, '..', 'data', 'categories');

  constructor() {
    this.overpassService = new OverpassService();
  }

  startGame = async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId } = req.body;
      if (!categoryId || typeof categoryId !== 'string') {
        res.status(400).json({ error: 'Missing or invalid categoryId' });
        return;
      }

      const filePath = path.join(this.categoriesPath, `${categoryId}.json`);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: `Category data file not found for ${categoryId}` });
        return;
      }

      const fileContents = fs.readFileSync(filePath, 'utf-8');
      const categoryData: CategoryType = JSON.parse(fileContents);
      
      if (!categoryData) {
        // Esto no debería ocurrir si JSON.parse tiene éxito y el archivo tiene contenido
        res.status(404).json({ error: `Category not found or data is invalid for ${categoryId}` });
        return;
      }

      if (!categoryData.isActive) {
        res.status(400).json({ error: 'Category is not active' });
        return;
      }

      // Asegurarse de que cada pregunta tenga un _id si se va a usar como questionId
      const questionsWithId = categoryData.questions.map((q, index) => ({
        ...q,
        _id: q._id || `q_${index}` // Asignar un ID si no existe (aunque debería venir del JSON)
      }));

      const questionsForClient = questionsWithId.map((q: Question) => {
        // q ya es un objeto plano, no un objeto Mongoose
        const { answer, geometry, ...questionForClient } = q;
        return questionForClient;
      });

      res.json({
        category: {
            categoryId: categoryData._id, // Usar _id de la categoría del JSON
            name: categoryData.name,
            description: categoryData.description,
            image: categoryData.image,
            difficulty: categoryData.difficulty,
            timeLimit: categoryData.timeLimit,
            minScore: categoryData.minScore,
            tags: categoryData.tags
        },
        questions: questionsForClient,
        // gameSessionId ya no se usa porque no persistimos partidas
        startTime: Date.now() // El cliente usa esto para la UI, no para lógica de servidor
      });
    } catch (error) {
      console.error('Error starting game:', error);
      if (error instanceof SyntaxError) {
        res.status(500).json({ error: 'Error parsing category data JSON'});
      } else {
        res.status(500).json({ error: 'Error starting game' });
      }
    }
  };

  submitAnswer = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        categoryId,
        questionId, // Este es el _id de la pregunta
        answer: userAnswer,
        timeTaken,
        attempts,      // Número de intentos (para opción múltiple)
        hintsUsed,     // Array de { hintId: string } enviados por el cliente
      } = req.body;

      if (typeof timeTaken !== 'number' || timeTaken < 0) {
        res.status(400).json({ error: 'Invalid timeTaken' });
        return;
      }
      if (!questionId || typeof questionId !== 'string') {
        res.status(400).json({ error: 'Missing or invalid questionId' });
        return;
      }
      if (!categoryId || typeof categoryId !== 'string') {
        res.status(400).json({ error: 'Missing or invalid categoryId' });
        return;
      }

      const filePath = path.join(this.categoriesPath, `${categoryId}.json`);
      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: `Category data file not found for ${categoryId}` });
        return;
      }

      const fileContents = fs.readFileSync(filePath, 'utf-8');
      const category: CategoryType = JSON.parse(fileContents);

      if (!category) {
        res.status(404).json({ error: `Category not found or data is invalid for ${categoryId}` });
        return;
      }
      
      const question = category.questions.find(q => q._id === questionId);
      
      if (!question) {
        res.status(404).json({ error: `Question with id '${questionId}' not found in category '${categoryId}'` });
        return;
      }

      const questionDuration = question.duration || 30; // Usar la duración de la pregunta del JSON
      const timeFactor = Math.max(0, 1 - (timeTaken / questionDuration));
      const scoreFromTime = timeFactor * MAX_SCORE_TIME_PORTION;

      let precisionFactor = 0;
      let isCorrect = false;
      // Clonar la respuesta correcta para enviarla al cliente sin modificar el objeto original
      const correctAnswerForFeedback = JSON.parse(JSON.stringify(question.answer));

      if (question.type === 'position') {
        const userAnswerPosition = userAnswer as { lat: number; lng: number };
        if (!userAnswerPosition || typeof userAnswerPosition.lat !== 'number' || typeof userAnswerPosition.lng !== 'number') {
            res.status(400).json({ error: 'Invalid answer format for position question' });
            return;
        }
        if (question.geometry) {
          const pt: Feature<Point> = turf.point([userAnswerPosition.lng, userAnswerPosition.lat]);
          let isInsidePolygon = false;
          let distanceToEdgeKm = Infinity;
          // El tipo de question.geometry ya es compatible con GeoJSON que espera Turf
          const turfGeometry = question.geometry as Polygon | MultiPolygon; 

          isInsidePolygon = turf.booleanPointInPolygon(pt, turfGeometry);

          if (!isInsidePolygon) {
            if (turfGeometry.type === 'Polygon') {
                // Las coordenadas de un polígono simple son un array de anillos, el primero es el exterior
                distanceToEdgeKm = turf.pointToLineDistance(pt, turf.lineString(turfGeometry.coordinates[0]), { units: 'kilometers' });
            } else if (turfGeometry.type === 'MultiPolygon') {
                // Iterar sobre cada polígono en el multipolígono
                turfGeometry.coordinates.forEach(polyCoords => {
                    // Cada polyCoords es un array de anillos, el primero es el exterior del polígono actual
                    const line = turf.lineString(polyCoords[0]);
                    distanceToEdgeKm = Math.min(distanceToEdgeKm, turf.pointToLineDistance(pt, line, { units: 'kilometers' }));
                });
            }
          }

          if (isInsidePolygon) {
            precisionFactor = 1.0;
            isCorrect = true;
          } else {
            const MAX_TOLERABLE_DISTANCE_KM = 500; // Máxima distancia para dar puntos
            precisionFactor = Math.max(0, (MAX_TOLERABLE_DISTANCE_KM - distanceToEdgeKm) / MAX_TOLERABLE_DISTANCE_KM);
            isCorrect = precisionFactor > 0.5; // Considerar correcto si está razonablemente cerca
          }
        } else {
          // Si no hay geometría definida para la pregunta de posición, no se puede validar
          precisionFactor = 0; isCorrect = false;
          console.warn(`Warning: Question ${question._id} is of type 'position' but has no geometry defined.`);
        }
      } else if (question.type === 'multiple') {
        const userAnswerOptionIndex = userAnswer as number;
        // El índice de la respuesta correcta está en question.answer.multipleChoice
        const correctOptionIndex = question.answer?.multipleChoice;
        
        if (userAnswerOptionIndex === correctOptionIndex) {
          isCorrect = true;
          const numAttempts = attempts || 1;
          if (numAttempts === 1) precisionFactor = 1.0;
          else if (numAttempts === 2) precisionFactor = 0.6;
          else if (numAttempts === 3) precisionFactor = 0.3;
          else precisionFactor = 0.1;
        } else {
          precisionFactor = 0.0;
          isCorrect = false;
        }
      } else if (question.type === 'text') {
        const userAnswerText = (userAnswer as string || '').toLowerCase();
        const correctAnswerText = (question.answer?.text || '').toLowerCase();
        if (correctAnswerText.length === 0 && userAnswerText.length === 0) {
            precisionFactor = 1.0; isCorrect = true;
        } else if (correctAnswerText.length === 0 && userAnswerText.length > 0) {
            precisionFactor = 0.0; isCorrect = false;
        } else {
            const levDistance = this.levenshteinDistance(userAnswerText, correctAnswerText);
            const maxLength = correctAnswerText.length;
            const similarity = maxLength > 0 ? Math.max(0, (maxLength - levDistance)) / maxLength : (levDistance === 0 ? 1: 0) ;
            precisionFactor = Math.max(0, similarity);
            isCorrect = precisionFactor >= 0.75; // Considerar correcto si la similitud es >= 75%
        }
      }
      const scoreFromPrecision = precisionFactor * MAX_SCORE_PRECISION_PORTION;

      let totalHintPenalty = 0;
      if (hintsUsed && Array.isArray(hintsUsed) && question.hints) {
        // hintsUsed del cliente es un array de { hintId: string }
        hintsUsed.forEach((usedHintClient: { hintId: string }) => {
          // Buscar la pista en los datos de la pregunta por su _id
          const hintData = question.hints.find(h => h._id === usedHintClient.hintId );
          if (hintData && typeof hintData.penalty === 'number') {
            totalHintPenalty += hintData.penalty;
          }
        });
      }

      const finalScoreForQuestion = Math.max(0, Math.round(scoreFromTime + scoreFromPrecision - totalHintPenalty));

      res.json({
        questionScore: finalScoreForQuestion,
        isCorrect,
        correctAnswer: correctAnswerForFeedback,
        debug_score: {
            timeFactor: parseFloat(timeFactor.toFixed(2)),
            scoreFromTime: Math.round(scoreFromTime),
            precisionFactor: parseFloat(precisionFactor.toFixed(2)),
            scoreFromPrecision: Math.round(scoreFromPrecision),
            totalHintPenalty
        }
      });

    } catch (error) {
      console.error('Error submitting answer:', error);
      if (error instanceof SyntaxError) {
        res.status(500).json({ error: 'Error parsing category data JSON'});
      } else if (error instanceof Error) {
        res.status(500).json({ error: 'Error submitting answer', message: error.message });
      } else {
        res.status(500).json({ error: 'Error submitting answer' });
      }
    }
  };

  private calculatePositionScore(correct: Position, answer: Position): number {
    if (!correct || !answer) return 0;

    const distance = this.calculateDistance(
      correct.lat,
      correct.lng,
      answer.lat,
      answer.lng
    );

    const radius = correct.radius || 1000;
    if (distance <= radius) {
      return 1;
    } else if (distance <= radius * 2) {
      return 0.5;
    } else if (distance <= radius * 5) {
      return 0.25;
    }
    return 0;
  }

  private calculateTextScore(correct: string, answer: string): number {
    const maxLength = Math.max(correct.length, answer.length);
    if (maxLength === 0) return 0;

    const distance = this.levenshteinDistance(
      correct.toLowerCase(),
      answer.toLowerCase()
    );
    return 1 - distance / maxLength;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  private levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i-1) === a.charAt(j-1)) {
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i-1][j-1] + 1,
            matrix[i][j-1] + 1,
            matrix[i-1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
} 