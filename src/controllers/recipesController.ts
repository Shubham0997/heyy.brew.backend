import { Request, Response } from 'express';
import { generateRecipe as generateAiRecipe } from '../services/aiService';
import BrewRating from '../models/BrewRating';
import SavedRecipe from '../models/SavedRecipe';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const generateRecipe = async (req: Request, res: Response) => {
    try {
        const { beanInfo, equipment, preferences } = req.body;

        if (!beanInfo || !equipment) {
            return res.status(400).json({ error: 'Please provide "beanInfo" and "equipment" objects in the JSON body.' });
        }

        const recipe = await generateAiRecipe(beanInfo, equipment, preferences);
        res.status(200).json(recipe);
    } catch (error: any) {
        console.error("Error generating recipe:", error);
        res.status(500).json({ error: error.message || 'Failed to generate recipe' });
    }
};

export const rateRecipe = async (req: Request, res: Response) => {
    try {
        const { recipeId, recipe, beanInfo, rating, timestamp } = req.body;

        if (!recipe || !beanInfo || rating === undefined || rating === null) {
            res.status(400).json({ error: 'Please provide recipe object, beanInfo object, and rating.' });
            return;
        }

        const numericRating = Number(rating);
        if (isNaN(numericRating) || numericRating < 1 || numericRating > 10 || !Number.isInteger(numericRating)) {
            res.status(400).json({ error: 'Rating must be an integer between 1 and 10.' });
            return;
        }

        const newRating = new BrewRating({
            recipeId: recipeId || 'unknown',
            recipe,
            beanInfo,
            rating: numericRating,
            timestamp: timestamp ? new Date(timestamp) : new Date()
        });

        const savedRating = await newRating.save();
        res.status(201).json({ id: savedRating._id, message: 'Rating saved successfully' });
    } catch (error: any) {
        console.error('Error saving rating:', error);
        res.status(500).json({ error: error.message || 'Failed to save rating' });
    }
};

export const saveRecipe = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { beanInfo, recipe, rating } = req.body;
        const userId = req.user?.uid;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized user.' });
            return;
        }

        if (!beanInfo || !recipe) {
            res.status(400).json({ error: 'Please provide beanInfo and recipe.' });
            return;
        }

        const newSavedRecipe = new SavedRecipe({
            userId,
            beanInfo,
            recipe,
            rating: typeof rating === 'number' ? rating : undefined,
            createdAt: new Date()
        });

        const saved = await newSavedRecipe.save();
        res.status(201).json({ id: saved._id, message: 'Recipe saved successfully' });
    } catch (error: any) {
        console.error('Error saving recipe:', error);
        res.status(500).json({ error: error.message || 'Failed to save recipe' });
    }
};

export const getSavedRecipes = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.uid;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized user.' });
            return;
        }

        const recipes = await SavedRecipe.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(recipes);
    } catch (error: any) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch recipes' });
    }
};

export const deleteRecipe = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.uid;
        const recipeId = req.params.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized user.' });
            return;
        }

        if (!recipeId) {
            res.status(400).json({ error: 'Recipe ID is required.' });
            return;
        }

        const deletedRecipe = await SavedRecipe.findOneAndDelete({ _id: recipeId, userId });

        if (!deletedRecipe) {
            res.status(404).json({ error: 'Recipe not found or unauthorized to delete.' });
            return;
        }

        res.status(200).json({ message: 'Recipe deleted successfully', id: deletedRecipe._id });
    } catch (error: any) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ error: error.message || 'Failed to delete recipe' });
    }
};
