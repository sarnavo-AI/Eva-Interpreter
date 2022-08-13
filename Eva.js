const assert = require('assert');

const Environment = require('./Environment');

class Eva {

    constructor(global = GlobalEnvironment) {
        this.global = global;
    }

    eval(exp, env = this.global) {
        
        // Self Evaluating Expressions
        //////////////////////////////
        if(this._isNumber(exp)) {
            return exp;
        }

        if(this._isString(exp)) {
            return  exp.slice(1, -1);
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

        if(exp[0] === 'set') {
            const [_, name, value] = exp;
            return env.assign(name, this.eval(value, env));
        }

        if(this._isVariableName(exp)) {
            return env.lookup(exp);
        }

        // If Statement
        //////////////////////////////
        if(exp[0] === 'if') {
            const [_tag, condition, consequent, alternate] = exp;
            if(this.eval(condition, env)) {
                return this.eval(consequent, env);
            }
            else {
                return this.eval(alternate, env);
            }
        }

        // while Statement
        //////////////////////////////
        if(exp[0] === 'while') {
            const [_tag, condition, body] = exp;
            let result;
            while(this.eval(condition, env)) {
                result = this.eval(body, env);
            }
            return result;
        }

        // Function Declaration
        //////////////////////////////
        if(exp[0] === 'def') {
            const [_tag, name, params, body] = exp;

            const fn = {
                params,
                body,
                env, // closure
            };
            
            return env.define(name, fn); 
        }

        if(Array.isArray(exp)) {
            const function_name = this.eval(exp[0], env);
            const args = exp
                            .slice(1)
                            .map(arg => this.eval(arg, env));

            // Native Functions
            ///////////////////
            if(typeof function_name === 'function') {
                return function_name(...args);
            }

            // User defined Functions
            ///////////////////
            const activationRecord = {}

            function_name.params.forEach((param, index) => {
                activationRecord[param] = args[index];
            })

            const activationEnv = new Environment(
                activationRecord,
                function_name.env // Static scope
                // env --> will enable dynamic scoping
            );
            
            return this._evalBody(function_name.body, activationEnv);
        }
        
        // Unimplemented Section
        //////////////////////////////
        throw `Unimplemented ${JSON.stringify(exp)}`;
    }

    _evalBody(body, env) {
        if(body[0] === 'begin') {
            return this._evalBlock(body, env);
        }
        else {
            return this.eval(body, env);
        }
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

    _isNumber(exp) {
        return typeof exp === 'number';
    }
    
    _isString(exp) {
        return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
    }
    
    _isVariableName(exp) {
        return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z0-9_]*$/.test(exp);
    }
}

// Default Global Environment
const GlobalEnvironment = new Environment({
    null: null,
    true: true,
    false: false,

    VERSION: '0.1',

    // Math Functions
    //////////////////////////////
    '+'(op1, op2) {
        return op1 + op2;
    },

    '*'(op1, op2) {
        return op1 * op2;
    },

    '-'(op1, op2 = null) {
        if(op2 == null) {
            return -op1;
        }
        else {
            return op1 - op2;
        }
    },

    '/'(op1, op2) {
        if(op2 === 0) {
            return undefined;
        }
        else {
            return op1 / op2;
        }
    },


    // Comperator 
    //////////////////////////////
    '>'(op1, op2) {
        return op1 > op2;
    },

    '>='(op1, op2) {
        return op1 >= op2;
    },

    '<'(op1, op2) {
        return op1 < op2;
    },

    '<='(op1, op2) {
        return op1 <= op2;
    },

    '=='(op1, op2) {
        return op1 === op2;
    },

    // Print
    //////////////////////////////
    print(...args) {
        console.log(...args);
    }

});

module.exports = Eva;

//////////////////////////////////////////////

// Math Functions
        //////////////////////////////
        // if(exp[0] === '+') {
        //     return this.eval(exp[1], env) + this.eval(exp[2], env);
        // }                                                
        
        // if(exp[0] === '*') {
        //     return this.eval(exp[1], env) * this.eval(exp[2], env);
        // }                                                
        
        // if(exp[0] === '-') {
        //     return this.eval(exp[1], env) - this.eval(exp[2], env);
        // }   

        // if(exp[0] === '/') {
        //     if(this.eval(exp[2], env) != 0)
        //         return this.eval(exp[1], env) / this.eval(exp[2], env);
        //     else
        //         return undefined;
        // }

        // Operators
        //////////////////////////////
        // if(exp[0] === '>') {
        //     return this.eval(exp[1], env) > this.eval(exp[2], env);
        // }                                                
        
        // if(exp[0] === '<') {
        //     return this.eval(exp[1], env) < this.eval(exp[2], env);
        // }                                                
        
        // if(exp[0] === '>=') {
        //     return this.eval(exp[1], env) >= this.eval(exp[2], env);
        // }   

        // if(exp[0] === '<=') {
        //     return this.eval(exp[1], env) <= this.eval(exp[2], env);
        // }

        // if(exp[0] === '==') {
        //     return this.eval(exp[1], env) === this.eval(exp[2], env);
        // }
