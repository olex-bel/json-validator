function JSONStringStream(json) {
    this.json = json.replace(/\r\n|\n\r|\n/g, '\r');
    this.pos = 0;
}

JSONStringStream.prototype.isEOF = function () {
    return this.pos >= this.json.length;
};

JSONStringStream.prototype.getCharWithoutChangePosition = function () {
    if (this.isEOF()) {
        return null;
    }

    return this.json.charAt(this.pos);
};

JSONStringStream.prototype.getChar = function () {
    if (this.isEOF()) {
        return null;
    }

    const char = this.json.charAt(this.pos);
    this.pos += 1;
    return char;
};

module.exports = JSONStringStream;
