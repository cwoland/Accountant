import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  hideCategory,
} from '../controllers/categoryController.js';
import protect from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', getCategories);
router.post('/', createCategory);
router.post('/:id/hide', hideCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;