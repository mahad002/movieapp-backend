const mongoose = require('mongoose');
const Router = require('express').Router;
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { json } = require('express');
const jwt = require('jsonwebtoken');
const UserAuth = require('../middlewares/UserAuth');
require('dotenv').config();


const router = new Router();

const Secret = process.env.SECRET;

// router.post('/register', async (req, res) => {
//     try {
//         console.log(req.body);
//         const name = req.body.name;
//         const email = req.body.email;
//         const password = await bcrypt.hash(req.body.password, 10);
//         const user = new User({ name, email, password });
//         await user.save();
//         res.json(user);
//     }
//     catch (err) {
//         console.log('Error in registration');
//         res.json(err);

//     }
// });

// router.post('/login', async (req, res) => {
//     const { name, password } = req.body;

//     try {
//         const user = await User.findOne({ name });

//         if (!user) {
//             return res.status(400).json({ error: 'User not found' });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         console.log(isMatch);
//         if (!isMatch) {
//             return res.status(400).json({ error: 'Invalid credentials' });
//         }

//         //generate token
//         const token = jwt.sign({ id: user._id , name: user.name}, Secret);
       

//         user.token = token;
//         await user.save();

//         res.json({ token });


//     } catch (error) {
//         console.error(error.message);
//         res.status(400).json({ error: 'Invalid credentials' });
//     }

// }); 

// router.put('/update-password', UserAuth, async (req, res) => {
//     try {
//         const { name, password } = req.body;

//         const user = await User.findOne({ name });

//         if (!user) {
//             return res.status(400).json({ error: 'User not found' });
//         }

//         // Update the password
//         user.password = await bcrypt.hash(password, 10);
//         await user.save();

//         res.json('Password updated successfully');
//     } catch (err) {
//         console.error('Error in updating password:', err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// router.post ('/logout', UserAuth, async (req, res) => {
//     try {
//         const user = req.user;
//         user.token = '';
//         await user.save();

//         res.json('Logged out successfully');
//     } catch (err) {
//         console.error('Error in logging out:', err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// SignUp Route

router.post('/signup', async (req, res) => {
    try {
        const existingUser = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.email }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create a new user
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            name: req.body.name,
            role: req.body.role,
            profilePicture: req.body.profilePicture,
            bio: req.body.bio,
            following: [],
            followers: [],
            reviews: []
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// SignIn Route
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // Generate and send JWT token
        const token = jwt.sign({ userId: user._id }, Secret);
        const message = `Welcome, ${user.username}!`;
        const isAuthenticated = true;
        res.status(200).json({ token, isAuthenticated, user, message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/update-username', UserAuth, async (req, res) => {
    try {
        // Check if the user has changed the username within the last 2 days
        const user = await User.findById(req.userId);

        if (user.lastUsernameChange && new Date() - user.lastUsernameChange < 2 * 24 * 60 * 60 * 1000) {
            return res.status(400).json({ error: 'You can change your username only twice in 2 days.' });
        }

        // Update the username
        user.username = req.body.username;
        user.usernameChangeCount += 1;
        user.lastUsernameChange = new Date();

        await user.save();
        res.status(200).json({ message: 'Username updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update Password Route
router.put('/update-password', UserAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        // Validate old password
        const passwordMatch = await bcrypt.compare(req.body.oldPassword, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid old password.' });
        }

        // Update the password
        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
        user.password = hashedPassword;

        await user.save();
        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// authenticated
router.get('/authenticated', UserAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user) {
            user.authenticated = true; // update the authenticated field
            await user.save(); // save the updated user document
        }
        res.status(200).json({ isAuthenticated: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Movie Review Route
router.post('/review/:movieId', UserAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        // Check if the user has already reviewed the movie
        const existingReview = user.reviews.find(review => review.movieId.toString() === req.params.movieId);

        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this movie.' });
        }

        // Add the review
        const newReview = {
            movieId: req.params.movieId,
            rating: req.body.rating,
            comment: req.body.comment,
        };

        user.reviews.push(newReview);
        await user.save();
        res.status(201).json({ message: 'Review added successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// router.get('/authenticated', passport.authenticate('jwt', { session: false }), (req, res) => {
//     const { username, role } = req.user;
//     res.status(200).json({ isAuthenticated: true, user: { username, role } });
// });

// router.get('/logout', passport.authenticate('jwt', { session: false }), (req, res) => {
//     res.clearCookie('access_token');
//     res.status(200).json({ user: { username: "", role: "" }, success: true });
// });


module.exports = router;