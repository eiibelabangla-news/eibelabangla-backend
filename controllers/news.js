// controllers/news.js

import News from '../models/News.js';
import Category from '../models/Category.js';
import Comment from '../models/Comment.js';
import { v2 as cloudinary } from 'cloudinary';

// @desc      Increment view count for a news article
// @route     PATCH /api/v1/news/:id/view
// @access    Public
export const incrementViewCount = async (req, res, next) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true, runValidators: true }
    );

    if (!news) {
      return res.status(404).json({ success: false, msg: 'News article not found' });
    }

    res.status(200).json({ success: true, data: { views: news.views } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc      Get admin dashboard stats
// @route     GET /api/v1/news/stats
// @access    Private
export const getStats = async (req, res, next) => {
    try {
        const newsCount = await News.countDocuments();
        const categoryCount = await Category.countDocuments();
        const commentCount = await Comment.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                news: newsCount,
                categories: categoryCount,
                comments: commentCount
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};


// @desc      Get all news with pagination
// @route     GET /api/v1/news
// @access    Public
export const getNews = async (req, res, next) => {
  try {
    let query;

    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    query = News.find(JSON.parse(queryStr)).populate('category author');

    // Select Fields
    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await News.countDocuments(JSON.parse(queryStr));
    const totalPages = Math.ceil(total / limit);

    query = query.skip(startIndex).limit(limit);

    const news = await query;

    // Pagination result
    const pagination = { page, total, totalPages, limit };

    if(endIndex < total) {
        pagination.next = { page: page + 1, limit };
    }

    if(startIndex > 0) {
        pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({ success: true, count: news.length, pagination, data: news });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc      Get single news article
// @route     GET /api/v1/news/:id
// @access    Public
export const getSingleNews = async (req, res, next) => {
    try {
        const news = await News.findById(req.params.id).populate('category author');
        if (!news) {
            return res.status(404).json({ success: false, msg: 'News article not found' });
        }
        res.status(200).json({ success: true, data: news });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc      Get news by category
// @route     GET /api/v1/news/category/:categoryId
// @access    Public
export const getNewsByCategory = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const total = await News.countDocuments({ category: req.params.categoryId });
        const totalPages = Math.ceil(total / limit);

        const news = await News.find({ category: req.params.categoryId })
            .populate('category author')
            .sort('-createdAt')
            .skip(startIndex)
            .limit(limit);

        const pagination = { page, total, totalPages, limit };
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({ success: true, count: news.length, pagination, data: news });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}


// ... inside controllers/news.js

// @desc      Create new news article
// @route     POST /api/v1/news
// @access    Private
export const createNews = async (req, res, next) => {
    try {
        // Assign author from the logged-in user provided by the 'protect' middleware
        req.body.author = req.user.id;
        req.body.authorName = req.user.name; // Add author's name

        if (req.file) {
            req.body.featuredImage = req.file.path;
            req.body.cloudinaryPublicId = req.file.filename;
        }

        const news = await News.create(req.body);
        res.status(201).json({
            success: true,
            data: news,
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};



// @desc      Update news article
// @route     PUT /api/v1/news/:id
// @access    Private
export const updateNews = async (req, res, next) => {
    try {
        let news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({ success: false, msg: 'News article not found' });
        }

        if (req.file) {
            // If there's an old image, delete it from Cloudinary
            if (news.cloudinaryPublicId) {
                await cloudinary.uploader.destroy(news.cloudinaryPublicId);
            }
            req.body.featuredImage = req.file.path;
            req.body.cloudinaryPublicId = req.file.filename;
        }

        news = await News.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: news });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc      Delete news article
// @route     DELETE /api/v1/news/:id
// @access    Private
export const deleteNews = async (req, res, next) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({ success: false, msg: 'News article not found' });
        }

        // Delete image from Cloudinary
        if (news.cloudinaryPublicId) {
            await cloudinary.uploader.destroy(news.cloudinaryPublicId);
        }

        await news.deleteOne();

        // Also delete comments associated with the news article
        await Comment.deleteMany({ news: req.params.id });

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};