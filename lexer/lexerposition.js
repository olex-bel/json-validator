function LexerPosition() {
    this.line = 1;
    this.column = 1;
}

LexerPosition.prototype.increaseLineNumber = function () {
    this.line += 1;
    this.column = 1;
};
LexerPosition.prototype.increaseColumnNumber = function () {
    this.column += 1;
};

module.exports = LexerPosition;
