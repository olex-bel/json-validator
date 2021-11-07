const JSONLexer = require('../lexer');
const Token = require('../lexer/token');

test('should return EOF token for empty string', () => {
    const lexer = new JSONLexer('');
    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_EOF);
});

test('should return OPENING_BRACE and CLOSING_BRACE tokens', () => {
    const lexer = new JSONLexer('{}');
    let token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_OPENING_BRACE);
    token = lexer.getToken();
    expect(token.id).toBe(Token.TOKEN_CLOSING_BRACE);
});

test('should return OPENING_BRACKET and CLOSING_BRACKET tokens', () => {
    const lexer = new JSONLexer('[              ]');
    let token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_OPENING_BRACKET);
    token = lexer.getToken();
    expect(token.id).toBe(Token.TOKEN_CLOSING_BRACKET);
});

test('should return COLON token', () => {
    const lexer = new JSONLexer(' :');
    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_COLON);
});

test('should return COMMA token', () => {
    const lexer = new JSONLexer(' ,');
    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_COMMA);
});

test('should return NULL token', () => {
    const lexer = new JSONLexer('null');
    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_NULL);
});

test('should return TRUE token', () => {
    const lexer = new JSONLexer('true');
    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_TRUE);
});

test('should return FALSE token', () => {
    const lexer = new JSONLexer('false');
    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_FALSE);
});

test('should throw an error for unknown identifier', () => {
    const lexer = new JSONLexer('Fals');

    expect(() => {
        lexer.getToken();
    }).toThrow();
});

test('should return STRING tokens for empty string', () => {
    const lexer = new JSONLexer('""');
    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_STRING);
});

test('should return STRING tokens for string', () => {
    const lexer = new JSONLexer('"test"');
    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_STRING);
    expect(token.value).toBe('test');
});

test('should fail string does no have close quota', () => {
    const lexer = new JSONLexer('"aaaa');

    expect(() => {
        lexer.getToken();
    }).toThrow();
});

test('should return STRING tokens for string with escape characters', () => {
    const inputString = '\\\\\\"\\/\\b\\f\\n\\r\\t';
    const lexer = new JSONLexer(`"${inputString}"`);
    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_STRING);
    expect(token.value).toBe(inputString);
});

test('should throw an error for unknown escape character', () => {
    const lexer = new JSONLexer('"\\x"');

    expect(() => {
        lexer.getToken();
    }).toThrow();
});

test('should return STRING tokens for string with unicode', () => {
    const inputString = '\\uA08fd\\ub12ec';
    const lexer = new JSONLexer(`"${inputString}"`);
    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_STRING);
    expect(token.value).toBe(inputString);
});

test('should throw an error for unknown unicode character', () => {
    const lexer = new JSONLexer('"\\u12w1"');

    expect(() => {
        lexer.getToken();
    }).toThrow();
});

test('should return NUMBER tokens for integer', () => {
    const testNumber = '123';
    const lexer = new JSONLexer(testNumber);
    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_NUMBER);
    expect(token.value).toBe(testNumber);
});

test('should return NUMBER tokens for number with float point', () => {
    const testNumber = '1234567890.0123456789';
    const lexer = new JSONLexer(testNumber);
    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_NUMBER);
    expect(token.value).toBe(testNumber);
});

test('should return NUMBER tokens for number with exponent', () => {
    const testNumber = '0.01E9';
    const lexer = new JSONLexer(testNumber);
    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_NUMBER);
    expect(token.value).toBe(testNumber);
});

test('should return NUMBER tokens for number from the list', () => {
    const testNumbers = [
        '-0', '0', '0.1', '-97', '1e9', '5E01', '7e-1', '6E+3', '1234567890',
    ];

    testNumbers.forEach((testNumber) => {
        const lexer = new JSONLexer(testNumber);
        const token = lexer.getToken();

        expect(token.id).toBe(Token.TOKEN_NUMBER);
        expect(token.value).toBe(testNumber);
    });
});

test('should return UNKNOWN token for number that start with +', () => {
    const lexer = new JSONLexer('+1');

    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_UNKNOWN);
    expect(token.value).toBe('+');
});

test('should throw an error for number string with missing fraction', () => {
    const lexer = new JSONLexer('0.}');

    expect(() => {
        lexer.getToken();
    }).toThrow();
});

test('should throw an error for number string with invalid exponent', () => {
    const lexer = new JSONLexer('1er1');

    expect(() => {
        lexer.getToken();
    }).toThrow();
});
