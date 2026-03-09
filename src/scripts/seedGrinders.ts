import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Grinder from '../models/Grinder';

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const rawGrindersData = [
    { brand: "Timemore", model: "C2", min_setting: 0, max_setting: 36 },
    { brand: "Baratza", model: "Encore", min_setting: 1, max_setting: 40 },
    { brand: "Baratza", model: "Virtuoso+", min_setting: 1, max_setting: 40 },
    { brand: "Breville", model: "Smart Grinder Pro", min_setting: 1, max_setting: 60 },
    { brand: "Breville", model: "Dose Control Pro", min_setting: 1, max_setting: 60 },
    { brand: "Comandante", model: "C40 MK4", min_setting: 0, max_setting: 40 },
    { brand: "Comandante", model: "C40 MK4 Red Clix", min_setting: 0, max_setting: 80 },
    { brand: "Fellow", model: "Ode Gen 1", min_setting: 1, max_setting: 31 },
    { brand: "Fellow", model: "Ode Gen 2", min_setting: 1, max_setting: 31 },
    { brand: "Fellow", model: "Opus", min_setting: 1, max_setting: 41 },
    { brand: "1Zpresso", model: "JX-Pro", min_setting: 0, max_setting: 200 },
    { brand: "1Zpresso", model: "JX-Pro S", min_setting: 0, max_setting: 200 },
    { brand: "1Zpresso", model: "J-Ultra", min_setting: 0, max_setting: 100 },
    { brand: "1Zpresso", model: "K-Ultra", min_setting: 0, max_setting: 100 },
    { brand: "1Zpresso", model: "Q2 S", min_setting: 0, max_setting: 75 },
    { brand: "1Zpresso", model: "J", min_setting: 0, max_setting: 75 },
    { brand: "1Zpresso", model: "JE", min_setting: 0, max_setting: 75 },
    { brand: "1Zpresso", model: "JE-Plus", min_setting: 0, max_setting: 200 },
    { brand: "1Zpresso", model: "X-Pro S", min_setting: 0, max_setting: 240 },
    { brand: "1Zpresso", model: "X-Ultra", min_setting: 0, max_setting: 240 },
    { brand: "1Zpresso", model: "J-Max S", min_setting: 0, max_setting: 450 },
    { brand: "1Zpresso", model: "K-Plus", min_setting: 0, max_setting: 150 },
    { brand: "1Zpresso", model: "K-Pro", min_setting: 0, max_setting: 150 },
    { brand: "1Zpresso", model: "K-Max", min_setting: 0, max_setting: 150 },
    { brand: "1Zpresso", model: "ZP6 Special", min_setting: 0, max_setting: 150 },
    { brand: "Hario", model: "Mini Mill PLUS", min_setting: 1, max_setting: 20 },
    { brand: "Hario", model: "Skerton", min_setting: 1, max_setting: 15 },
    { brand: "Wilfa", model: "Uniform WSFB", min_setting: 1, max_setting: 41 },
    { brand: "Wilfa", model: "Svart", min_setting: 1, max_setting: 18 },
    { brand: "Wilfa", model: "Svart Aroma", min_setting: 1, max_setting: 18 },
    { brand: "Wilfa", model: "Balance", min_setting: 1, max_setting: 31 },
    { brand: "Turin", model: "DF64 Gen 1", min_setting: 0, max_setting: 90 },
    { brand: "Turin", model: "DF64 Gen 2", min_setting: 0, max_setting: 90 },
    { brand: "Turin", model: "DF83", min_setting: 0, max_setting: 90 },
    { brand: "Turin", model: "DF83V", min_setting: 0, max_setting: 90 },
    { brand: "Turin", model: "DF54", min_setting: 0, max_setting: 90 },
    { brand: "Niche", model: "Zero", min_setting: 0, max_setting: 50 },
    { brand: "Niche", model: "Duo", min_setting: 0, max_setting: 50 },
    { brand: "Option-O", model: "Lagom P64", min_setting: 0, max_setting: 100 },
    { brand: "Option-O", model: "Lagom Mini", min_setting: 0, max_setting: 100 },
    { brand: "Option-O", model: "Lagom P100", min_setting: 0, max_setting: 100 },
    { brand: "Varia", model: "VS3", min_setting: 0, max_setting: 200 },
    { brand: "Varia", model: "VS4", min_setting: 0, max_setting: 200 },
    { brand: "Mazzer", model: "Philos", min_setting: 0, max_setting: 100 },
    { brand: "Eureka", model: "Mignon Silenzio", min_setting: 0, max_setting: 100 },
    { brand: "Eureka", model: "Mignon Specialita", min_setting: 0, max_setting: 100 },
    { brand: "Eureka", model: "Mignon Zero", min_setting: 0, max_setting: 100 },
    { brand: "Eureka", model: "Mignon Libra", min_setting: 0, max_setting: 100 },
    { brand: "Eureka", model: "Oro XL", min_setting: 0, max_setting: 100 },
    { brand: "Eureka", model: "Oro Single Dose", min_setting: 0, max_setting: 100 },
    { brand: "Eureka", model: "Mignon Perfetto", min_setting: 0, max_setting: 100 },
    { brand: "Eureka", model: "Mignon Turbo", min_setting: 0, max_setting: 100 },
    { brand: "Eureka", model: "Mignon Crono", min_setting: 0, max_setting: 100 },
    { brand: "Eureka", model: "Mignon Filtro", min_setting: 0, max_setting: 100 },
    { brand: "Eureka", model: "Mignon Manuale", min_setting: 0, max_setting: 100 },
    { brand: "Eureka", model: "Mignon Classico", min_setting: 0, max_setting: 100 },
    { brand: "Eureka", model: "Mignon Bravo", min_setting: 0, max_setting: 100 },
    { brand: "Eureka", model: "Mignon Brew Pro", min_setting: 0, max_setting: 100 },
    { brand: "KINGrinder", model: "K0", min_setting: 0, max_setting: 140 },
    { brand: "KINGrinder", model: "K1", min_setting: 0, max_setting: 140 },
    { brand: "KINGrinder", model: "K2", min_setting: 0, max_setting: 140 },
    { brand: "KINGrinder", model: "K3", min_setting: 0, max_setting: 140 },
    { brand: "KINGrinder", model: "K4", min_setting: 0, max_setting: 150 },
    { brand: "KINGrinder", model: "K5", min_setting: 0, max_setting: 140 },
    { brand: "KINGrinder", model: "K6", min_setting: 0, max_setting: 150 },
    { brand: "Timemore", model: "C3", min_setting: 0, max_setting: 36 },
    { brand: "Timemore", model: "C3S", min_setting: 0, max_setting: 36 },
    { brand: "Timemore", model: "Slim", min_setting: 0, max_setting: 36 },
    { brand: "Timemore", model: "G1", min_setting: 0, max_setting: 36 },
    { brand: "Knock", model: "Feldgrind", min_setting: 0, max_setting: 50 },
    { brand: "Knock", model: "Aergrind", min_setting: 0, max_setting: 50 },
    { brand: "Baratza", model: "Sette 270", min_setting: 1, max_setting: 270 },
    { brand: "Baratza", model: "Sette 270Wi", min_setting: 1, max_setting: 270 },
    { brand: "Baratza", model: "Sette 30", min_setting: 1, max_setting: 30 },
    { brand: "Baratza", model: "Vario", min_setting: 1, max_setting: 230 },
    { brand: "Baratza", model: "Vario-W", min_setting: 1, max_setting: 230 },
    { brand: "Baratza", model: "Forte AP", min_setting: 1, max_setting: 260 },
    { brand: "Baratza", model: "Forte BG", min_setting: 1, max_setting: 260 }
];

// Automatically construct ID to ensure no duplicates in React key mapping
const GRINDERS_DATA = rawGrindersData.map(g => ({
    ...g,
    id: `${g.brand.toLowerCase()}_${g.model.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
}));

const seedGrinders = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is totally missing from environment variables');
        }

        console.log('Connecting to MongoDB database...');
        await mongoose.connect(mongoUri);
        console.log('Connected!');

        console.log('Clearing existing grinders...');
        await Grinder.deleteMany({});
        console.log('Inserting ' + GRINDERS_DATA.length + ' default grinders data...');

        await Grinder.insertMany(GRINDERS_DATA);

        console.log('Success! Grinders seeded nicely.');
        process.exit(0);
    } catch (error) {
        console.error('An error occurred during seeding:', error);
        process.exit(1);
    } // Exit on Error
};

seedGrinders();
