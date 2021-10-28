const JSONStream = require('../stream');

test('getChar should return null for empty string', () => {
    const stream = new JSONStream('');

    expect(stream.getChar()).toBeNull();
});

test('peekChar should return null for empty string', () => {
    const stream = new JSONStream('');

    expect(stream.peekChar()).toBeNull();
});

test('should return character from string', () => {
    const testText = 'true';
    const stream = new JSONStream(testText);
    let resultText = '';

    let char = stream.getChar();

    while (char !== null) {
        resultText += char;
        char = stream.getChar();
    }

    expect(resultText).toEqual(testText);
});

test('should ignore new line character', () => {
    const testText1 = '\r\r\ra';
    const testText2 = '\n\n\rb';
    const testText3 = '\r\n\n\rc';

    let stream = new JSONStream(testText1);
    expect(stream.getChar()).toEqual('\r');
    expect(stream.getChar()).toEqual('\r');
    expect(stream.getChar()).toEqual('\r');
    expect(stream.getChar()).toEqual('a');
    stream = new JSONStream(testText2);
    expect(stream.getChar()).toEqual('\r');
    expect(stream.getChar()).toEqual('\r');
    expect(stream.getChar()).toEqual('b');
    stream = new JSONStream(testText3);
    expect(stream.getChar()).toEqual('\r');
    expect(stream.getChar()).toEqual('\r');
    expect(stream.getChar()).toEqual('c');
});
