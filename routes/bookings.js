const express = require('express');
const { auth } = require('./../middlewares/auth');

let bookingsRoutes = express.Router();

bookingsRoutes.post('/');

bookingsRoutes.get('/');

bookingsRoutes.get('/:id');

bookingsRoutes.patch('/:id');

bookingsRoutes.delete('/:id');

module.exports = bookingsRoutes;