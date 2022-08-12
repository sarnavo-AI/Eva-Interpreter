const Eva = require("../Eva");
const Environment = require("../Environment");

const tests = [
    require("./self-eval-test"),
    require("./math-test"),
    require("./variable-test"),
    require("./block-test"),
    require("./if-test"),
]

const eva = new Eva(new Environment({
    null: null,
    true: true,
    false: false,
    VERSION: '0.1'
}));

tests.forEach(test => test(eva));

console.log("All Assertions Passed!");
