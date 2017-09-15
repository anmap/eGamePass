const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const { GAMES } = require('./../../config/games');

// Setup UserSchema
const LogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    _user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    detail: {
        type: Object
    }
});

// Create User model
const Log = mongoose.model('Log', LogSchema);

module.exports = { Log };