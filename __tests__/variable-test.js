const assert = require('assert');

module.exports = eva => {
    assert.strictEqual(eva.eval(['var', 'x', '"10"']), '10');
    assert.strictEqual(eva.eval('x'), '10');
    
    assert.strictEqual(eva.eval(['var', 'x', 'true']), true);
    
    assert.strictEqual(eva.eval(['var', 'x', ['*', 2, 2]]), 4);
}

