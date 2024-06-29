const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    author: {
        type: String, // name
        required: true,
    },
    authorDetails: {
        name: {
            type: String, // name
        },
        username: {
            type: String,
        },
        avatarPath: {
            type: String,
        },
        rating: {
            type: Number,
            min: 1,
            max: 10,
        },
    },
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    url: {
        type: String,
    },
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;