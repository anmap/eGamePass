function getCode(code) {
    if(!code) return;

    // Split code into separate elements
    codeElem = code.split('_');

    // If code couldn't be split into 4 part then it's invalid
    if (codeElem.length !== 4) {
        return console.error('Invalid code!');
    }

    // If the first and the second elements don't match
    // group name and event title then code is invalid
    if (codeElem[0] !== 'VKOYS' || codeElem[1] !== 'VTTT') {
        return console.error('Invalid code!');
    }

    if (codeElem[2] === 'TICKET') {
        if (codeElem[3].length === 5) {
            return {
                type: 'ticket',
                code: codeElem[3]
            }
        } else {
            return console.error('Invalid ticket serial number!');
        }
        
    } else if (codeElem[2] === 'BOOKING') {
        if (codeElem[4].length === 8) {
            return {
                type: 'booking',
                code: codeElem[3]
            }
        } else {
            return console.error('Invalid booking code!');
        }
    } else {
        return console.error('Invalid code!');
    }
}