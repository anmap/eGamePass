const express = require('express');
const { auth } = require('./../middlewares/auth');

let usersRoutes = express.Router();

usersRoutes.get('/');

usersRoutes.post('/');

usersRoutes.post('/login');

module.exports = usersRoutes;