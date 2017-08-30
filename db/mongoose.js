const mongoose = require('mongoose');

const { MONGODB_URI } = require('./../config')

// Setup promise for mongoose
mongoose.Promise = global.Promise;

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
    useMongoClient: true
});

module.exports = { mongoose };