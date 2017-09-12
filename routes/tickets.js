const express = require('express');
const { auth } = require('./../middlewares/auth');

const { Ticket } = require('./../db/models/ticket');
const { Player } = require('./../db/models/player');

let ticketsRoutes = express.Router();

ticketsRoutes.get('/', auth, async (req, res) => {
    try {
        let tickets = await Ticket.find({}, '-_id -__v');

        let string = tickets.reduce((memo, ticket) => memo + JSON.stringify(ticket), "");

        res.send(tickets);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

ticketsRoutes.get('/:serialNumber', auth, async (req, res) => {
    try {
        // Get ticket info
        let serialNumber = req.params.serialNumber.toUpperCase();
        let ticket = await Ticket.findOne({ serialNumber }).lean();
        if (!ticket) {
            return res.status(404).send();
        }

        // If there's player linked with ticket, attach player info
        if (ticket._player) {
            let player = await Player.findById(ticket._player);
            ticket.playerInfo = player;
        }

        res.send(ticket);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

module.exports = ticketsRoutes;