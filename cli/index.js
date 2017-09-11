const yargs = require('yargs');

// Import DB
const { mongoose } = require('./../db/mongoose'); // (This will connect to DB)

const { generateTickets } = require('./tickets');
const { insertSeed } = require('./tickets');

let argv = yargs.argv;

let command = argv._[0];

if (command === 'generate-tickets') {
    generateTickets(10);
} else if (command === 'seed-tickets') {
    insertSeed();
}