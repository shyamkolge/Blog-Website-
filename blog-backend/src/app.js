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


// Blog routes
import blogRoutes from './routes/blog.routes.js';
app.use("/api/v1/blogs", blogRoutes);



export default app;