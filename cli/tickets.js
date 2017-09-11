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
            } while (allSerialNumbers.indexOf(newSerialNumber) > -1 && newSerialNumbers.indexOf(newSerialNumber) > -1);
    
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

const insertSeed = async () => {
    let seedSeriesNumbers = [
        '2DR2A',
        'D14DD',
        'PZSI0',
        'CKHNZ',
        'JIXKC',
        'MNU0J',
        'DYUV6',
        'BV5OI',
        'CN38N',
        'FUJL8',
        '25X57',
        'T6OZC',
        'O71GV',
        'FXE92',
        '1U3NV',
        'FE7W7',
        'I47P3',
        'QKZ2L',
        'D38BP',
        'T6H8S',
        'DZE78',
        'R84HD',
        'L54KQ',
        'D9DCX',
        '4SZ49',
        'IYX3D',
        '4WBOI',
        'B67NF',
        'B55XL',
        '1J1RT',
        'G0Q21',
        'LES8F',
        '60Y39',
        'JTXP3',
        '3L9BM',
        'K71FG',
        'UTP9T',
        'YO68B',
        '4KJLN',
        'UH5LG',
        'WI957',
        'RDJ4J',
        'V91VI',
        'DRE3Q',
        'VOG3K',
        'WY54Q',
        'W2E1M',
        'H8E2S',
        'XB5GL',
        '9HNM9',
        'E5X7T',
        '77MBT',
        '1HCDO',
        'RG795',
        'L79XW',
        'Q1R1O',
        'AJ3T5',
        'Y6QK9',
        '848BK',
        'DTUB1' 
    ];

    let newSerialNumbers = [];
    for (let i = 0; i < seedSeriesNumbers.length; i++) {
        newSerialNumbers.push({ serialNumber: seedSeriesNumbers[i] });
    }
    console.log('Inserting seed serial numbers to database...');
    await Ticket.insertMany(newSerialNumbers);
    console.log('Operation done!');
}

module.exports = { 
    generateTickets,
    insertSeed
};