const JSONLinter = require('../linter');

test('should parse null value', () => {
    const linter = new JSONLinter('null');
    const status = linter.validate();
    expect(status.valid).toBe(true);
});

test('should parse true value', () => {
    const linter = new JSONLinter('true');
    const status = linter.validate();
    expect(status.valid).toBe(true);
});

test('should parse true value', () => {
    const linter = new JSONLinter('false');
    const status = linter.validate();
    expect(status.valid).toBe(true);
});

test('should parse empty object {}', () => {
    const linter = new JSONLinter('{  }');
    const status = linter.validate();
    expect(status.valid).toBe(true);
});

test('should parse empty object with new line {}', () => {
    const linter = new JSONLinter('{ \r\r\r }');
    const status = linter.validate();
    expect(status.valid).toBe(true);
});

test('should throw error if there is no close brace', () => {
    const linter = new JSONLinter('{ ');
    const status = linter.validate();
    expect(status.valid).toBe(false);
});

test('should parse empty array []', () => {
    const linter = new JSONLinter('[]');
    const status = linter.validate();
    expect(status.valid).toBe(true);
});

test('should throw error if there is no close bracket', () => {
    const linter = new JSONLinter('[');
    const status = linter.validate();
    expect(status.valid).toBe(false);
});

test('should throw error if objects property does not have value', () => {
    const linter = new JSONLinter('{"test",}');
    const status = linter.validate();
    expect(status.valid).toBe(false);
});

test('should parse array', () => {
    const linter = new JSONLinter('[true, false, null, null, true, "aaa"]');
    const status = linter.validate();
    expect(status.valid).toBe(true);
});

test('should parse object', () => {
    const obj = {
        prop1: 'test',
        prop2: null,
        prop3: true,
        prop4: false,
        prop5: {},
        prop6: [null],
    };
    const linter = new JSONLinter(JSON.stringify(obj));
    const status = linter.validate();
    expect(status.valid).toBe(true);
});

test('should parse multiple level object', () => {
    const obj = {
        prop1: {
            prop2: {
                prop3: {
                    prop4: {
                        prop6: [{
                            prop7: null,
                        }],
                    },
                },
            },
        },
    };
    const linter = new JSONLinter(JSON.stringify(obj));
    const status = linter.validate();
    expect(status.valid).toBe(true);
});

test('should validate object with one member', () => {
    const testObject = {
        amount: 20.45,
    };
    const linter = new JSONLinter(JSON.stringify(testObject));
    const status = linter.validate();
    expect(status.valid).toBe(true);
});

test('should validate object with multiple members', () => {
    const testObject = {
        amount: 20.45,
        obj: { description: 'test' },
        arr: ['test', null, true, false, 10, 0, 0.1e+2, { str: 'test2' }],
        escape: '\r\n',
        empty: null,
    };
    const linter = new JSONLinter(JSON.stringify(testObject));
    const status = linter.validate();
    expect(status.valid).toBe(true);
});

test('should validate object with string members in different languages', () => {
    const testObject = {
        Ukrainian: '????????????????????',
        Japanese: '??????',
        Spanish: 'Espa??ol',
        Slovak: 'Sloven??ina',
    };
    const linter = new JSONLinter(JSON.stringify(testObject));
    const status = linter.validate();
    expect(status.valid).toBe(true);
});

test('should validate object with string members with unicode', () => {
    const testObject = {
        'WHITE FROWNING FACE (U+2639)': '\ud83d\ude1e',
        'WIDE ALPHABET': '\uff20\uff21\uff22\uff23\uff24\uff25\uff26\uff27\uff28\uff29\uff2a\uff2b\uff2c\uff2d\uff2e\uff2f\uff30\uff31\uff32\uff33\uff34\uff35\uff36\uff37\uff38\uff39\uff3a',
        'Vive Unicode': '\ud835\udce5\ud835\udcf2\ud835\udcff\ud835\udcee \ud835\udce4\ud835\udcf7\ud835\udcf2\ud835\udcec\ud835\udcf8\ud835\udced\ud835\udcee',
    };
    const linter = new JSONLinter(JSON.stringify(testObject));
    const status = linter.validate();
    expect(status.valid).toBe(true);
});

test('should return error if there is non whitespace symbol after JSON data', () => {
    const linter = new JSONLinter('[]]');
    const status = linter.validate();
    expect(status.valid).toBe(false);
});

test('should return error if there array is not closed', () => {
    const linter = new JSONLinter('[1');
    const status = linter.validate();
    expect(status.valid).toBe(false);
});

test('should parse array with new lines', () => {
    const linter = new JSONLinter('[1,\r \r2\r,\r\r\r3]');
    const status = linter.validate();
    expect(status.valid).toBe(true);
});

test('should parse object with new lines', () => {
    const linter = new JSONLinter('{"a"\r:1\r,\r\r"b":2\r\r}');
    const status = linter.validate();
    expect(status.valid).toBe(true);
});

test('should parse object with tabs', () => {
    const linter = new JSONLinter('{"a"\r\t:1\r, \r \r\t"b":2\r\r}');
    const status = linter.validate();
    expect(status.valid).toBe(true);
});
