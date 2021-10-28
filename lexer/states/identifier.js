const Utils = require('../utils');

module.exports = {
    START(char) {
        const result = {
            nextState: 'ERROR',
            readChar: false,
        };

        if (char && Utils.isCharacterLetter(char)) {
            result.readChar = true;
            result.nextState = 'IDENTIFIER';
        }

        return result;
    },

    IDENTIFIER(char) {
        const result = {
            nextState: 'END',
            readChar: false,
        };

        if (char && Utils.isCharacterLetter(char)) {
            result.readChar = true;
            result.nextState = 'IDENTIFIER';
        }

        return result;
    },
};
