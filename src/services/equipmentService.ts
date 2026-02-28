import { Equipment } from '../types';

export const getEquipmentList = (): Equipment[] => {
    return [
        {
            id: 'v60',
            name: 'Hario V60',
            descriptor: 'Clean, bright, and nuanced cups that highlight the coffee\'s subtle flavor notes.',
            icon: 'v60' // This will map to UI icons on the frontend
        },
        {
            id: 'aeropress',
            name: 'AeroPress',
            descriptor: 'Versatile immersion/pressure brewer yielding full-bodied, rich coffee.',
            icon: 'aeropress'
        },
        {
            id: 'chemex',
            name: 'Chemex',
            descriptor: 'Similar to V60 but with thicker filters for maximum clarity and a very clean finish.',
            icon: 'chemex'
        },
        {
            id: 'french-press',
            name: 'French Press',
            descriptor: 'Classic immersion brewing for heavy-bodied, robust coffee with more oils.',
            icon: 'french-press'
        }
    ];
};
