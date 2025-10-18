// controllers/categories.js

import Category from '../models/Category.js';
import News from '../models/News.js';
import { v2 as cloudinary } from 'cloudinary';

// @desc      Get all categories with pagination and article count
// @route     GET /api/v1/categories
// @access    Public & Private
export const getCategories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    // Allow a limit of 0 to fetch all categories for dropdowns
    const limit = parseInt(req.query.limit, 10) !== 0 ? parseInt(req.query.limit, 10) || 25 : 0;
    const startIndex = (page - 1) * limit;

    const total = await Category.countDocuments();

    // Aggregation pipeline to get categories and count of associated articles
    const aggregationPipeline = [
      {
        $lookup: {
          from: 'news', // 'news' is the collection name for the News model
          localField: '_id',
          foreignField: 'category',
          as: 'articles'
        }
      },
      {
        $addFields: {
          articleCount: { $size: '$articles' }
        }
      },
      {
        $project: {
          articles: 0 // Exclude the full articles array from the final result
        }
      },
      { $sort: { createdAt: -1 } }
    ];

    if (limit !== 0) {
      aggregationPipeline.push({ $skip: startIndex });
      aggregationPipeline.push({ $limit: limit });
    }

    const categoriesWithCount = await Category.aggregate(aggregationPipeline);

    const pagination = {
      total,
      page,
      limit,
      totalPages: limit !== 0 ? Math.ceil(total / limit) : 1,
    };

    res.status(200).json({ success: true, count: categoriesWithCount.length, pagination, data: categoriesWithCount });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// @desc      Get single category
// @route     GET /api/v1/categories/:id
// @access    Public
export const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, msg: 'Category not found' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error)
    {
    res.status(400).json({ success: false, error: error.message });
  }
};


// @desc      Create new category
// @route     POST /api/v1/categories
// @access    Private
export const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc      Update category
// @route     PUT /api/v1/categories/:id
// @access    Private
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ success: false, msg: 'Category not found' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc      Delete category (with article re-assignment or cascade delete)
// @route     DELETE /api/v1/categories/:id
// @access    Private
export const deleteCategory = async (req, res, next) => {
  try {
    const { newCategoryId } = req.body; // Expect newCategoryId in the request body
    const categoryToDelete = await Category.findById(req.params.id);

    if (!categoryToDelete) {
      return res.status(404).json({ success: false, msg: 'Category to delete not found' });
    }

    const associatedNews = await News.find({ category: req.params.id });

    if (associatedNews.length > 0) {
      // If a new category is provided, re-assign articles
      if (newCategoryId) {
        const newCategory = await Category.findById(newCategoryId);
        if (!newCategory) {
            return res.status(404).json({ success: false, msg: 'The new category for re-assignment was not found.'});
        }
        await News.updateMany({ category: req.params.id }, { $set: { category: newCategoryId } });
      } else {
        // If NO new category is provided, delete all associated articles (and their comments via middleware)
        // Also delete images from Cloudinary
        const publicIds = associatedNews.map(news => news.cloudinaryPublicId).filter(id => id);
        if (publicIds.length > 0) {
            await cloudinary.api.delete_resources(publicIds);
        }
        await News.deleteMany({ category: req.params.id });
      }
    }

    // Now, delete the category
    await categoryToDelete.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};