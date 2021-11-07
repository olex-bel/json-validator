const Utils = require('../utils');
const ActionResult = require('../actionresult');

module.exports = {
    START(char) {
        const result = new ActionResult();

        if (char && Utils.isCharacterLetter(char)) {
            result.readChar = true;
            result.nextState = 'IDENTIFIER';
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = `SyntaxError: expected alphabetic character but ${char} found`;
        }

        return result;
    },

    IDENTIFIER(char) {
        const result = new ActionResult();

        if (char && Utils.isCharacterLetter(char)) {
            result.readChar = true;
            result.nextState = 'IDENTIFIER';
        } else {
            result.nextState = 'END';
        }

        return result;
    },
};
