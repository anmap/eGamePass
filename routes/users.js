const express = require('express');
const _ = require('lodash');

const { auth } = require('./../middlewares/auth');

const { User } = require('./../db/models/user');

let usersRoutes = express.Router();

usersRoutes.get('/', async (req, res) => {
    res.send('Users route')
});

usersRoutes.post('/', async (req, res) => {    
    try {
        let body = _.pick(req.body, ['username', 'name', 'password']);
        console.log('body', body)
        let user = new User(body);
        await user.save();
        let token = await user.generateAuthToken(); 
        res.header(process.env.AUTH_HEADER, token).send(user);
    } catch (error) {
        res.status(400).send(error)
    }
});

usersRoutes.post('/login', async (req, res) => {
    try {
        let body = _.pick(req.body, ['username', 'password']);
        let user = await User.findByCredentials(body.username, body.password);
        let token = await user.generateAuthToken();
        res.header(process.env.AUTH_HEADER, token).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

usersRoutes.get('/me', auth, (req, res) => {
    res.send(req.user);
});

usersRoutes.delete('/logout', auth, async (req, res) => {
    try {
        await req.user.removeToken(req.token)
        res.send();
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = usersRoutes;