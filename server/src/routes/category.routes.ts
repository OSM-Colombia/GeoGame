import { Router } from 'express';
import { getAllCategories } from '../controllers/category.controller';

const router = Router();

// GET /api/categories
router.get('/', getAllCategories);

export default router; 