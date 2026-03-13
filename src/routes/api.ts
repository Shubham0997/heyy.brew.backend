import { Router } from 'express';
import { analyzeBeans } from '../controllers/beansController';
import { generateRecipe, rateRecipe, saveRecipe, getSavedRecipes, deleteRecipe, speakText, updateSavedRecipeRating } from '../controllers/recipesController';
import { getEquipment } from '../controllers/equipmentController';
import { getGrinders, addGrinder } from '../controllers/grindersController';
import { getUserProfile, saveUserProfile } from '../controllers/userController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/beans/analyze', analyzeBeans);
router.post('/recipes/generate', generateRecipe);
router.post('/recipes/speak', speakText);
router.post('/recipes/rate', rateRecipe);
router.get('/equipment', getEquipment);
router.get('/grinders', getGrinders);
router.post('/grinders', addGrinder as any);

// Protected routes
router.post('/recipes/save', verifyToken, saveRecipe as any);
router.get('/recipes/saved', verifyToken, getSavedRecipes as any);
router.delete('/recipes/saved/:id', verifyToken, deleteRecipe as any);
router.patch('/recipes/saved/:id/rating', verifyToken, updateSavedRecipeRating as any);
router.get('/user/profile', verifyToken, getUserProfile as any);
router.post('/user/profile', verifyToken, saveUserProfile as any);


export default router;
