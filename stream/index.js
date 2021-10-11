'use strict';

const JSONStringStream = require('./stringstream');
const JSONStreamPosition = require('./streamposition');

function JSONStream(json) {
    this.stream = new JSONStringStream(json);
    this.position = new JSONStreamPosition();
}

JSONStream.prototype.__skipNewLineChars = function () {
    let char = this.stream.getCharWithoutChangePosition();

    while (char && char === '\r') {
        this.position.increaseLineNumber();
        this.stream.getChar();
        char = this.stream.getCharWithoutChangePosition();
    }
}

JSONStream.prototype.getChar = function () {
    let char;

    this.__skipNewLineChars();
    char = this.stream.getChar();

    if (char) {
        this.position.increaseColumnNumber();
    }

    return char;
};

JSONStream.prototype.getPositionStatus = function () {
    return this.position.getPositionStatus();
}

module.exports = JSONStream;