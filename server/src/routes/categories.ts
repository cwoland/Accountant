import { Router } from 'express';
import { z } from 'zod';
import { createCategoryBody, objectId, updateCategoryBody } from '@accountant/shared';
import { validate } from '../middleware/validate.js';
import {
  archiveCategory,
  createCategory,
  getCategories,
  hideCategory,
  unhideCategory,
  updateCategory,
} from '../controllers/categoryController.js';

const router = Router();
const idParam = validate('params', z.object({ id: objectId }));

router.get('/', getCategories);
router.post('/', validate('body', createCategoryBody), createCategory);
router.put('/:id', idParam, validate('body', updateCategoryBody), updateCategory);
router.delete('/:id', idParam, archiveCategory);
router.post('/:id/hide', idParam, hideCategory);
router.post('/:id/unhide', idParam, unhideCategory);

export default router;