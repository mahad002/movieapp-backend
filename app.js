const express = require('express');
const mongoose = require('mongoose');
const UserRoutes = require('./routes/user');
const MovieRoutes = require('./routes/movie');
const TypeRoutes = require('./routes/type');
const ReviewRoutes = require('./routes/review');
const AwsS3Router = require('./routes/upload');
const cors = require('cors');
require('dotenv').config();

// Connect to the database
const url = process.env.MONGODB_URI;

const connectionParams={}

const app = express();

// console.log(url);
mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. ${err}`);
    })

app.use(express.json());
app.use(cors());


app.use('/user', UserRoutes);
app.use('/movie', MovieRoutes);
app.use('/type', TypeRoutes);
app.use('/review', ReviewRoutes);
app.use('/upload', AwsS3Router);

app.listen(5000, () => console.log('Server running on port 5000'));