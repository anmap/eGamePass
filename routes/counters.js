const express = require('express');
const _ = require('lodash');
const { auth } = require('./../middlewares/auth');

const { Counter } = require('./../db/models/counter');
const { Player } = require('./../db/models/player');

const { ROLES } = require('./../config/roles');

let countersRoutes = express.Router();

countersRoutes.get('/remaining-food-credits', auth, async(req, res) => {
    // Access level check (hardcoded)
    if ([ROLES.ADMIN, ROLES.TICKET_SELLER].indexOf(req.user.role) === -1) {
        return res.status(403).send();
    } 

    try {
        let allFoodCredits = await Player.find({}, 'food.credit');
        let foodCreditSum;

        if (allFoodCredits.length > 0) {
            foodCreditSum = _.reduce(allFoodCredits, (memo, obj) => memo + obj.food.credit, 0);
        } else {
            foodCreditSum = 0;
        }
        
        let foodSupply = await Counter.findOne({ name: 'food-supply' });
        if (!foodSupply) {
            return res.status(404).send();
        }
        res.send({
            name: 'remaning-food-credits',
            counter: foodSupply.counter - foodCreditSum
        });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

countersRoutes.get('/:name', auth, async (req, res) => {
    let counterName = req.params.name;

    // Access level check (hardcoded)
    if (counterName === 'food-remaining') {
        if ([ROLES.ADMIN, ROLES.FOOD_STANDER, ROLES.TICKET_SELLER].indexOf(req.user.role) === -1) {
            return res.status(403).send();
        }
    }   

    try {
        let counter = await Counter.findOne({ name: counterName });

        if (!counter) {
            res.status(404).send();
        }

        res.send(counter);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

module.exports = countersRoutes;