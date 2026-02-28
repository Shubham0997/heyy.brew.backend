import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';
import { connectDB } from './database/connection';

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Heyy Brew Backend running on http://localhost:${PORT}`);
});
