const Utils = require('../utils');

module.exports = {
    START(char) {
        let nextState = 'END';
        let readChar = false;

        if (Utils.isWhiteSpace(char)) {
            nextState = 'WHITESPACES';
            readChar = true;
        }

        return {
            nextState,
            readChar,
        };
    },

    WHITESPACES(char) {
        let nextState = 'END';
        let readChar = false;

        if (Utils.isWhiteSpace(char)) {
            nextState = 'WHITESPACES';
            readChar = true;
        }

        return {
            nextState,
            readChar,
        };
    },
};
