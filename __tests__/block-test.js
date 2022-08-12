const assert = require('assert');

module.exports = eva => {
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
    
    assert.strictEqual(eva.eval(
        ['begin', 
            ['var', 'data', 20],
    
            ['begin', 
                ['set', 'data', 10],
            ],
    
            'data'
        ]), 10)
}

