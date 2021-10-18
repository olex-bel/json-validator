const JSONLexer = require('../lexer');
const Token = require('../lexer/token');

const SCALAR_VALUE_TOKENS = [
    Token.TOKEN_TRUE,
    Token.TOKEN_FALSE,
    Token.TOKEN_NULL,
    Token.TOKEN_NUMBER,
    Token.TOKEN_STRING,
];

function JSONLinter(json) {
    this.lexer = new JSONLexer(json);
    this.currentToken = null;
}

JSONLinter.prototype.getCurrentToken = function () {
    if (this.currentToken === null) {
        this.readNextToken();
    }

    return this.currentToken;
};

JSONLinter.prototype.readNextToken = function () {
    this.currentToken = this.lexer.getToken();
    return this.currentToken;
};

JSONLinter.prototype.checkExpectToken = function (token, expectTokenId) {
    if (token.id !== expectTokenId) {
        throw new Error(`Expected token ${expectTokenId} but found ${token.id}`);
    }
};

JSONLinter.prototype.validate = function () {
    this.parseValue();
};

JSONLinter.prototype.parseValue = function () {
    const token = this.getCurrentToken();

    if (token.id === Token.TOKEN_OPENING_BRACE) {
        this.parseObject();
    } else if (token.id === Token.TOKEN_OPENING_BRACKET) {
        this.parseArray();
    } else if (SCALAR_VALUE_TOKENS.includes(this.currentToken.id)) {
        this.readNextToken();
    } else {
        throw new Error('Invalid value');
    }
};

JSONLinter.prototype.parseObject = function () {
    let token = this.getCurrentToken();
    this.checkExpectToken(token, Token.TOKEN_OPENING_BRACE);
    token = this.readNextToken();

    if (token.id === Token.TOKEN_CLOSING_BRACE) {
        this.readNextToken();
        return;
    }

    this.parseMembers();

    this.checkExpectToken(this.getCurrentToken(), Token.TOKEN_CLOSING_BRACE);
    this.readNextToken();
};

JSONLinter.prototype.parseMembers = function () {
    let token = this.getCurrentToken();

    for (; ;) {
        this.checkExpectToken(token, Token.TOKEN_STRING);
        token = this.readNextToken();
        this.checkExpectToken(token, Token.TOKEN_COLON);
        token = this.readNextToken();
        this.parseValue();
        token = this.getCurrentToken();

        if (token.id === Token.TOKEN_CLOSING_BRACE) {
            break;
        } else if (token.id === Token.TOKEN_COMMA) {
            token = this.readNextToken();
        } else {
            throw new Error(`Expected ${Token.TOKEN_CLOSING_BRACE} but found: ${token.id}`);
        }
    }
};

JSONLinter.prototype.parseArray = function () {
    let token = this.getCurrentToken();
    this.checkExpectToken(token, Token.TOKEN_OPENING_BRACKET);
    token = this.readNextToken();

    if (token.id === Token.TOKEN_CLOSING_BRACKET) {
        this.readNextToken();
        return;
    }

    this.parseElements();
    this.checkExpectToken(this.getCurrentToken(), Token.TOKEN_CLOSING_BRACKET);
    this.readNextToken();
};

JSONLinter.prototype.parseElements = function () {
    let token;

    for (; ;) {
        this.parseValue();
        token = this.getCurrentToken();

        if (token.id === Token.TOKEN_CLOSING_BRACKET) {
            break;
        } else if (token.id === Token.TOKEN_COMMA) {
            this.readNextToken();
        } else {
            throw new Error(`Expected ${Token.TOKEN_CLOSING_BRACKET} but found: ${token.id}`);
        }
    }
};

module.exports = JSONLinter;
