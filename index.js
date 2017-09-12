// Import configurations
require('./config');

// Import libraries and frameworks
const path = require('path');
const fs = require('fs');
const https = require('https');
const _ = require('lodash');
const express = require('express');
const secure = require('express-force-https');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

// Import DB & models
const { mongoose } = require('./db/mongoose'); // (This will connect to DB)

// Setup express and middlewares
let app = express();

if (process.env.NODE_ENV === 'production') {
    app.use(secure);
}

app.use(bodyParser.json()); // Configure app to use JSON
// Routes
app.use('/users', require('./routes/users'));
app.use('/bookings', require('./routes/bookings'));
app.use('/tickets', require('./routes/tickets'));
app.use('/players', require('./routes/players'));
app.use('/counters', require('./routes/counters'));


// Setup static page
app.use('/', express.static(path.join(__dirname, 'statics')));

if (process.env.NODE_ENV !== 'production') {
    app.listen(process.env.PORT, () => {
        console.log(`App is running on port ${process.env.PORT}...`);
    });
} else {
    const httpsOptions = {
        key: fs.readFileSync('./../key.pem'),
        cert: fs.readFileSync('./../cert.pem')
    }

    const server = https.createServer(httpsOptions, app).listen(process.env.PORT, () => {
        console.log(`App is running securely on port ${process.env.PORT}...`);
    });
}

// Export app for testing
module.exports = { app };