const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    age: {
        type: Number,
        required: true
    },
    games: {
        credit: {
            type: Number,
            required: true,
            default: 5
        },
        used: { 
            type: Number,
            required: true,
            default: 0
        },
        initLock: {
            type: Boolean,
            required: true,
            default: true
        },
        initGames: [
            {
                type: String
            }
        ]
    },
    food: {
        credit: {
            type: Number,
            required: true,
            default: 1
        },
        used: {
            type: Number,
            required: true,
            default: 0
        }
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

const Player = mongoose.model('Player', PlayerSchema);

module.exports = { Player };