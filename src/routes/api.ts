import { Router } from 'express';
import { analyzeBeans } from '../controllers/beansController';
import { generateRecipe, rateRecipe } from '../controllers/recipesController';
import { getEquipment } from '../controllers/equipmentController';

const router = Router();

router.post('/beans/analyze', analyzeBeans);
router.post('/recipes/generate', generateRecipe);
router.post('/recipes/rate', rateRecipe);
router.get('/equipment', getEquipment);

export default router;
