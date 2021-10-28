function JSONStream(json) {
    this.json = json.replace(/\r\n|\n\r|\n/g, '\r');
    this.pos = 0;
}

JSONStream.prototype.getChar = function () {
    if (this.isEOF()) {
        return null;
    }

    const char = this.json.charAt(this.pos);
    this.pos += 1;

    return char;
};

JSONStream.prototype.peekChar = function () {
    if (this.isEOF()) {
        return null;
    }

    return this.json.charAt(this.pos);
};

JSONStream.prototype.isEOF = function () {
    return this.pos >= this.json.length;
};

JSONStream.prototype.currentCodeSnippet = function (snippetSize) {
    const fromIndex = Math.max(0, this.pos - snippetSize);

    return this.json.slice(fromIndex, this.pos);
};

module.exports = JSONStream;
