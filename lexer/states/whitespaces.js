const Utils = require('../utils');
const ActionResult = require('../actionresult');

module.exports = {
    START(char) {
        const result = new ActionResult();

        if (Utils.isWhiteSpace(char)) {
            result.nextState = 'WHITESPACES';
            result.readChar = true;
        } else {
            result.nextState = 'END';
        }

        return result;
    },

    WHITESPACES(char) {
        const result = new ActionResult();

        if (Utils.isWhiteSpace(char)) {
            result.nextState = 'WHITESPACES';
            result.readChar = true;
        } else {
            result.nextState = 'END';
        }

        return result;
    },
};
