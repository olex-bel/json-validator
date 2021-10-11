const JSONStream = require('../stream');

test('should return null for empty string', () => {
    const stream = new JSONStream("");

    expect(stream.getChar()).toBeNull();
});

test('should not change column value for empty string', () => {
    const stream = new JSONStream("");
    const char = stream.getChar();
    const position = stream.getPositionStatus();

    expect(char).toBeNull();
    expect(position.line).toBe(1);
    expect(position.column).toBe(0);
});

test('should return character from string', () => {
    const testText = "true";
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
    expect(stream.getChar()).toEqual('a');
    stream = new JSONStream(testText2);
    expect(stream.getChar()).toEqual('b');
    stream = new JSONStream(testText3);
    expect(stream.getChar()).toEqual('c');
});

test('should update position', () => {
    const testText = '\r\rab\rd';

    const stream = new JSONStream(testText);
    let char = stream.getChar();
    let position = stream.getPositionStatus();

    expect(char).toEqual('a');
    expect(position.line).toBe(3);
    expect(position.column).toBe(1);

    char = stream.getChar();
    position = stream.getPositionStatus();

    expect(char).toEqual('b');
    expect(position.line).toBe(3);
    expect(position.column).toBe(2);

    char = stream.getChar();
    position = stream.getPositionStatus();

    expect(char).toEqual('d');
    expect(position.line).toBe(4);
    expect(position.column).toBe(1);
});