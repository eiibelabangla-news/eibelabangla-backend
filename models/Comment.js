// models/Comment.js

import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Please add some text'],
        maxlength: [1000, 'Comment can not be more than 1000 characters']
    },
    authorName: {
        type: String,
        required: [true, 'Please add your name'],
        default: 'Anonymous'
    },
    news: {
        type: mongoose.Schema.ObjectId,
        ref: 'News',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Comment', CommentSchema);

