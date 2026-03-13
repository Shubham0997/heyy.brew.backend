import { Response } from 'express';
import UserProfile from '../models/UserProfile';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.uid;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized user.' });
            return;
        }

        const profile = await UserProfile.findOne({ userId });

        if (!profile) {
            res.status(404).json({ error: 'Profile not found.' });
            return;
        }

        res.status(200).json(profile);
    } catch (error: any) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch user profile' });
    }
};

export const saveUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.uid;
        const { palateProfile } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized user.' });
            return;
        }

        if (!palateProfile) {
            res.status(400).json({ error: 'palateProfile is required.' });
            return;
        }

        const { flavorPreference, acidityPreference, bodyPreference, strengthPreference, bitternessTolerance } = palateProfile;

        if (!Array.isArray(flavorPreference) || !flavorPreference.length ||
            !Array.isArray(acidityPreference) || !acidityPreference.length ||
            !Array.isArray(bodyPreference) || !bodyPreference.length ||
            !Array.isArray(strengthPreference) || !strengthPreference.length ||
            !Array.isArray(bitternessTolerance) || !bitternessTolerance.length) {
            res.status(400).json({ error: 'All palate profile fields are required and must have at least one selection.' });
            return;
        }

        const updatedProfile = await UserProfile.findOneAndUpdate(
            { userId },
            { userId, palateProfile },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        res.status(200).json({ message: 'Profile saved successfully', profile: updatedProfile });
    } catch (error: any) {
        console.error('Error saving user profile:', error);
        res.status(500).json({ error: error.message || 'Failed to save user profile' });
    }
};
