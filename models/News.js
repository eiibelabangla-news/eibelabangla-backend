// models/News.js

import mongoose from 'mongoose';
import Comment from './Comment.js';

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [200, 'Title can not be more than 200 characters'],
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: true,
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  featuredImage: {
    type: String,
    default: 'no-photo.jpg',
  },
  cloudinaryPublicId: {
    type: String,
  },
  views: {
    type: Number,
    default: 0,
  },
  // SEO Fields
  metaTitle: {
      type: String,
      maxlength: [160, 'Meta title cannot be more than 160 characters']
  },
  metaDescription: {
      type: String,
      maxlength: [300, 'Meta description cannot be more than 300 characters']
  },
  metaKeywords: {
      type: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


// Middleware to cascade delete comments when news articles are deleted
NewsSchema.pre('deleteMany', { document: false, query: true }, async function (next) {
    const newsIds = await this.model.find(this.getFilter()).select('_id');
    const ids = newsIds.map(n => n._id);
    if (ids.length > 0) {
        await Comment.deleteMany({ news: { $in: ids } });
    }
    next();
});

export default mongoose.model('News', NewsSchema);