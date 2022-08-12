const assert = require('assert');

module.exports = eva => {
    assert.strictEqual(eva.eval(['+', 1, 2]), 3);
    assert.strictEqual(eva.eval(['*', 2, 3]), 6);
}

