module.exports = {
    "extends": "airbnb-base",
    "rules": {
        "no-unused-vars": [0, { "vars": "local" }],
        "func-names": ["error", "never"],
        "strict": [0, "global"],
        "prefer-destructuring": ["error", {"object": false, "array": false}],

        "camelcase": [0, {"properties": "never"}],
        "no-param-reassign": [0],
        "wrap-iife": [0],
        "no-underscore-dangle": [0],  // Private functions

        // I like to use continue instead of deep nesting.
        "no-continue": [0],
        "no-mixed-operators": [0],
        "no-shadow": [0],  // Allow shadowing variables.

        // DEV
        "no-console": [0],  // Leyfum console
        "no-constant-condition": [0]
    }
};
