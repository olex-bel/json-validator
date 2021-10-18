function JSONStreamPosition() {
    this.line = 1;
    this.column = 0;
}

JSONStreamPosition.prototype.increaseLineNumber = function () {
    this.line += 1;
    this.column = 0;
};

JSONStreamPosition.prototype.increaseColumnNumber = function () {
    this.column += 1;
};

JSONStreamPosition.prototype.getPositionStatus = function () {
    return {
        line: this.line,
        column: this.column,
    };
};

module.exports = JSONStreamPosition;
