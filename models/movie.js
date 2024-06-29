const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    adult: {
        type: Boolean,
        required: true,
    },
    backdrop_path: {
        type: String,
        required: true,
    },
    genre_ids: {
        type: [Number],
        required: true,
    },
    id: {
        type: Number,
        required: true,
    },
    original_language: {
        type: String,
        required: true,
    },
    original_title: {
        type: String,
        required: true,
    },
    overview: {
        type: String,
        required: true,
    },
    popularity: {
        type: Number,
        required: true,
    },
    poster_path: {
        type: String,
        required: true,
    },
    release_date: {
        type: Date,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    video: {
        type: Boolean,
        required: true,
    },
    vote_average: {
        type: Number,
        required: true,
    },
    vote_count: {
        type: Number,
        required: true,
    },
    belongs_to_collection: {
        type: Object,
    },
    budget: {
        type: Number,
    },
    genres: {
        type: [{
            id: Number,
            name: String,
        }],
    },
    homepage: {
        type: String,
    },
    imdb_id: {
        type: String,
    },
    production_companies: {
        type: [{
            id: Number,
            logo_path: String,
            name: String,
            origin_country: String,
        }],
    },
    production_countries: {
        type: [{}],
    },
    revenue: {
        type: Number,
    },
    runtime: {
        type: Number,
    },
    spoken_languages: {
        type: [{}],
    },
    status: {
        type: String,
    },
    tagline: {
        type: String,
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'reviews'
    }],
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;