const assert = require('assert');

module.exports = eva => {
    assert.strictEqual(eva.eval(
        ['begin', 
            ['var', 'res', 0],
            ['var', 'c', 0],
    
            ['while', ['<', 'c', 10],
                ['begin', 
                    ['set', 'res', ['+', 'res', 1]],
                    ['set', 'c', ['+', 'c', 1]],
                ],
            ],
        
            'res'
        ]), 10)
    
    
}

