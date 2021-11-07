const Utils = require('../utils');
const ActionResult = require('../actionresult');

module.exports = {
    START(char) {
        const result = new ActionResult();

        if (Utils.isMinusSign(char)) {
            result.nextState = 'INTEGER';
            result.readChar = true;
        } else if (Utils.isOneNineDigit(char)) {
            result.nextState = 'INTEGER';
        } else if (Utils.isZeroDigit(char)) {
            result.nextState = 'START_WITH_ZERO';
            result.readChar = true;
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = `SyntaxError: expected numeric character but ${char} found`;
        }

        return result;
    },

    START_WITH_ZERO(char) {
        const result = new ActionResult();

        if (Utils.isDot(char)) {
            result.nextState = 'FRACTION_START';
            result.readChar = true;
        } else if (Utils.isExponent(char)) {
            result.nextState = 'EXPONENT_SIGN';
            result.readChar = true;
        } else {
            result.nextState = 'END';
        }

        return result;
    },

    INTEGER(char) {
        const result = new ActionResult();

        if (Utils.isDigit(char)) {
            result.nextState = 'INTEGER';
            result.readChar = true;
        } else if (Utils.isDot(char)) {
            result.nextState = 'FRACTION_START';
            result.readChar = true;
        } else if (Utils.isExponent(char)) {
            result.nextState = 'EXPONENT_SIGN';
            result.readChar = true;
        } else {
            result.nextState = 'END';
        }

        return result;
    },

    FRACTION_START(char) {
        const result = new ActionResult();

        if (Utils.isDigit(char)) {
            result.nextState = 'FRACTION';
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = 'SyntaxError: missing digits after decimal point';
        }

        return result;
    },

    FRACTION(char) {
        const result = new ActionResult();

        if (Utils.isDigit(char)) {
            result.nextState = 'FRACTION';
            result.readChar = true;
        } else if (Utils.isExponent(char)) {
            result.nextState = 'EXPONENT_SIGN';
            result.readChar = true;
        } else {
            result.nextState = 'END';
        }

        return result;
    },

    EXPONENT_SIGN(char) {
        const result = new ActionResult();

        if (Utils.isMinusSign(char) || Utils.isPlusSign(char)) {
            result.nextState = 'EXPONENT';
            result.readChar = true;
        } else if (Utils.isDigit(char)) {
            result.nextState = 'EXPONENT';
            result.readChar = true;
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = 'SyntaxError: missing digits after exponent indicator';
        }

        return result;
    },

    EXPONENT(char) {
        const result = new ActionResult();

        if (Utils.isDigit(char)) {
            result.nextState = 'EXPONENT';
            result.readChar = true;
        } else {
            result.nextState = 'END';
        }

        return result;
    },
};
