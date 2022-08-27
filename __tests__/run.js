const Eva = require("../Eva");
const Environment = require("../Environment");

const tests = [
    require("./self-eval-test"),
    require("./math-test"),
    require("./variable-test"),
    require("./block-test"),
    require("./if-test"),
    require("./while-test"),
    require("./built-in-function-test"),
    require("./user-defined-function-test"),
    require("./lambda-function-test"),
    require('./switch-test'),
    require('./for-test'),
    require('./class-test')
]

const eva = new Eva();

tests.forEach(test => {
    test(eva);
});

// eva.eval(['print', '"Hello"', '"World"']);

console.log("All Assertions Passed!");
