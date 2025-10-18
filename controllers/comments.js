// controllers/comments.js

import Comment from '../models/Comment.js';
import News from '../models/News.js';

// @desc    Get all comments (for admin) with pagination
// @route   GET /api/v1/comments
// @access  Private
export const getAllComments = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;

        const total = await Comment.countDocuments();
        const comments = await Comment.find()
            .populate({ path: 'news', select: 'title' })
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        const totalPages = Math.ceil(total / limit);
        const pagination = {
            total,
            page,
            limit,
            totalPages
        };

        res.status(200).json({ success: true, count: comments.length, pagination, data: comments });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

// @desc    Get all comments for a news article with pagination
// @route   GET /api/v1/comments/news/:newsId
// @access  Public
export const getCommentsForNews = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 4; // Set limit to 4 to load more
        const startIndex = (page - 1) * limit;

        const news = await News.findById(req.params.newsId);
        if (!news) {
            return res.status(404).json({ success: false, msg: 'News article not found' });
        }

        const total = await Comment.countDocuments({ news: req.params.newsId });
        const comments = await Comment.find({ news: req.params.newsId })
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);
        
        const totalPages = Math.ceil(total / limit);
        const pagination = { page, total, totalPages, limit };

        res.status(200).json({
            success: true,
            count: comments.length,
            pagination,
            data: comments
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Add a comment to a news article
// @route   POST /api/v1/comments
// @access  Public
export const addComment = async (req, res, next) => {
    try {
        const { text, authorName, news } = req.body;
        
        const newsArticle = await News.findById(news);
        if (!newsArticle) {
            return res.status(404).json({ success: false, msg: 'News article not found' });
        }

        const comment = await Comment.create({
            text,
            authorName,
            news
        });

        res.status(201).json({
            success: true,
            data: comment
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/v1/comments/:id
// @access  Private (Admin only)
export const deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, msg: 'Comment not found' });
        }
        
        await comment.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
