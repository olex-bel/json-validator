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
    isDot,
    isExponent,
};
