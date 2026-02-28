import { Request, Response } from 'express';
import { generateRecipe as generateAiRecipe } from '../services/aiService';
import BrewRating from '../models/BrewRating';

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
