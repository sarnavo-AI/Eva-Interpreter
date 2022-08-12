const assert = require('assert');

const Environment = require('./Environment');

class Eva {

    constructor(global = new Environment()) {
        this.global = global;
    }

    eval(exp, env = this.global) {
        
        // Self Evaluating Expressions
        //////////////////////////////
        if(isNumber(exp)) {
            return exp;
        }

        if(isString(exp)) {
            return  exp.slice(1, -1);
        }

        // Math Functions
        //////////////////////////////
        if(exp[0] === '+') {
            return this.eval(exp[1], env) + this.eval(exp[2], env);
        }                                                
        
        if(exp[0] === '*') {
            return this.eval(exp[1], env) * this.eval(exp[2], env);
        }                                                
        
        if(exp[0] === '-') {
            return this.eval(exp[1], env) - this.eval(exp[2], env);
        }   

        if(exp[0] === '/') {
            if(this.eval(exp[2], env) != 0)
                return this.eval(exp[1], env) / this.eval(exp[2], env);
            else
                return undefined;
        }

        // Blocks
        //////////////////////////////
        if(exp[0] === 'begin') {
            const blockEnv = new Environment({}, env);
            return this._evalBlock(exp, blockEnv);
        }

        // Variables
        //////////////////////////////
        if(exp[0] === 'var') {
            const [_, name, value] = exp;
            return env.define(name, this.eval(value, env));
        }

        if(isVariableName(exp)) {
            return env.lookup(exp);
        }


        throw `Unimplemented ${JSON.stringify(exp)}`;
    }

    _evalBlock(exp, env) {
        // Returning the last expression of the block
        let result;
        const [_tag, ...expressions] = exp;

        expressions.forEach(exp => {
            result = this.eval(exp, env);
        });

        return result;
    }
}

function isNumber(exp) {
    return typeof exp === 'number';
}

function isString(exp) {
    return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
}

function isVariableName(exp) {
    return typeof exp === 'string' && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(exp);
}


//////////////////////////////////////////////
const eva = new Eva(new Environment({
    null: null,
    true: true,
    false: false,
    VERSION: '0.1'
}));

assert.strictEqual(eva.eval(1), 1);
assert.strictEqual(eva.eval('"Sarnavo"'), 'Sarnavo');
assert.strictEqual(eva.eval(['+', 1, 2]), 3);
assert.strictEqual(eva.eval(['*', 2, 3]), 6);

assert.strictEqual(eva.eval(['var', 'x', '"10"']), '10');
assert.strictEqual(eva.eval('x'), '10');

assert.strictEqual(eva.eval(['var', 'x', 'true']), true);

assert.strictEqual(eva.eval(['var', 'x', ['*', 2, 2]]), 4);

assert.strictEqual(eva.eval(
    ['begin', 
        ['var', 'x', 20],
        ['var', 'y', 30],

        ['+', ['*', 'x', 'y'], 30]
    ]), 630)

assert.strictEqual(eva.eval(
    ['begin', 
        ['var', 'x', 20],

        ['begin', 
            ['var', 'x', 10],
            'x'
        ],

        'x'
    ]), 20)

assert.strictEqual(eva.eval(
    ['begin', 
        ['var', 'x', 20],

        ['var', 'res', ['begin', 
            ['var', 'y', 10],
            ['+', 'x', 'y']
        ]],

        'res'
    ]), 30)

console.log("All Assertions Passed!");