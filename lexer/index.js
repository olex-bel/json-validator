'use strict';

const JSONStream = require('../stream');
const Token = require('./token');
const Utils = require('./utils');

const symbolMapping = {
    '{': Token.TOKEN_OPENING_BRACE,
    '}': Token.TOKEN_CLOSING_BRACE,
    '[': Token.TOKEN_OPENING_BRACKET,
    ']': Token.TOKEN_CLOSING_BRACKET,
    ':': Token.TOKEN_COLON
};

const identifierMapping = {
    'null': Token.TOKEN_NULL,
    'true': Token.TOKEN_TRUE,
    'false': Token.TOKEN_FALSE
};

function JSONLexer(json) {
    this.stream = new JSONStream(json);
    this.currentChar = null;
}

JSONLexer.prototype.__getChar = function () {
    let char;

    if (this.currentChar) {
        char = this.currentChar;
        this.currentChar = null;
    } else {
        char = this.stream.getChar();
    }

    return char;
};

JSONLexer.prototype.__ungetLastChar = function (char) {
    if (this.currentChar) {
        throw new Error('Internal error');
    }

    this.currentChar = char;
}

JSONLexer.prototype.getToken = function () {
    let token = null;
    let char;

    this.skipWhiteSpaces();
    char = this.__getChar();

    if (char === null) {
        token = this.__createToken(Token.TOKEN_EOF);
    } else if (char in symbolMapping) {
        token = this.__createToken(symbolMapping[char]);
    } else if (Utils.isCharacterLetter(char)) {
        this.__ungetLastChar(char);
        token = this.parseIdentifier();
    } else {
        throw new Error('Undefined token');
    }

    return token;
};

JSONLexer.prototype.__createToken = function (id, value) {
    var { line, column } = this.stream.getPositionStatus();

    return {
        id: id,
        value: value,
        line: line,
        column: column
    };
};

JSONLexer.prototype.parseIdentifier = function () {
    let identifier = '';
    let char = this.__getChar();

    while (char && Utils.isCharacterLetter(char)) {
        identifier += char;
        char = this.__getChar();
    }

    this.__ungetLastChar(char);

    if (!identifierMapping[identifier]) {
        throw new Error('Undefined token');
    }

    return this.__createToken(identifierMapping[identifier]);
};

JSONLexer.prototype.skipWhiteSpaces = function () {
    let char = this.__getChar();

    while (char !== null && Utils.isWhiteSpace(char)) {
        char = this.__getChar();
    }

    this.__ungetLastChar(char);
}

module.exports = JSONLexer;