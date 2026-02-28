import { Request, Response } from 'express';
import { extractBeanInfo } from '../services/aiService';

export const analyzeBeans = async (req: Request, res: Response) => {
    try {
        const { description, image } = req.body;

        if (!description && !image) {
            const keys = Object.keys(req.body || {});
            return res.status(400).json({
                error: 'Please provide either a "description" string or an "image" base64 string in the JSON body.',
                receivedKeys: keys,
                receivedBodyType: typeof req.body
            });
        }

        const beanInfo = await extractBeanInfo(description, image);
        res.status(200).json(beanInfo);
    } catch (error: any) {
        console.error("Error analyzing beans:", error);
        res.status(500).json({ error: error.message || 'Failed to analyze beans' });
    }
};
