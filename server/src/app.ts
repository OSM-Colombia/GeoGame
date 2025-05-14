import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import gameRoutes from './routes/game.routes';
import categoryRoutes from './routes/category.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Rutas de juego
app.use('/api/game', gameRoutes);
// Rutas de categorías
app.use('/api/categories', categoryRoutes);

// (opcional) Middleware de manejo de errores
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app; 