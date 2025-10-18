import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
}, {
    timestamps: true,
});

export default mongoose.model('Category', CategorySchema);
