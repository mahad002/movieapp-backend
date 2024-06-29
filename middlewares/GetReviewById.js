const Review = require('../models/review'); 

async function getReviewById(req, res, next) {
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

module.exports = getReviewById;
