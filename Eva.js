const assert = require('assert');

const Environment = require('./Environment');
const Transformer = require("./transform/Transformer");
const evaParser = require("./parser/evaParser");
const fs = require("fs");

class Eva {

    constructor(global = GlobalEnvironment) {
        this.global = global;
        this._transformer = new Transformer();
    }

    eval(exp, env = this.global) {
        
        // console.log(exp);

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
            const [_, ref, value] = exp;

            if(ref[0] === 'prop') {
                const [_tag, instance, propName] = ref;
                const instanceEnv = this.eval(instance, env);

                return instanceEnv.define(
                    propName,
                    this.eval(value, env),
                );
            }

            return env.assign(ref, this.eval(value, env));
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

            // const fn = {
            //     params,
            //     body,
            //     env, // closure
            // };
            
            // return env.define(name, fn);
            
            // Just in time Transpilation
            // const varExp = ['var', name, ['lambda', params, body]];

            const varExp = this._transformer.transformDeftoLambda(exp);
            return this.eval(varExp, env);
        }

        // Switch Expression
        //////////////////////////////        
        if(exp[0] === 'switch') {
            const ifExp = this._transformer.transformSwitchtoIf(exp);
            
            return this.eval(ifExp, env);
        }

        // For Expression
        //////////////////////////////        
        if(exp[0] === 'for') {
            const whileExp = this._transformer.transformForToWhile(exp);
            
            return this.eval(whileExp, env);
        }

        // ++ Operator (++ foo)
        //////////////////////////////        
        if(exp[0] === '++') {
            const increaseExp = this._transformer.transformIncreaseToSet(exp);
            
            return this.eval(increaseExp, env);
        }

        // += Operator (+= foo inc)
        //////////////////////////////        
        if(exp[0] === '+=') {
            const increaseExp = this._transformer.transformIncreaseToSet(exp);
            
            return this.eval(increaseExp, env);
        }

        // -- Operator (-- foo)
        //////////////////////////////        
        if(exp[0] === '--') {
            const decreaseExp = this._transformer.transformDecreaseToSet(exp);
            
            return this.eval(decreaseExp, env);
        }

        // += Operator (-= foo dec)
        //////////////////////////////        
        if(exp[0] === '-=') {
            const decreaseExp = this._transformer.transformDecreaseToSet(exp);
            
            return this.eval(decreaseExp, env);
        }

        // Lamda Declaration
        //////////////////////////////
        if(exp[0] === 'lambda') {
            const [_tag, params, body] = exp;

            return {
                params,
                body,
                env, // closure
            }; 
        }

        // class Declaration
        //////////////////////////////
        if (exp[0] === 'class') {
            const [_tag, name, parent, body] = exp;

            const parentEnv = this.eval(parent, env) || env;

            const classEnv = new Environment({}, parentEnv);

            this._evalBody(body, classEnv);

            return env.define(name, classEnv);
        }

        // New Declaration
        //////////////////////////////
        if(exp[0] === 'new') {

            const classEnv = this.eval(exp[1], env);

            const instanceEnv = new Environment({}, classEnv);

            const args = exp
                            .slice(2)
                            .map(arg => this.eval(arg, env));

            this._callUserDefinedFunction(
                classEnv.lookup('constructor'),
                [instanceEnv, ...args],
            );

            return instanceEnv;
        }

        // Prop Declaration
        //////////////////////////////
        if(exp[0] === 'prop') {
            const [_tag, instance, name] = exp;

            const instanceEnv = this.eval(instance, env);

            return instanceEnv.lookup(name);
        }

        // Prop Declaration
        //////////////////////////////
        if(exp[0] === 'super') {
            const [_tag, className] = exp;
            return this.eval(className, env).parent; 
        }

        // Module Declaration
        //////////////////////////////
        if(exp[0] === 'module') {
            const [_tag, name, body] = exp;

            const moduleEnv = new Environment({}, env);

            this._evalBody(body, moduleEnv);

            return env.define(name, moduleEnv);
        }

        // import Declaration
        //////////////////////////////
        if(exp[0] === 'import') {
            const [_tag, name] = exp;

            const moduleSrc = fs.readFileSync(
                `${__dirname}/module/${name}.eva`,
                'utf-8',
            );

            const body = evaParser.parse(`(begin ${moduleSrc})`);
            
            const moduleExp = ['module', name, body];

            return this.eval(moduleExp, this.global);
        }


        if(Array.isArray(exp)) {
            const function_name = this.eval(exp[0], env);
            const args = exp
                            .slice(1)
                            .map(arg => this.eval(arg, env));
            // console.log("argument", args);
            // Native Functions
            ///////////////////
            if(typeof function_name === 'function') {
                return function_name(...args);
            }

            // User defined Functions
            ///////////////////
            
            return this._callUserDefinedFunction(function_name, args);

            // const activationRecord = {}
            // // console.log("function_name", function_name);
            // function_name.params.forEach((param, index) => {
            //     activationRecord[param] = args[index];
            // })
            // // console.log('activationRecord', activationRecord);
            // const activationEnv = new Environment(
            //     activationRecord,
            //     function_name.env // Static scope
            //     // env --> will enable dynamic scoping
            // );
            
            // return this._evalBody(function_name.body, activationEnv);


        }
        
        // Unimplemented Section
        //////////////////////////////
        throw `Unimplemented ${JSON.stringify(exp)}`;
    }

    _callUserDefinedFunction(function_name, args) {
        const activationRecord = {}
            // console.log("function_name", function_name);
            function_name.params.forEach((param, index) => {
                activationRecord[param] = args[index];
            })
            // console.log('activationRecord', activationRecord);
            const activationEnv = new Environment(
                activationRecord,
                function_name.env // Static scope
                // env --> will enable dynamic scoping
            );
            
            return this._evalBody(function_name.body, activationEnv);
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
