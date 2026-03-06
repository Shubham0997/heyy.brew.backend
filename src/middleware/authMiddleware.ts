import { Request, Response, NextFunction } from 'express';
import { auth } from '../services/firebaseAdmin';

// Extend Express Request type to include user information
export interface AuthenticatedRequest extends Request {
    user?: {
        uid: string;
        email?: string;
    };
}

export const verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await auth.verifyIdToken(token);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
        };
        next();
    } catch (error) {
        console.error('Error verifying Firebase token:', error);
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
    }
};
