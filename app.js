// app.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Load env vars
dotenv.config({ path: './config/config.env' });

// Route files
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import newsRoutes from './routes/news.js';
import commentRoutes from './routes/comments.js';
import configureCloudinary from './config/cloudinary.js';
export const startServer = async () => {
    // Connect to database
    await connectDB();
    configureCloudinary();
    const app = express();
    
    // Body parser
    app.use(express.json());
    
    // Enable CORS
    app.use(cors());
    
    // Mount routers
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/categories', categoryRoutes);
    app.use('/api/v1/news', newsRoutes);
    app.use('/api/v1/comments', commentRoutes);
    
    
    const PORT = process.env.PORT || 5000;
    
    const server = app.listen(
      PORT,
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      )
    );
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.log(`Error: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
}

