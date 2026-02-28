import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            console.warn('MONGODB_URI is not defined in the environment variables. Skipping MongoDB connection.');
            return;
        }

        await mongoose.connect(mongoURI);
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
