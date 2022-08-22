const test = require("./test-util");

module.exports = (eva) => {
    test(eva, 
        `
        (begin
           (def onClick (callback)
                (begin
                    (var x 10)
                    (callback x)
                )
           )
           
           (onClick (lambda (data) (* data 10)))
        )
        `
        , 100);

        test(eva, 
            `
            ((lambda (x) (* x x)) 2)
            `
            , 4)
}