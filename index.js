// Import configurations
require('./config');

// Import libraries and frameworks
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

// Import DB & models
const { mongoose } = require('./db/mongoose'); // (This will connect to DB)

// Setup express and middlewares
let app = express();
app.use(bodyParser.json()); // Configure app to use JSON

// Routes
app.use('/users', require('./routes/users'));
app.use('/bookings', require('./routes/bookings'))

// Run app on specified PORT (from config.js)
app.listen(process.env.PORT, () => {
    console.log(`App is running on port ${process.env.PORT}...`);
});

// Export app for testing
module.exports = { app };