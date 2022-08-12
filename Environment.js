/*
* Environment: Name Storage
*/

 class Environment {
    constructor(record = {}) {
        this.record = record;
    }


    define(name, value) {
        this.record[name] = value;
        return value;
    }

    lookup(name) {
        // console.log(this.record)
        if(!this.record.hasOwnProperty(name)) {
            throw new ReferenceError(`Variable "${name}" is not defined.`);
        }
        return this.record[name];
    }
 }

module.exports = Environment;