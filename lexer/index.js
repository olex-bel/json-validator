const JSONStream = require('../stream');
const LexerPosition = require('./lexerposition');
const Token = require('./token');
const Utils = require('./utils');
const { execStateMachine } = require('./statemachine');
const NumberStates = require('./states/number');
const StringStates = require('./states/string');
const IdentifierStates = require('./states/identifier');
const WhiteSpacesStates = require('./states/whitespaces');

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
    this.skipWhiteSpaces();
    this.skipNewLines();
    this.skipWhiteSpaces();

    let token = null;
    const char = this.peekChar();

    if (char === null) {
        token = this.createToken(Token.TOKEN_EOF);
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

JSONLexer.prototype.createToken = function (id, value) {
    const { line, column } = this.position;

    return {
        id,
        value,
        line,
        column,
    };
};

JSONLexer.prototype.parseSymbol = function () {
    let token = null;
    const char = this.getChar();

    if (char in symbolMapping) {
        token = this.createToken(symbolMapping[char]);
    } else {
        token = this.createToken(Token.TOKEN_UNKNOWN, char);
    }

    return token;
};

JSONLexer.prototype.parseIdentifier = function () {
    const identifier = execStateMachine.call(this, IdentifierStates);

    if (!identifierMapping[identifier]) {
        throw new Error(`JSON Syntax Error: unexpected keyword "${identifier}"`);
    }

    return this.createToken(identifierMapping[identifier]);
};

JSONLexer.prototype.parseString = function () {
    const string = execStateMachine.call(this, StringStates);

    return this.createToken(Token.TOKEN_STRING, string);
};

JSONLexer.prototype.parseNumber = function () {
    const number = execStateMachine.call(this, NumberStates);

    return this.createToken(Token.TOKEN_NUMBER, number);
};

JSONLexer.prototype.skipWhiteSpaces = function () {
    execStateMachine.call(this, WhiteSpacesStates);
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

JSONLexer.prototype.skipNewLines = function () {
    let char = this.peekChar();

    while (char === '\r') {
        this.position.increaseLineNumber();
        this.skipChar();
        char = this.peekChar();
    }
};

module.exports = JSONLexer;
