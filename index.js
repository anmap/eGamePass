// Import configurations
const { APP_NAME, PORT } = require('./config');

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

// Run app on specified PORT (from config.js)
app.listen(PORT, () => {
    console.log(`${APP_NAME} is running on ${PORT}...`);
});

// Export app for testing
module.exports = { app };