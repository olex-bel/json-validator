function isCharacterLetter(char) {
    return (/[a-zA-Z]/).test(char);
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
