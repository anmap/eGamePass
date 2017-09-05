// Import configurations
require('./config');

// Import libraries and frameworks
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
//const cors = require('cors');

// Import DB & models
const { mongoose } = require('./db/mongoose'); // (This will connect to DB)

// Cross Domain setup
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, x-vkoys-vttt-auth');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

// Setup express and middlewares
let app = express();
app.pre(allowCrossDomain);
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