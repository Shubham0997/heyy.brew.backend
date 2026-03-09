import { Request, Response } from 'express';
import Grinder from '../models/Grinder';

export const getGrinders = async (req: Request, res: Response) => {
    try {
        const grinders = await Grinder.find({}).sort({ brand: 1, model: 1 });
        // Map _id out to match frontend expectation
        const formatted = grinders.map(g => ({
            id: g.id,
            brand: g.brand,
            model: g.model,
            min_setting: g.min_setting,
            max_setting: g.max_setting,
            is_custom: g.is_custom
        }));
        res.json(formatted);
    } catch (error) {
        console.error('Error fetching grinders:', error);
        res.status(500).json({ error: 'Failed to fetch grinders' });
    }
};

export const addGrinder = async (req: Request, res: Response) => {
    try {
        const { brand, model, min_setting, max_setting } = req.body;

        if (!brand || !model || min_setting === undefined || max_setting === undefined) {
            res.status(400).json({ error: 'Missing required grinder fields' });
            return;
        }

        const generatedId = `${brand.toLowerCase()}_${model.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

        // Find existing to prevent duplicates
        const existing = await Grinder.findOne({ id: generatedId });
        if (existing) {
            res.status(200).json({ message: 'Grinder already exists', id: existing.id });
            return;
        }

        const newGrinder = new Grinder({
            id: generatedId,
            brand,
            model,
            min_setting,
            max_setting,
            is_custom: true
        });

        await newGrinder.save();
        res.status(201).json({ message: 'Grinder added successfully', id: generatedId });
    } catch (error: any) {
        console.error('Error adding grinder:', error);
        res.status(500).json({ error: error.message || 'Failed to add grinder' });
    }
};
