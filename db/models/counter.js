const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    counter: {
        type: Number,
        required: true,
        min: 0
    }
});

const Counter = mongoose.model('Counter', CounterSchema);

module.exports = { Counter };