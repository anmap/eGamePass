const express = require('express');
const _ = require('lodash');
const { auth } = require('./../middlewares/auth');

const { Booking } = require('./../db/models/booking');

let bookingsRoutes = express.Router();

bookingsRoutes.post('/', auth, async (req, res) => {
    let body = _.pick(req.body, ['name', 'email', 'tel', 'numberOfTickets']);

    try {
        let bookingCodes = await Booking.getAllBookingCodes();
        console.log('All current booking codes', bookingCodes);
        let bookingCode;
        do {
            bookingCode = Booking.generateBookingCode();
        } while (bookingCodes.includes(bookingCode));

        body.bookingCode = bookingCode;
        body._creator = req.user._id;

        let booking = await new Booking(body).save();
        res.send(booking);

    } catch (error) {
        res.status(400).send(error);
    }
});

bookingsRoutes.get('/');

bookingsRoutes.get('/:id');

bookingsRoutes.patch('/:id');

bookingsRoutes.delete('/:id');

module.exports = bookingsRoutes;