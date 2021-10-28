const Utils = require('../utils');

module.exports = {
    START(char) {
        let nextState = 'ERROR';
        let readChar = false;

        if (Utils.isMinusSign(char)) {
            nextState = 'INTEGER';
            readChar = true;
        } else if (Utils.isOneNineDigit(char)) {
            nextState = 'INTEGER';
        } else if (Utils.isZeroDigit(char)) {
            nextState = 'START_WITH_ZERO';
            readChar = true;
        }

        return {
            nextState, readChar,
        };
    },

    START_WITH_ZERO(char) {
        let nextState = 'END';
        let readChar = false;

        if (Utils.isDot(char)) {
            nextState = 'FRACTION_START';
            readChar = true;
        } else if (Utils.isExponent(char)) {
            nextState = 'EXPONENT_SIGN';
            readChar = true;
        }

        return {
            nextState, readChar,
        };
    },

    INTEGER(char) {
        let nextState = 'END';
        let readChar = false;

        if (Utils.isDigit(char)) {
            nextState = 'INTEGER';
            readChar = true;
        } else if (Utils.isDot(char)) {
            nextState = 'FRACTION_START';
            readChar = true;
        } else if (Utils.isExponent(char)) {
            nextState = 'EXPONENT_SIGN';
            readChar = true;
        }

        return {
            nextState, readChar,
        };
    },

    FRACTION_START(char) {
        let nextState = 'ERROR';
        const readChar = false;

        if (Utils.isDigit(char)) {
            nextState = 'FRACTION';
        }

        return {
            nextState, readChar,
        };
    },

    FRACTION(char) {
        let nextState = 'END';
        let readChar = false;

        if (Utils.isDigit(char)) {
            nextState = 'FRACTION';
            readChar = true;
        } else if (Utils.isExponent(char)) {
            nextState = 'EXPONENT_SIGN';
            readChar = true;
        }

        return {
            nextState, readChar,
        };
    },

    EXPONENT_SIGN(char) {
        let nextState = 'ERROR';
        let readChar = false;

        if (Utils.isMinusSign(char) || Utils.isPlusSign(char)) {
            nextState = 'EXPONENT';
            readChar = true;
        } else if (Utils.isDigit(char)) {
            nextState = 'EXPONENT';
            readChar = true;
        }

        return {
            nextState, readChar,
        };
    },

    EXPONENT(char) {
        let nextState = 'END';
        let readChar = false;

        if (Utils.isDigit(char)) {
            nextState = 'EXPONENT';
            readChar = true;
        }

        return {
            nextState, readChar,
        };
    },
};
