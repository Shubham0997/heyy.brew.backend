import { Request, Response } from 'express';
import { getEquipmentList } from '../services/equipmentService';

export const getEquipment = (_req: Request, res: Response) => {
    try {
        const equipment = getEquipmentList();
        res.status(200).json(equipment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve equipment list' });
    }
};
