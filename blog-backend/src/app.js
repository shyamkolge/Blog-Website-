import express from 'express';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Sample route
app.get('/', (req, res) => {
    res.send('Welcome to the Blog Backend!');
});


// Authentication routes
app.use("/api/v1/auth", authRoutes);


export default app;