// routes/news.js

import express from 'express';
import {
    getNews,
    getSingleNews,
    createNews,
    updateNews,
    deleteNews,
    getNewsByCategory,
    getStats,
    incrementViewCount
} from '../controllers/news.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// This must be before the '/:id' route
router.get('/stats', protect, getStats);

router
    .route('/')
    .get(getNews)
    .post(protect, upload.single('featuredImage'), createNews);

router.patch('/:id/view', incrementViewCount);

router
    .route('/:id')
    .get(getSingleNews)
    .put(protect, upload.single('featuredImage'), updateNews)
    .delete(protect, deleteNews);

router.get('/category/:categoryId', getNewsByCategory);


export default router;