const express = require('express');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
const { auth } = require('./../middlewares/auth');

const { Ticket } = require('./../db/models/ticket');
const { Player } = require('./../db/models/player');
const { User } = require('./../db/models/user');

let playersRoutes = express.Router();

// Insert new player
playersRoutes.post('/:ticketId', auth, async (req, res) => {
    let ticketId = req.params.ticketId;

    let body = _.pick(req.body, ['name', 'age']);
    body._creator = req.user._id;

    try {
        // Get ticket info
        let ticket = await Ticket.findById(ticketId);

        // Return 404 if ticket does not exist
        if (!ticket) {
            return res.status(404).send();
        }
        
        // Return 401 if ticket is already linked
        if (ticket._player) {
            return res.status(401).send();
        }

        // Create player
        let player = await new Player(body).save();
        player = player.toJSON();

        // Link player with ticket
        await Ticket.findByIdAndUpdate(ticketId, {
            $set: {
                active: true,
                _player: player._id
            }
        });

        player.ticket = ticket.serialNumber;
        res.send(player);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

// Get all players info
playersRoutes.get('/', auth, async (req, res) => {
    try {
        let players = await Player.find({});
        res.send(players);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

// Get player info with id
playersRoutes.get('/:id', auth, async (req, res) => {
    try {
        // Get player info
        let playerId = req.params.id;
        let player = await Player.findById(playerId).lean();
        if (!player) {
            return res.status(404).send();
        }

        // Get linked ticket
        let ticket = await Ticket.findOne({
            _player: playerId
        });

        if (ticket) {
            player.ticket = ticket;
        }

        res.send(player);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

// Charge 1 credit for games
playersRoutes.patch('/:id/games/charge', auth, async (req, res) => {
    try {
        let playerId = req.params.id;
        let updatedPlayer = await Player.findByIdAndUpdate(playerId, {
            $inc: {
                "games.used": 1
            }
        });

        if (!updatedPlayer) {
            return res.status(404).send();
        }

        res.send(updatedPlayer);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

// Deposit credit for games
playersRoutes.patch('/:id/games/deposit/:credit', auth, async (req, res) => {
    try {
        let playerId = req.params.id;
        let numberOfCredits = req.params.credit;

        let updatedPlayer = await Player.findByIdAndUpdate(playerId, {
            $inc: {
                "games.credit": numberOfCredits
            }
        });
        
        if (!updatedPlayer) {
            return res.status(404).send();
        }

        res.send(updatedPlayer);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

// Charge 1 credit for food
playersRoutes.patch('/:id/food/charge', auth, async (req, res) => {
    try {
        let playerId = req.params.id;
        let updatedPlayer = await Player.findByIdAndUpdate(playerId, {
            $inc: {
                "food.used": 1
            }
        });

        if (!updatedPlayer) {
            return res.status(404).send();
        }

        res.send(updatedPlayer);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

// Deposit credit for food
playersRoutes.patch('/:id/food/deposit/:credit', auth, async (req, res) => {
    try {
        let playerId = req.params.id;
        let numberOfCredits = req.params.credit;

        let updatedPlayer =await Player.findByIdAndUpdate(playerId, {
            $inc: {
                "food.credit": numberOfCredits
            }
        });
        
        if (!updatedPlayer) {
            return res.status(404).send();
        }

        res.send(updatedPlayer);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

module.exports = playersRoutes;