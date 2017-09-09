const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        minlength: 1
    }
});

const Game = mongoose.model('Game', GameSchema);

module.exports = { Game };