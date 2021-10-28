function execStateMachine(stateMachine) {
    let state = 'START';
    let value = '';

    for (; ;) {
        const char = this.stream.peekChar();
        const { nextState, readChar, skipChar } = stateMachine[state](char);

        if (skipChar) {
            this.stream.getChar();
        } else if (readChar) {
            value += this.stream.getChar();
        }

        if (nextState === 'END') {
            break;
        } else if (nextState === 'ERROR') {
            throw new Error('Something wrong!');
        }

        state = nextState;
    }

    return value;
}

module.exports.execStateMachine = execStateMachine;
