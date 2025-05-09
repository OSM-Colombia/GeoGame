import { Router, Request, Response } from 'express';
import { GameController } from '../controllers/game.controller';

const router = Router();
const gameController = new GameController();

// Usando tipos explícitos para Request y Response
router.post('/start', async (req: Request, res: Response) => {
  await gameController.startGame(req, res);
});

router.post('/answer', async (req: Request, res: Response) => {
  await gameController.submitAnswer(req, res);
});

export default router; 