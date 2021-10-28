const Utils = require('../utils');

module.exports = {
    START(char) {
        let nextState = 'ERROR';

        if (Utils.isDoubleQuote(char)) {
            nextState = 'STRING';
        }

        return {
            nextState,
            skipChar: true,
        };
    },

    STRING(char) {
        let nextState = 'STRING';
        let readChar = true;
        let skipChar = false;

        if (Utils.isDoubleQuote(char)) {
            skipChar = true;
            readChar = false;
            nextState = 'END';
        } else if (Utils.isNewLine(char) || char === null) {
            nextState = 'ERROR';
            readChar = false;
        } else if (Utils.isBackslash(char)) {
            nextState = 'ESCAPE';
            readChar = true;
        }

        return {
            nextState,
            readChar,
            skipChar,
        };
    },

    ESCAPE(char) {
        let nextState = 'ERROR';
        let readChar = false;

        if ('"/\\bfnrt'.indexOf(char) !== -1) {
            nextState = 'STRING';
            readChar = true;
        } else if (char === 'u') {
            nextState = 'UNICODE_FIRST_NUMBER';
            readChar = true;
        }

        return {
            nextState,
            readChar,
        };
    },

    UNICODE_FIRST_NUMBER(char) {
        let nextState = 'ERROR';
        let readChar = false;

        if (Utils.isHexadecimal(char)) {
            nextState = 'UNICODE_SECOND_NUMBER';
            readChar = true;
        }

        return {
            nextState,
            readChar,
        };
    },

    UNICODE_SECOND_NUMBER(char) {
        let nextState = 'ERROR';
        let readChar = false;

        if (Utils.isHexadecimal(char)) {
            nextState = 'UNICODE_THIRD_NUMBER';
            readChar = true;
        }

        return {
            nextState,
            readChar,
        };
    },

    UNICODE_THIRD_NUMBER(char) {
        let nextState = 'ERROR';
        let readChar = false;

        if (Utils.isHexadecimal(char)) {
            nextState = 'UNICODE_FORTH_NUMBER';
            readChar = true;
        }

        return {
            nextState,
            readChar,
        };
    },

    UNICODE_FORTH_NUMBER(char) {
        let nextState = 'ERROR';
        let readChar = false;

        if (Utils.isHexadecimal(char)) {
            nextState = 'STRING';
            readChar = true;
        }

        return {
            nextState,
            readChar,
        };
    },
};
