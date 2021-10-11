'use strict';

function isCharacterLetter(char) {
    return (/[a-zA-Z]/).test(char)
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

function isWhiteSpace(char) {
    return char === ' ' || char === '\t';
};

module.exports = {
    isCharacterLetter: isCharacterLetter,
    isMinusSign: isMinusSign,
    isPlusSign: isPlusSign,
    isDigit: isDigit,
    isWhiteSpace: isWhiteSpace
};