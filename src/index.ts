import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';
import { connectDB } from './database/connection';

// Environment variable validation
if (!process.env.OPENAI_API_KEY) {
    console.warn('WARNING: OPENAI_API_KEY is not set in the environment variables.');
}
if (!process.env.MONGODB_URI) {
    console.warn('WARNING: MONGODB_URI is not set in the environment variables. Database saves will fail.');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// CORS Configuration - Uses environment variable if present, otherwise defaults to wildcard
const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '10mb' }));

app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Conditionally listen if not running in a Vercel serverless environment
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`Heyy Brew Backend running on http://localhost:${PORT}`);
    });
}

// Export the Express API for Vercel Serverless Functions
export default app;
