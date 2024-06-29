// Assuming you are using Express.js
const express = require('express');
const router = express.Router();
const Review = require('../models/review'); // Adjust the path accordingly
const getReviewById = require('../middlewares/GetReviewById'); // Adjust the path accordingly

// Endpoint to get all reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint to get a specific review by ID
router.get('/:id', getReviewById, (req, res) => {
    res.json(res.review);
});

// Endpoint to create a new review
router.post('/', async (req, res) => {
    const review = new Review({
        author: req.body.author,
        authorDetails: req.body.authorDetails,
        content: req.body.content,
        url: req.body.url,
    });

    try {
        const newReview = await review.save();
        res.status(201).json(newReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Middleware function to get a review by ID
async function getReview(req, res, next) {
    let review;
    try {
        review = await Review.findById(req.params.id);
        if (review == null) {
            return res.status(404).json({ message: 'Review not found' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

    res.review = review;
    next();
}

// Endpoint to update a review by ID
router.patch('/:id', getReview, async (req, res) => {
    if (req.body.author != null) {
        res.review.author = req.body.author;
    }

    if (req.body.authorDetails != null) {
        res.review.authorDetails = req.body.authorDetails;
    }

    if (req.body.content != null) {
        res.review.content = req.body.content;
    }

    if (req.body.url != null) {
        res.review.url = req.body.url;
    }

    try {
        const updatedReview = await res.review.save();
        res.json(updatedReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Endpoint to delete a review by ID
router.delete('/:id', getReview, async (req, res) => {
    try {
        await res.review.remove();
        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
