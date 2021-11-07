(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.JSONLinter = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function ActionResult() {
    this.readChar = false;
    this.nextState = '';
    this.errorMessage = '';
    this.skipChar = false;
}

module.exports = ActionResult;

},{}],2:[function(require,module,exports){
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

},{"../stream":12,"./lexerposition":3,"./statemachine":4,"./states/identifier":5,"./states/number":6,"./states/string":7,"./states/whitespaces":8,"./token":9,"./utils":10}],3:[function(require,module,exports){
function LexerPosition() {
    this.line = 1;
    this.column = 0;
}

LexerPosition.prototype.increaseLineNumber = function () {
    this.line += 1;
    this.column = 0;
};
LexerPosition.prototype.increaseColumnNumber = function () {
    this.column += 1;
};

module.exports = LexerPosition;

},{}],4:[function(require,module,exports){
function execStateMachine(stateMachine) {
    let state = 'START';
    let value = '';

    for (; ;) {
        const char = this.peekChar();
        const {
            nextState, readChar, skipChar, errorMessage,
        } = stateMachine[state](char);

        if (skipChar) {
            this.getChar();
        } else if (readChar) {
            value += this.getChar();
        }

        if (nextState === 'END') {
            break;
        } else if (nextState === 'ERROR') {
            throw new Error(errorMessage);
        }

        state = nextState;
    }

    return value;
}

module.exports.execStateMachine = execStateMachine;

},{}],5:[function(require,module,exports){
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

},{"../actionresult":1,"../utils":10}],6:[function(require,module,exports){
const Utils = require('../utils');
const ActionResult = require('../actionresult');

module.exports = {
    START(char) {
        const result = new ActionResult();

        if (Utils.isMinusSign(char)) {
            result.nextState = 'INTEGER';
            result.readChar = true;
        } else if (Utils.isOneNineDigit(char)) {
            result.nextState = 'INTEGER';
        } else if (Utils.isZeroDigit(char)) {
            result.nextState = 'START_WITH_ZERO';
            result.readChar = true;
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = `SyntaxError: expected numeric character but ${char} found`;
        }

        return result;
    },

    START_WITH_ZERO(char) {
        const result = new ActionResult();

        if (Utils.isDot(char)) {
            result.nextState = 'FRACTION_START';
            result.readChar = true;
        } else if (Utils.isExponent(char)) {
            result.nextState = 'EXPONENT_SIGN';
            result.readChar = true;
        } else {
            result.nextState = 'END';
        }

        return result;
    },

    INTEGER(char) {
        const result = new ActionResult();

        if (Utils.isDigit(char)) {
            result.nextState = 'INTEGER';
            result.readChar = true;
        } else if (Utils.isDot(char)) {
            result.nextState = 'FRACTION_START';
            result.readChar = true;
        } else if (Utils.isExponent(char)) {
            result.nextState = 'EXPONENT_SIGN';
            result.readChar = true;
        } else {
            result.nextState = 'END';
        }

        return result;
    },

    FRACTION_START(char) {
        const result = new ActionResult();

        if (Utils.isDigit(char)) {
            result.nextState = 'FRACTION';
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = 'SyntaxError: missing digits after decimal point';
        }

        return result;
    },

    FRACTION(char) {
        const result = new ActionResult();

        if (Utils.isDigit(char)) {
            result.nextState = 'FRACTION';
            result.readChar = true;
        } else if (Utils.isExponent(char)) {
            result.nextState = 'EXPONENT_SIGN';
            result.readChar = true;
        } else {
            result.nextState = 'END';
        }

        return result;
    },

    EXPONENT_SIGN(char) {
        const result = new ActionResult();

        if (Utils.isMinusSign(char) || Utils.isPlusSign(char)) {
            result.nextState = 'EXPONENT';
            result.readChar = true;
        } else if (Utils.isDigit(char)) {
            result.nextState = 'EXPONENT';
            result.readChar = true;
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = 'SyntaxError: missing digits after exponent indicator';
        }

        return result;
    },

    EXPONENT(char) {
        const result = new ActionResult();

        if (Utils.isDigit(char)) {
            result.nextState = 'EXPONENT';
            result.readChar = true;
        } else {
            result.nextState = 'END';
        }

        return result;
    },
};

},{"../actionresult":1,"../utils":10}],7:[function(require,module,exports){
const Utils = require('../utils');
const ActionResult = require('../actionresult');

module.exports = {
    START(char) {
        const result = new ActionResult();

        if (Utils.isDoubleQuote(char)) {
            result.nextState = 'STRING';
            result.skipChar = true;
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = `SyntaxError: expected '"' but ${char} found`;
        }

        return result;
    },

    STRING(char) {
        const result = new ActionResult();

        if (Utils.isDoubleQuote(char)) {
            result.skipChar = true;
            result.nextState = 'END';
        } else if (Utils.isNewLine(char)) {
            result.nextState = 'ERROR';
            result.errorMessage = 'SyntaxError: unterminated string';
        } else if (char === null) {
            result.nextState = 'ERROR';
            result.errorMessage = 'SyntaxError: end of data when \'"\' was expected';
        } else if (Utils.isBackslash(char)) {
            result.nextState = 'ESCAPE';
            result.readChar = true;
        } else {
            result.nextState = 'STRING';
            result.readChar = true;
        }

        return result;
    },

    ESCAPE(char) {
        const result = new ActionResult();

        if ('"/\\bfnrt'.indexOf(char) !== -1) {
            result.nextState = 'STRING';
            result.readChar = true;
        } else if (char === 'u') {
            result.nextState = 'UNICODE_FIRST_NUMBER';
            result.readChar = true;
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = `SyntaxError: bad escape character "\\${char}"`;
        }

        return result;
    },

    UNICODE_FIRST_NUMBER(char) {
        const result = new ActionResult();

        if (Utils.isHexadecimal(char)) {
            result.nextState = 'UNICODE_SECOND_NUMBER';
            result.readChar = true;
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = 'SyntaxError: bad Unicode escape';
        }

        return result;
    },

    UNICODE_SECOND_NUMBER(char) {
        const result = new ActionResult();

        if (Utils.isHexadecimal(char)) {
            result.nextState = 'UNICODE_THIRD_NUMBER';
            result.readChar = true;
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = 'SyntaxError: bad Unicode escape';
        }

        return result;
    },

    UNICODE_THIRD_NUMBER(char) {
        const result = new ActionResult();

        if (Utils.isHexadecimal(char)) {
            result.nextState = 'UNICODE_FORTH_NUMBER';
            result.readChar = true;
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = 'SyntaxError: bad Unicode escape';
        }

        return result;
    },

    UNICODE_FORTH_NUMBER(char) {
        const result = new ActionResult();

        if (Utils.isHexadecimal(char)) {
            result.nextState = 'STRING';
            result.readChar = true;
        } else {
            result.nextState = 'ERROR';
            result.errorMessage = 'SyntaxError: bad Unicode escape';
        }

        return result;
    },
};

},{"../actionresult":1,"../utils":10}],8:[function(require,module,exports){
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

},{"../actionresult":1,"../utils":10}],9:[function(require,module,exports){
module.exports = {
    TOKEN_UNKNOWN: 0,
    TOKEN_STRING: 1,
    TOKEN_NUMBER: 2,
    TOKEN_OPENING_BRACE: 3,
    TOKEN_CLOSING_BRACE: 4,
    TOKEN_OPENING_BRACKET: 5,
    TOKEN_CLOSING_BRACKET: 6,
    TOKEN_TRUE: 7,
    TOKEN_FALSE: 8,
    TOKEN_NULL: 9,
    TOKEN_EOF: 10,
    TOKEN_COLON: 11,
    TOKEN_COMMA: 12,
};

},{}],10:[function(require,module,exports){
function isCharacterLetter(char) {
    return char && (/[a-zA-Z]/).test(char);
}

function isMinusSign(char) {
    return char === '-';
}

function isPlusSign(char) {
    return char === '+';
}

function isDigit(char) {
    return (/[0-9]/).test(char);
}

function isZeroDigit(char) {
    return char === '0';
}

function isOneNineDigit(char) {
    return (/[1-9]/).test(char);
}

function isWhiteSpace(char) {
    return char === ' ' || char === '\t';
}

function isDoubleQuote(char) {
    return char === '"';
}

function isHexadecimal(char) {
    const ch = char.toLowerCase();
    return (ch >= '0' && ch <= '9') || (ch >= 'a' && ch <= 'f');
}

function isBackslash(char) {
    return char === '\\';
}

function isDot(char) {
    return char === '.';
}

function isExponent(char) {
    return char === 'e' || char === 'E';
}

function isNewLine(char) {
    return char === '\r';
}

module.exports = {
    isCharacterLetter,
    isMinusSign,
    isPlusSign,
    isDigit,
    isWhiteSpace,
    isDoubleQuote,
    isHexadecimal,
    isBackslash,
    isZeroDigit,
    isOneNineDigit,
    isDot,
    isExponent,
    isNewLine,
};

},{}],11:[function(require,module,exports){
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

},{"../lexer":2,"../lexer/token":9}],12:[function(require,module,exports){
function JSONStream(json) {
    this.json = json.replace(/\r\n|\n\r|\n/g, '\r');
    this.pos = 0;
}

JSONStream.prototype.getChar = function () {
    if (this.isEOF()) {
        return null;
    }

    const char = this.json.charAt(this.pos);
    this.pos += 1;

    return char;
};

JSONStream.prototype.peekChar = function () {
    if (this.isEOF()) {
        return null;
    }

    return this.json.charAt(this.pos);
};

JSONStream.prototype.isEOF = function () {
    return this.pos >= this.json.length;
};

JSONStream.prototype.currentCodeSnippet = function (snippetSize) {
    const fromIndex = Math.max(0, this.pos - snippetSize);

    return this.json.slice(fromIndex, this.pos);
};

module.exports = JSONStream;

},{}]},{},[11])(11)
});
