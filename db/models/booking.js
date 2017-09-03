const mongoose = require('mongoose');
const validator = require('validator');

const BookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
    },
    email: {
        type: String,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: `Not a valid email`
        }
    },
    tel: {
        type: Number,
        unique: true
    },
    numberOfTickets: {
        type: Number,
        required: true
    },
    bookingCode: {
        type: String,
        required: true,
        maxlength: 8,
        minlength: 8,
        unique: true
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = { Booking };