const _ = require('lodash');
const { ObjectID } = require('mongodb');

const { Ticket } = require('./../db/models/ticket');
const { Player } = require('./../db/models/player');

const generateTickets = async (numberOfTickets) => {
    try {
        console.log('Generating serial numbers...')
        
        let allSerialNumbers = await Ticket.getAllSerialNumbers();
    
        let newSerialNumbers = [];
    
        for (let i = 0; i < numberOfTickets; i++) {
            let newSerialNumber;
    
            do {
                newSerialNumber = generateSerialNumber();
            } while (allSerialNumbers.indexOf(newSerialNumber) > -1);
    
            newSerialNumbers.push({ serialNumber: newSerialNumber });
        }
    
        console.log('Generated serial numbers', newSerialNumbers);
        console.log('Inserting to database...');
    
        await Ticket.insertMany(newSerialNumbers);
    
        console.log('Operation done!');
    } catch (error) {
        console.error(error);
    }
}

const generateSerialNumber = () => {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  
    for (let i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}

module.exports = { 
    generateTickets
};