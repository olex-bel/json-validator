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

JSONStringStream.prototype.getCurrentContextCodeSnippet = function () {
    const currentCharIndex = this.pos > 0 ? this.pos - 1 : 0;
    const fromIndex = Math.max(0, currentCharIndex - 10);
    const isTrimmed = fromIndex > 0;
    let codeSnippet = this.json.slice(fromIndex, currentCharIndex + 1);

    if (isTrimmed) {
        codeSnippet += `...${codeSnippet}`;
    }

    return codeSnippet;
};

module.exports = JSONStringStream;
