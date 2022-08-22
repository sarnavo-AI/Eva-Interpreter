/**
 * AST Tranformation
 */

class Transformer {
    /**
     * Transforms def into lamda
     */

    transformDeftoLambda(defExp) {
        const [_tag, name, params, body] = defExp;
        return ['var', name, ['lambda', params, body]];
    }

    transformSwitchtoIf(switchExp) {
        const [_tag, ...cases] = switchExp;

        let ifExp = ['if', null, null, null];

        let current = ifExp;

        for(let i = 0; i < cases.length - 1; i++) {
            const [currentCond, currentBlock] = cases[i];

            current[1] = currentCond;
            current[2] = currentBlock;

            const next = cases[i + 1];
            const [nextCond, nextBlock] = next;

            current[3] = nextCond === 'else' ? nextBlock : ['if'];

            current = current[3];
        }

        return ifExp;
    }

    transformForToWhile(forExp) {
        const [_tag, ...exp] = forExp;
        let whileExp = ['begin', exp[0], ['while', exp[1], ['begin', exp[3], exp[2]]]];

        return whileExp;
    }

    transformIncreaseToSet(increaseExp) {
        let setExp = ['set']
        if(increaseExp[0] === '++') {
            const [_op, variable] = increaseExp;
            const addExp = ['+', variable, 1];

            setExp[1] = variable;
            setExp[2] = addExp;
        }

        if(increaseExp[0] === '+=') {
            const [_op, variable1, variable2] = increaseExp;
            const addExp = ['+', variable1, variable2];

            setExp[1] = variable1;
            setExp[2] = addExp;
        }

        return setExp;
    }

    transformDecreaseToSet(decreaseExp) {
        let setExp = ['set']
        if(increaseExp[0] === '--') {
            const [_op, variable] = decreaseExp;
            const subExp = ['-', variable, 1];

            setExp[1] = variable;
            setExp[2] = subExp;
        }

        if(increaseExp[0] === '-=') {
            const [_op, variable1, variable2] = decreaseExp;
            const subExp = ['-', variable1, variable2];

            setExp[1] = variable1;
            setExp[2] = subExp;
        }

        return setExp;
    }
}

module.exports = Transformer;