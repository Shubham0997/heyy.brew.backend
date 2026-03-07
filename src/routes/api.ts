import { Router } from 'express';
import { analyzeBeans } from '../controllers/beansController';
import { generateRecipe, rateRecipe, saveRecipe, getSavedRecipes, deleteRecipe } from '../controllers/recipesController';
import { getEquipment } from '../controllers/equipmentController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/beans/analyze', analyzeBeans);
router.post('/recipes/generate', generateRecipe);
router.post('/recipes/rate', rateRecipe);
router.get('/equipment', getEquipment);

// Protected routes
router.post('/recipes/save', verifyToken, saveRecipe as any);
router.get('/recipes/saved', verifyToken, getSavedRecipes as any);
router.delete('/recipes/saved/:id', verifyToken, deleteRecipe as any);

export default router;
