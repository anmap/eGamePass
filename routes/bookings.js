const express = require('express');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
const { auth } = require('./../middlewares/auth');

const { Booking } = require('./../db/models/booking');
const { User } = require('./../db/models/user');

const { createPDFBooking } = require('./../utilities/pdf_booking');

let bookingsRoutes = express.Router();

bookingsRoutes.post('/', auth, async (req, res) => {
    let body = _.pick(req.body, ['name', 'email', 'tel', 'numberOfTickets']);

    try {
        let bookingCodes = await Booking.getAllBookingCodes();
        let bookingCode;
        do {
            bookingCode = Booking.generateBookingCode();
        } while (bookingCodes.includes(bookingCode));

        body.bookingCode = bookingCode;
        body._creator = req.user._id;

        let booking = await new Booking(body).save();
        booking = booking.toJSON();
        booking.creatorInfo = await User.findById(booking._creator, '-_id username name');
        res.send(booking);

    } catch (error) {
        res.status(400).send(error);
    }
});

bookingsRoutes.get('/', auth, async (req, res) => {
    try {
        let bookings = await Booking.find({}).lean();

        for (var i = 0; i < bookings.length; i++) {
            bookings[i].creatorInfo = await User.findById(bookings[i]._creator, '-_id username name');            
        }

        res.send(bookings);
    } catch (error) {
        res.status(400).send(error);
    }
});

bookingsRoutes.get('/:id', auth, async (req, res) => {
    let bookingId = req.params.id;

    if (!ObjectID.isValid(bookingId)) {
        return res.status(404).send();
    }

    try {
        let booking = await Booking.findById(bookingId).lean();
        booking.creatorInfo = await User.findById(booking._creator, '-_id username name');
        res.send(booking);
    } catch (error) {
        res.status(400).send(error);
    }
});

bookingsRoutes.get('/pdf/:id', async (req, res) => {
    let bookingId = req.params.id;

    if (!ObjectID.isValid(bookingId)) {
        return res.status(404).send();
    }

    try {
        let booking = await Booking.findById(bookingId).lean();
        if (!booking) {
            console.log('Booking not found')
            return new Error();
        }
        createPDFBooking(res, booking.name, booking.email || null, booking.tel || null, booking.numberOfTickets, booking.bookingCode);
    } catch (error) {
        console.log(error)
        res.status(400).send(error);
    }
});

bookingsRoutes.patch('/:id');

bookingsRoutes.delete('/:id');

module.exports = bookingsRoutes;