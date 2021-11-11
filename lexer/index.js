const JSONStream = require('../stream');
const LexerPosition = require('./lexerposition');
const Token = require('./token');
const Utils = require('./utils');
const { execStateMachine } = require('./statemachine');
const NumberStates = require('./states/number');
const StringStates = require('./states/string');
const IdentifierStates = require('./states/identifier');

const symbolMapping = {
    '{': Token.TOKEN_OPENING_BRACE,
    '}': Token.TOKEN_CLOSING_BRACE,
    '[': Token.TOKEN_OPENING_BRACKET,
    ']': Token.TOKEN_CLOSING_BRACKET,
    ':': Token.TOKEN_COLON,
    ',': Token.TOKEN_COMMA,
};

const identifierMapping = {
    null: Token.TOKEN_NULL,
    true: Token.TOKEN_TRUE,
    false: Token.TOKEN_FALSE,
};

const SNIPPET_SIZE = 10;

function JSONLexer(json) {
    this.stream = new JSONStream(json);
    this.currentChar = null;
    this.position = new LexerPosition();
}

JSONLexer.prototype.currentCodeSnippet = function () {
    return this.stream.currentCodeSnippet(SNIPPET_SIZE);
};

JSONLexer.prototype.getToken = function () {
    this.skipWhiteSpacesAndNewLines();

    let token = null;
    const char = this.peekChar();

    if (char === null) {
        const { line, column } = this.position;

        token = this.createToken({
            id: Token.TOKEN_EOF,
            line,
            column,
        });
    } else if (Utils.isCharacterLetter(char)) {
        token = this.parseIdentifier();
    } else if (Utils.isDoubleQuote(char)) {
        token = this.parseString();
    } else if (Utils.isMinusSign(char) || Utils.isDigit(char)) {
        token = this.parseNumber();
    } else {
        token = this.parseSymbol();
    }

    return token;
};

JSONLexer.prototype.createToken = function (params) {
    const {
        id, value, line, column,
    } = params;

    return {
        id,
        value,
        line,
        column,
    };
};

JSONLexer.prototype.parseSymbol = function () {
    let token = null;
    const { line, column } = this.position;
    const char = this.getChar();

    if (char in symbolMapping) {
        token = this.createToken({ id: symbolMapping[char], column, line });
    } else {
        token = this.createToken({
            id: Token.TOKEN_UNKNOWN, value: char, column, line,
        });
    }

    return token;
};

JSONLexer.prototype.parseIdentifier = function () {
    const { line, column } = this.position;
    const identifier = execStateMachine.call(this, IdentifierStates);

    if (!identifierMapping[identifier]) {
        throw new Error(`JSON Syntax Error: unexpected keyword "${identifier}" at line ${line} column ${column} of the JSON data`);
    }

    return this.createToken({ id: identifierMapping[identifier], column, line });
};

JSONLexer.prototype.parseString = function () {
    const { line, column } = this.position;
    const string = execStateMachine.call(this, StringStates);

    return this.createToken({
        id: Token.TOKEN_STRING, value: string, column, line,
    });
};

JSONLexer.prototype.parseNumber = function () {
    const { line, column } = this.position;
    const number = execStateMachine.call(this, NumberStates);

    return this.createToken({
        id: Token.TOKEN_NUMBER, value: number, column, line,
    });
};

JSONLexer.prototype.skipWhiteSpacesAndNewLines = function () {
    let char = this.peekChar();

    while (char === '\r' || Utils.isWhiteSpace(char)) {
        if (char === '\r') {
            this.position.increaseLineNumber();
        }

        this.skipChar();
        char = this.peekChar();
    }
};

JSONLexer.prototype.getChar = function () {
    this.position.increaseColumnNumber();
    return this.stream.getChar();
};

JSONLexer.prototype.peekChar = function () {
    return this.stream.peekChar();
};

JSONLexer.prototype.skipChar = function () {
    this.getChar();
};

module.exports = JSONLexer;
