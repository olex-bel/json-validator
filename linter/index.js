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
    const { expectedTokenID, currentToken, errorMessage } = params;

    if (expectedTokenID !== currentToken.id) {
        throw new Error(`${errorMessage} at line ${currentToken.line} column ${currentToken.column} of the JSON data`);
    }
};

JSONLinter.prototype.validate = function () {
    let status = {
        valid: true,
    };

    try {
        this.parseValue();
        this.checkExpectToken({
            expectedTokenID: Token.TOKEN_EOF,
            currentToken: this.getCurrentToken(),
            errorMessage: 'JSON Syntax Error: unexpected non-whitespace character after JSON data',
        });
    } catch (e) {
        status = {
            valid: false,
            errorMessage: e.message,
            errorCodeSnippet: this.lexer.currentCodeSnippet(),
        };
    }

    return status;
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
        throw new Error(`JSON Syntax Error: unexpected end of data at line ${token.line} column ${token.column} of the JSON data`);
    } else {
        throw new Error(`JSON Syntax Error: expected "STRING", "NUMBER", "NULL", "TRUE", "FALSE", "{", "[" but was found ${token.value} at line ${token.line} column ${token.column} of the JSON data`);
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
        currentToken: token,
        errorMessage: 'JSON Syntax Error: expected property name or "}"',
    });
    this.readNextToken();
};

JSONLinter.prototype.parseMembers = function () {
    let token = this.getCurrentToken();

    for (; ;) {
        this.checkExpectToken({
            expectedTokenID: Token.TOKEN_STRING,
            currentToken: token,
            errorMessage: 'JSON Syntax Error: expected property name',
        });
        token = this.readNextToken();
        this.checkExpectToken({
            expectedTokenID: Token.TOKEN_COLON,
            currentToken: token,
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
            throw new Error(`JSON Syntax Error: expected "," or "}" after property value in object at line ${token.line} column ${token.column} of the JSON data`);
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
        currentToken: token,
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
            throw new Error(`JSON Syntax Error: expected "," or "]" after array element at line ${token.line} column ${token.column} of the JSON data`);
        }
    }
};

module.exports = JSONLinter;
