import express from 'express';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import cors from "cors";


const app = express();

app.use(
  cors({
    origin: "*",
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

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