const mongoose = require('mongoose');
const _ = require('lodash');
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
        unique: true,
        // validate: {
        //     validator: validator.isEmail,
        //     message: `Not a valid email`
        // }
        sparse: true
    },
    tel: {
        type: Number,
        unique: true,
        sparse: true
    },
    numberOfTickets: {
        type: Number,
        required: true
    },
    numberOfPaidTickets: {
        type: Number,
        required: true,
        default: 0
    },
    bookingCode: {
        type: String,
        required: true,
        maxlength: 8,
        minlength: 8,
        unique: true
    },
    checkin: {
        type: Boolean,
        required: true,
        default: false
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

// Statics methods
BookingSchema.statics.getAllBookingCodes = async function() {
    let Booking = this;

    try {
        let bookingCodes = await Booking.find({}, '-_id bookingCode');
        return _.map(bookingCodes, obj => obj.bookingCode);
    } catch (error) {
        console.log(error);
        return Promise.reject();
    }
}

BookingSchema.statics.generateBookingCode = function() {
    let text = "";
    const POSSIBLE_OCCURANCES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (let i = 0; i < 8; i++)
      text += POSSIBLE_OCCURANCES.charAt(Math.floor(Math.random() * POSSIBLE_OCCURANCES.length));

    return text;
}

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = { Booking };