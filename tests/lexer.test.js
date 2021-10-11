const JSONLexer = require('../lexer');
const Token = require('../lexer/token');

test('should return EOF token for empty string', () => {
    const lexer = new JSONLexer("");
    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_EOF);
});

test('should return OPENING_BRACE and CLOSING_BRACE tokens', () => {
    const lexer = new JSONLexer("{}");
    let token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_OPENING_BRACE);
    token = lexer.getToken();
    expect(token.id).toBe(Token.TOKEN_CLOSING_BRACE);
});

test('should return OPENING_BRACKET and CLOSING_BRACKET tokens', () => {
    const lexer = new JSONLexer("[              ]");
    let token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_OPENING_BRACKET);
    token = lexer.getToken();
    expect(token.id).toBe(Token.TOKEN_CLOSING_BRACKET);
});

test('should return COLON token', () => {
    const lexer = new JSONLexer(" :");
    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_COLON);
});

test('should return NULL token', () => {
    const lexer = new JSONLexer("null");
    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_NULL);
});

test('should return TRUE token', () => {
    const lexer = new JSONLexer("true");
    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_TRUE);
});

test('should return FALSE token', () => {
    const lexer = new JSONLexer("false");
    const token = lexer.getToken();

    expect(token.id).toBe(Token.TOKEN_FALSE);
});

test('should throw an error for unknown identifier', () => {
    const lexer = new JSONLexer("Fals");

    expect(() => {
        lexer.getToken();
    }).toThrow();
});