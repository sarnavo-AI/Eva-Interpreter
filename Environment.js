/*
* Environment: Name Storage
*/

 class Environment {
    constructor(record = {}, parent = null) {
        this.record = record;
        this.parent = parent;
    }

    // Definition of Variable
    /////////////////////////////
    define(name, value) {
        this.record[name] = value;
        return value;
    }

    // Looking Up for the variable
    /////////////////////////////
    lookup(name) {
        return this.resolve(name).record[name];
    }

    // Resolve the variable
    /////////////////////////////
    resolve(name) {
        if(this.record.hasOwnProperty(name)) {
            return this;
        }

        if(this.parent == null) {
            throw new ReferenceError(`Variable "${name}" is not defined.`);
        }

        return this.parent.resolve(name);
    }

    // Assigning a value to a existing variable
    /////////////////////////////
    assign(name, value) {
        this.resolve(name).record[name] = value;
        return value;
    }
 }

module.exports = Environment;