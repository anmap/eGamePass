const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    serialNumber: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 5,
        unique: true
    },
    active: {
        type: Boolean,
        default: false
    },
    blocked: {
        type: Boolean,
        default: false
    }
});

const Ticket = mongoose.model('Ticket', TicketSchema);

module.exports = { Ticket };