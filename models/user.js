const mongoose = require('mongoose');
const Review = require('./review'); 

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /[!@#$%^&*(),.?":{}|<>]/.test(value);
            },
            message: props => `${props.value} must contain at least one special character.`,
        },
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'user', // 'user' or 'admin'
    },
    profilePicture: {
        type: String, 
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    bio: {
        type: String,
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
    }],
    usernameChangeCount: {
        type: Number,
        default: 0,
    },
    lastUsernameChange: {
        type: Date,
    },
    authenticated: {
        type: Boolean,
        default: false,
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;