const express = require('express');
const { auth } = require('./../middlewares/auth');

const { Counter } = require('./../db/models/counter');

const { ROLES } = require('./../config/roles');

let countersRoutes = express.Router();

countersRoutes.get('/:name', auth, async (req, res) => {
    let counterName = req.params.name;

    // Access level check (hardcoded)
    if (counterName === 'food') {
        if ([ROLES.ADMIN, ROLES.FOOD_STANDER, ROLES.TICKET_SELLER].indexOf(req.user.role) === -1) {
            return res.status(403).send();
        }
    }   

    try {
        let counter = await Counter.findOne({
            name: counterName
        });

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