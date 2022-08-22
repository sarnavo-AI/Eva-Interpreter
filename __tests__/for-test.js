const test = require('./test-util');

module.exports = eva => {
    test(eva, 
        `
            (for 
                (var x 1)
                (<= x 10)
                (++ x)
                (print x)
            )
        `, 11)
}