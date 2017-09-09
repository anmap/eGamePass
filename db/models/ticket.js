const mongoose = require('mongoose');
const _ = require('lodash');

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
        required: true,
        default: false
    },
    blocked: {
        type: Boolean,
        required: true,
        default: false
    },
    _player: {
        type: mongoose.Schema.Types.ObjectId
    }
});

TicketSchema.statics.getAllSerialNumbers = async function() {
    let Ticket = this;

    try {
        let serialNumbers = await Ticket.find({}, '-_id serialNumber');
        console.log("SERIAL NUMBERS", serialNumbers);
        return _.map(serialNumbers, obj => obj.serialNumber);
    } catch (error) {
        console.log(error);
        return Promise.reject();
    }
}

const Ticket = mongoose.model('Ticket', TicketSchema);

module.exports = { Ticket };