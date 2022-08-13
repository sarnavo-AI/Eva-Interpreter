const assert = require('assert');
const test = require('./test-util');

module.exports = eva => {
    // test(eva, 
    //     `
    //     (begin
    //         (def square (x) (+ x x))
    //         (square 2))
    //     `, 4);

    test(eva, 
        `  
        (begin
            (def square (x)
                (* x x))

            (square 2)
        )
        `, 4);

    // test(eva,
    //     `
    //     (begin
    //         (var x 4)
    //         (* x x))
    //     `, 16)
}

