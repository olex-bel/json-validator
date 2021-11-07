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
            throw new Error(errorMessage);
        }

        state = nextState;
    }

    return value;
}

module.exports.execStateMachine = execStateMachine;
