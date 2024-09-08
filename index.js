import express from 'express';
import Connection from './database/db.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';  
import { faker } from '@faker-js/faker';
import cors from 'cors';
import cron from 'node-cron';

const app = express();
const PORT = process.env.PORT || 5010;

// Use CORS middleware
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Use the user routes
app.use('/api', userRoutes);
app.use('/api', postRoutes);

// Endpoint to check backend status
app.get('/checkup', (req, res) => {
    console.log('GET /checkup endpoint was hit');
    res.status(200).send('Backend is running correctly');
});

// API for fetching the fake data
app.get('/posts', (req, res) => {
    const { limit = 10, offset = 0 } = req.query;
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);

    if (limitNum <= 0 || offsetNum < 0) {
        return res.status(400).json({ error: 'Invalid limit or offset parameter' });
    }
    
    // Generate a large amount of data
    const allData = Array.from({ length: 1000 }, () => {
        const random = Math.floor(Math.random() * 1000);
        return {
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            email: faker.internet.email(),
            address: faker.location.streetAddress(),
            phone: faker.phone.number(),
            imgUrl: `https://picsum.photos/200/300?random=${random}`,
        };
    });

    const paginatedData = allData.slice(offsetNum, offsetNum + limitNum);
    
    res.status(200).json(paginatedData);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});

// Initialize the database connection
Connection();

// Schedule a cron job to run every 10 seconds
cron.schedule('*/10 * * * * *', function() {
    console.log('Cron job is running');
});
