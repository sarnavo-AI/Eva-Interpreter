const assert = require('assert');

module.exports = eva => {
    assert.strictEqual(eva.eval(
        ['begin', 
            ['var', 'x', 20],
            ['var', 'y', 30],
    
            ['if', ['>', 'x', 10], 
                    ['set', 'y', 40],
                    ['set', 'y', 50],
            ],

            'y'
        ]), 40)
    

}

