const Utils = require('../utils');
const ActionResult = require('../actionresult');

module.exports = {
    START(char) {
        const result = new ActionResult();

        if (Utils.isDoubleQuote(char)) {
            result.nextState = 'STRING';
            result.skipChar = true;
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = `SyntaxError: expected '"' but ${char} found`;
        }

        return result;
    },

    STRING(char) {
        const result = new ActionResult();

        if (Utils.isDoubleQuote(char)) {
            result.skipChar = true;
            result.nextState = 'END';
        } else if (Utils.isNewLine(char)) {
            result.nextState = 'ERROR';
            result.errorMessage = 'SyntaxError: unterminated string';
        } else if (char === null) {
            result.nextState = 'ERROR';
            result.errorMessage = 'SyntaxError: end of data when \'"\' was expected';
        } else if (Utils.isBackslash(char)) {
            result.nextState = 'ESCAPE';
            result.readChar = true;
        } else {
            result.nextState = 'STRING';
            result.readChar = true;
        }

        return result;
    },

    ESCAPE(char) {
        const result = new ActionResult();

        if ('"/\\bfnrt'.indexOf(char) !== -1) {
            result.nextState = 'STRING';
            result.readChar = true;
        } else if (char === 'u') {
            result.nextState = 'UNICODE_FIRST_NUMBER';
            result.readChar = true;
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = `SyntaxError: bad escape character "\\${char}"`;
        }

        return result;
    },

    UNICODE_FIRST_NUMBER(char) {
        const result = new ActionResult();

        if (Utils.isHexadecimal(char)) {
            result.nextState = 'UNICODE_SECOND_NUMBER';
            result.readChar = true;
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = 'SyntaxError: bad Unicode escape';
        }

        return result;
    },

    UNICODE_SECOND_NUMBER(char) {
        const result = new ActionResult();

        if (Utils.isHexadecimal(char)) {
            result.nextState = 'UNICODE_THIRD_NUMBER';
            result.readChar = true;
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = 'SyntaxError: bad Unicode escape';
        }

        return result;
    },

    UNICODE_THIRD_NUMBER(char) {
        const result = new ActionResult();

        if (Utils.isHexadecimal(char)) {
            result.nextState = 'UNICODE_FORTH_NUMBER';
            result.readChar = true;
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = 'SyntaxError: bad Unicode escape';
        }

        return result;
    },

    UNICODE_FORTH_NUMBER(char) {
        const result = new ActionResult();

        if (Utils.isHexadecimal(char)) {
            result.nextState = 'STRING';
            result.readChar = true;
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = 'SyntaxError: bad Unicode escape';
        }

        return result;
    },
};
