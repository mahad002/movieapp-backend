const express = require('express');
const router = express.Router();
require("dotenv").config();
const Type = require('../models/type');
const UserAuth = require('../middlewares/UserAuth');

router.post('/add', async (req, res) => {
    try {
        const movieIds = req.body.movieIds; // Expecting an array of movieIds
        const type = req.body.type;

        console.log('MovieIds:', movieIds);
        console.log('Type:', type);

        const existingType = await Type.findOne({ name: type });

        if (existingType) {
            if (!Array.isArray(existingType.movieIds)) {
                existingType.movieIds = [existingType.movieIds];
            }
            existingType.movieIds = [...existingType.movieIds, ...movieIds];
            await existingType.save();
        } else {
            const newType = new Type({ name: type, movieIds: movieIds });
            await newType.save();
        }

        res.status(200).json({ success: true, message: 'Movies added to type successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/all', async (req, res) => {
    try {
        const types = await Type.find({});
        res.status(200).json({ success: true, types });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:type', async (req, res) => {
    try {
        const type = req.params.type;
        const page = req.query.page || 1; 
        const pageSize = 20; 

        const typeData = await Type.findOne({ name: type });

        if (!typeData) {
            return res.status(404).json({ error: 'Type not found' });
        }

        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;
        const paginatedMovieIds = typeData.movieIds.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            type: typeData.name,
            movieIds: paginatedMovieIds,
            totalPages: Math.ceil(typeData.movieIds.length / pageSize),
            currentPage: page,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;