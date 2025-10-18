// routes/comments.js

import express from 'express';
import { getCommentsForNews, addComment, deleteComment, getAllComments } from '../controllers/comments.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(protect, getAllComments)
    .post(addComment);

router.route('/news/:newsId').get(getCommentsForNews);

// Only admins can delete comments
router.route('/:id').delete(protect, deleteComment);

export default router;

