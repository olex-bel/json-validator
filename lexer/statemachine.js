function execStateMachine(stateMachine) {
    let state = 'START';
    let value = '';

    for (; ;) {
        const char = this.peekChar();
        const {
            nextState, readChar, skipChar, errorMessage,
        } = stateMachine[state](char);

        if (skipChar) {
            this.getChar();
        } else if (readChar) {
            value += this.getChar();
        }

        if (nextState === 'END') {
            break;
        } else if (nextState === 'ERROR') {
            const { line, column } = this.position;
            throw new Error(`${errorMessage} at line ${line} column ${column} of the JSON data`);
        }

        state = nextState;
    }

    return value;
}

module.exports.execStateMachine = execStateMachine;
