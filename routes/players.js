const express = require('express');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
const { auth } = require('./../middlewares/auth');

const { Ticket } = require('./../db/models/ticket');
const { Player } = require('./../db/models/player');
const { User } = require('./../db/models/user');

const { ROLES } = require('./../config/roles');

let playersRoutes = express.Router();

// Insert new player
playersRoutes.post('/:ticketId', auth, async (req, res) => {
    // Access level check (hardcoded)
    if ([ROLES.ADMIN, ROLES.TICKET_SELLER].indexOf(req.user.role) === -1) {
        return res.status(403).send();
    }  

    try {
        let ticketId = req.params.ticketId;

        if (!ObjectID.isValid(ticketId)) {
            return res.status(400).send();
        }
        
        let body = _.pick(req.body, ['name', 'age']);
        body._creator = req.user._id;

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
    // Access level check (hardcoded)
    if ([ROLES.ADMIN, ROLES.TICKET_SELLER].indexOf(req.user.role) === -1) {
        return res.status(403).send();
    }

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
    let playerId = req.params.id;
    
    if (!ObjectID.isValid(playerId)) {
        return res.status(400).send();
    }

    try {
        // Get player info
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
    // Access level check (hardcoded)
    if ([ROLES.ADMIN, ROLES.GAME_STANDER].indexOf(req.user.role) === -1) {
        return res.status(403).send();
    }

    let playerId = req.params.id;
    
    if (!ObjectID.isValid(playerId)) {
        return res.status(400).send();
    }

    try {
        // Check player credits
        let player = await Player.findById(playerId);

        if ((player.games.credit - player.games.used) < 1) {
            return res.status(400).send(`${player.name} (ID: ${player._id}) đã hết lượt chơi.`);
        }

        if (player.games.initLock) {
            if (player.games.initGames.indexOf(req.user.game) > -1) {
                return res.status(400).send(`${player.name} (ID: ${player._id}) đã chơi trò này trong 5 lượt đầu.`)
            }

            player.games.initGames.push(req.user.game);

            // Remove init lock for player when 5 separate games are played
            if (player.games.initGames.length === 5) {
                player.games.initLock = false;
            }

            await player.save();
        }

        let updatedPlayer = await Player.findByIdAndUpdate(playerId, {
            $inc: {
                "games.used": 1
            }
        }, { new: true });

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
    // Access level check (hardcoded)
    if ([ROLES.ADMIN, ROLES.TICKET_SELLER].indexOf(req.user.role) === -1) {
        return res.status(403).send();
    }

    let playerId = req.params.id;
    let numberOfCredits = req.params.credit;

    if (!ObjectID.isValid(playerId) || isNaN(numberOfCredits)) {
        return res.status(400).send();
    }

    try {
        let updatedPlayer = await Player.findByIdAndUpdate(playerId, {
            $inc: {
                "games.credit": numberOfCredits
            }
        }, { new: true });
        
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
    // Access level check (hardcoded)
    if ([ROLES.ADMIN, ROLES.FOOD_STANDER].indexOf(req.user.role) === -1) {
        return res.status(403).send();
    }

    let playerId = req.params.id;
    
    if (!ObjectID.isValid(playerId)) {
        return res.status(400).send();
    }

    try {
        // Check player credits
        let player = await Player.findById(playerId);
        
        if ((player.food.credit - player.food.used) < 1) {
            return res.status(400).send(`${player.name} (ID: ${player._id}) đã hết lượt ăn.`);
        }

        let updatedPlayer = await Player.findByIdAndUpdate(playerId, {
            $inc: {
                "food.used": 1
            }
        }, { new: true });

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
    // Access level check (hardcoded)
    if ([ROLES.ADMIN, ROLES.TICKET_SELLER].indexOf(req.user.role) === -1) {
        return res.status(403).send();
    }

    let playerId = req.params.id;
    let numberOfCredits = req.params.credit;

    if (!ObjectID.isValid(playerId) || isNaN(numberOfCredits)) {
        return res.status(400).send();
    }

    try {

        let updatedPlayer = await Player.findByIdAndUpdate(playerId, {
            $inc: {
                "food.credit": numberOfCredits
            }
        }, { new: true });
        
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