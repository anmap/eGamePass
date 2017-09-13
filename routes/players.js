const express = require('express');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
const { auth } = require('./../middlewares/auth');

const { Player } = require('./../db/models/player');
const { Ticket } = require('./../db/models/ticket');
const { Booking } = require('./../db/models/booking');
const { Counter } = require('./../db/models/counter');

const { ROLES } = require('./../config/roles');

let playersRoutes = express.Router();

// Insert new player
playersRoutes.post('/:ticketId/:bookingId?', auth, async (req, res) => {
    // Define roles
    let acceptedRoles;
    if (req.params.bookingId) {
        acceptedRoles = [ROLES.ADMIN, ROLES.BOOKER];
    } else {
        acceptedRoles = [ROLES.ADMIN, ROLES.TICKET_SELLER];
    }
    // Access level check (hardcoded)
    if (acceptedRoles.indexOf(req.user.role) === -1) {
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

        // if player's gonna be linked with a booking, check if booking if exists
        if (req.params.bookingId) {            
            let bookingId = req.params.bookingId;
            console.log('Activate booking', bookingId);

            if (!ObjectID.isValid(bookingId)) {
                return res.status(400).send();
            }

            let booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).send();
            }
            body._booking = booking._id;
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

    if (!ObjectID.isValid(playerId) || isNaN(numberOfCredits) || numberOfCredits < 1 || numberOfCredits % 1 !== 0) {
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

    let foodCounter = await Counter.findOne({
        name: 'food-remaining'
    });

    if (foodCounter.counter === 0) {
        return res.status(400).send(`Đã hết phần thực phẩm.`)
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
        }, { new: true }).lean();

        if (!updatedPlayer) {
            return res.status(404).send();
        }

        // Update food counter
        await Counter.findOneAndUpdate({
            name: 'food-remaining'
        }, {
            $inc: {
                "counter": -1
            }
        }, { new: true });

        res.send(updatedPlayer);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

// Deposit credit for food
playersRoutes.patch('/:id/food/deposit', auth, async (req, res) => {
    // Access level check (hardcoded)
    if ([ROLES.ADMIN, ROLES.TICKET_SELLER].indexOf(req.user.role) === -1) {
        return res.status(403).send();
    }

    let foodCounter = await Counter.findOne({
        name: 'food-remaining'
    });

    if (foodCounter.counter === 0) {
        return res.status(400).send(`Đã hết phần thực phẩm.`);
    }

    let playerId = req.params.id;

    if (!ObjectID.isValid(playerId)) {
        return res.status(400).send();
    }

    try {
        let updatedPlayer = await Player.findByIdAndUpdate(playerId, {
            $inc: {
                "food.credit": 1
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
playersRoutes.patch('/transfer-credits/:id1/:id2/:credit', auth, async (req, res) => {
    // Access level check (hardcoded)
    if ([ROLES.ADMIN, ROLES.CREDIT_TRANSFERER].indexOf(req.user.role) === -1) {
        return res.status(403).send();
    }    

    let playerOneId = req.params.id1;
    let playerTwoId = req.params.id2;
    let numberOfCredits = req.params.credit;

    if (playerOneId === playerTwoId) {
        return res.status(400).send();
    }

    if (!ObjectID.isValid(playerOneId) || !ObjectID.isValid(playerTwoId) || isNaN(numberOfCredits) || numberOfCredits < 1 ||  numberOfCredits % 1 !== 0) {
        return res.status(400).send();
    }

    try {
        let playerOne = await Player.findById(playerOneId);
        let playerTwo = await Player.findById(playerTwoId);
        
        if (!playerOne || !playerTwo) {
            return res.status(404).send();
        }

        // Check if the transferred credit is larger than Player 1's remaining credit
        if ((playerOne.games.credit - playerOne.games.used) < numberOfCredits) {
            return res.status(400).send();
        }

        // Remove credits from first plyaer
        let playerOneUpdated = await Player.findByIdAndUpdate(playerOneId, {
            $inc: {
                "games.credit": -numberOfCredits
            }
        }, { new: true });
        // Add credits to second player
        let playerTwoUpdated = await Player.findByIdAndUpdate(playerTwoId, {
            $inc: {
                "games.credit": numberOfCredits
            }
        }, { new: true });

        res.send({
            transferring_player: playerOneUpdated,
            received_player: playerTwoUpdated 
        });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

module.exports = playersRoutes;