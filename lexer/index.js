const JSONStream = require('../stream');
const Token = require('./token');
const Utils = require('./utils');

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

function JSONLexer(json) {
    this.stream = new JSONStream(json);
    this.currentChar = null;
}

JSONLexer.prototype.getChar = function () {
    let char;

    if (this.currentChar) {
        char = this.currentChar;
        this.currentChar = null;
    } else {
        char = this.stream.getChar();
    }

    return char;
};

JSONLexer.prototype.ungetLastChar = function (char) {
    if (this.currentChar) {
        throw new Error('Internal error');
    }

    this.currentChar = char;
};

JSONLexer.prototype.getToken = function () {
    let token = null;
    this.skipWhiteSpaces();
    const char = this.getChar();

    if (char === null) {
        token = this.createToken(Token.TOKEN_EOF);
    } else if (char in symbolMapping) {
        token = this.createToken(symbolMapping[char]);
    } else if (Utils.isCharacterLetter(char)) {
        this.ungetLastChar(char);
        token = this.parseIdentifier();
    } else if (Utils.isDoubleQuote(char)) {
        token = this.parseString();
    } else if (Utils.isMinusSign(char) || Utils.isDigit(char)) {
        this.ungetLastChar(char);
        token = this.parseNumber();
    } else {
        throw new Error('Undefined token');
    }

    return token;
};

JSONLexer.prototype.createToken = function (id, value) {
    const { line, column } = this.stream.getPositionStatus();

    return {
        id,
        value,
        line,
        column,
    };
};

JSONLexer.prototype.parseIdentifier = function () {
    let identifier = '';
    let char = this.getChar();

    while (char && Utils.isCharacterLetter(char)) {
        identifier += char;
        char = this.getChar();
    }

    this.ungetLastChar(char);

    if (!identifierMapping[identifier]) {
        throw new Error('Undefined token');
    }

    return this.createToken(identifierMapping[identifier]);
};

JSONLexer.prototype.parseString = function () {
    let string = '';
    let char = this.getChar();

    while (char && !Utils.isDoubleQuote(char)) {
        if (Utils.isBackslash(char)) {
            string += char;
            string += this.parseEscape();
        } else {
            string += char;
        }
        char = this.getChar();
    }

    if (!Utils.isDoubleQuote(char)) {
        throw new Error('Expecting a `"` over here.');
    }

    return this.createToken(Token.TOKEN_STRING, string);
};

JSONLexer.prototype.parseEscape = function () {
    const char = this.getChar();
    let string = char;

    if ('"/\\bfnrtu'.indexOf(char) === -1) {
        throw new Error(`Unexpected escape character: ${char}`);
    }

    if (char === 'u') {
        string += this.parseUnicode();
    }

    return string;
};

JSONLexer.prototype.parseUnicode = function () {
    let unicodeCodes = '';

    for (let i = 0; i < 4; i += 1) {
        const char = this.getChar();

        if (Utils.isHexadecimal(char)) {
            unicodeCodes += char;
        } else {
            throw new Error(`Unexpected unicode character: ${char}`);
        }
    }
    return unicodeCodes;
};

JSONLexer.prototype.parseNumber = function () {
    const number = this.parseInteger() + this.parseFraction() + this.parseExponent();

    return this.createToken(Token.TOKEN_NUMBER, number);
};

JSONLexer.prototype.parseInteger = function () {
    let integer = '';
    let char = this.getChar();

    if (Utils.isMinusSign(char)) {
        integer += char;
        char = this.getChar();
    }

    if (Utils.isZeroDigit(char)) {
        integer += char;
        return integer;
    }

    if (!Utils.isDigit(char)) {
        throw new Error('Expecting a digit `0-9` over here.');
    }

    while (char && Utils.isDigit(char)) {
        integer += char;
        char = this.getChar();
    }

    this.ungetLastChar(char);

    return integer;
};

JSONLexer.prototype.parseFraction = function () {
    let char = this.getChar();
    let fraction = '';

    if (!Utils.isDot(char)) {
        this.ungetLastChar(char);
        return fraction;
    }

    fraction += '.';
    char = this.getChar();

    if (!Utils.isDigit(char)) {
        throw new Error('Expecting a digit `0-9` over here.');
    }

    while (char && Utils.isDigit(char)) {
        fraction += char;
        char = this.getChar();
    }

    this.ungetLastChar(char);
    return fraction;
};

JSONLexer.prototype.parseExponent = function () {
    let char = this.getChar();
    let exponent = '';

    if (!Utils.isExponent(char)) {
        this.ungetLastChar(char);
        return exponent;
    }

    exponent += char;
    char = this.getChar();

    if (Utils.isMinusSign(char) || Utils.isPlusSign(char)) {
        exponent += char;
        char = this.getChar();
    }

    if (!Utils.isDigit(char)) {
        throw new Error('Expecting a digit `0-9` over here.');
    }

    while (char && Utils.isDigit(char)) {
        exponent += char;
        char = this.getChar();
    }

    this.ungetLastChar(char);

    return exponent;
};

JSONLexer.prototype.skipWhiteSpaces = function () {
    let char = this.getChar();

    while (char !== null && Utils.isWhiteSpace(char)) {
        char = this.getChar();
    }

    this.ungetLastChar(char);
};

module.exports = JSONLexer;
