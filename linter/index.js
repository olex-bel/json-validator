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

JSONLinter.prototype.checkExpectToken = function (params) {
    const { expectedTokenID, currentTokenId, errorMessage } = params;

    if (expectedTokenID !== currentTokenId) {
        throw new Error(errorMessage);
    }
};

JSONLinter.prototype.validate = function () {
    try {
        this.parseValue();
    } catch (e) {
        console.log(e.message);
        console.log(this.lexer.currentCodeSnippet());
        throw e;
    }
};

JSONLinter.prototype.parseValue = function () {
    const token = this.getCurrentToken();

    if (token.id === Token.TOKEN_OPENING_BRACE) {
        this.parseObject();
    } else if (token.id === Token.TOKEN_OPENING_BRACKET) {
        this.parseArray();
    } else if (SCALAR_VALUE_TOKENS.includes(this.currentToken.id)) {
        this.readNextToken();
    } else if (token.id === Token.TOKEN_EOF) {
        throw new Error('JSON Syntax Error: unexpected end of data');
    } else {
        throw new Error(`JSON Syntax Error: expected "STRING", "NUMBER", "NULL", "TRUE", "FALSE", "{", "[" but was found ${token.value}`);
    }
};

JSONLinter.prototype.parseObject = function () {
    let token = this.readNextToken();

    if (token.id === Token.TOKEN_CLOSING_BRACE) {
        this.readNextToken();
        return;
    }

    this.parseMembers();

    token = this.getCurrentToken();
    this.checkExpectToken({
        expectedTokenID: Token.TOKEN_CLOSING_BRACE,
        currentTokenId: token.id,
        errorMessage: 'JSON Syntax Error: expected property name or "}"',
    });
    this.readNextToken();
};

JSONLinter.prototype.parseMembers = function () {
    let token = this.getCurrentToken();

    for (; ;) {
        this.checkExpectToken({
            expectedTokenID: Token.TOKEN_STRING,
            currentTokenId: token.id,
            errorMessage: 'JSON Syntax Error: expected property name',
        });
        token = this.readNextToken();
        this.checkExpectToken({
            expectedTokenID: Token.TOKEN_COLON,
            currentTokenId: token.id,
            errorMessage: 'JSON Syntax Error: expected ":" after property name in object',
        });
        token = this.readNextToken();
        this.parseValue();
        token = this.getCurrentToken();

        if (token.id === Token.TOKEN_CLOSING_BRACE) {
            break;
        } else if (token.id === Token.TOKEN_COMMA) {
            token = this.readNextToken();
        } else {
            throw new Error('JSON Syntax Error: expected "," or "}" after property value in object');
        }
    }
};

JSONLinter.prototype.parseArray = function () {
    let token = this.readNextToken();

    if (token.id === Token.TOKEN_CLOSING_BRACKET) {
        this.readNextToken();
        return;
    }

    this.parseElements();
    token = this.getCurrentToken();
    this.checkExpectToken({
        expectedTokenID: Token.TOKEN_CLOSING_BRACKET,
        currentTokenId: token.id,
        errorMessage: 'JSON Syntax Error: expected "," or "]" after array element',
    });
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
            throw new Error('JSON Syntax Error: expected "," or "]" after array element');
        }
    }
};

module.exports = JSONLinter;
