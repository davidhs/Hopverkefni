module.exports = {
    "extends": "airbnb-base",
    "rules": {
        // Global variables might be defined in some file, but
        // it might not be used in that file but used in other files.
        "no-unused-vars": [0, { "vars": "local" }],
        // Allow anonymous functions.
        "func-names": ["error", "never"],
        // Every file should start with 'use strict';
        "strict": [0, "global"],
        // Ignore this prefered ES6 feature.
        "prefer-destructuring": ["error", {"object": false, "array": false}],
        // Global variables start with g_
        "camelcase": [0, {"properties": "never"}],
        // Allow instantaneous calling of anonymous functions.
        "wrap-iife": [0],
        // Start with underscore to indicate private function / method.
        "no-underscore-dangle": [0],
        // Allow continue to prevent deep nesting.
        "no-continue": [0],
        // Allow a * b + c.
        "no-mixed-operators": [0],
        // Allow shadowing variables.
        "no-shadow": [0],

        // =======
        // DUBIOUS
        // =======

        // Most likely a bad idea.
        "no-param-reassign": [0],

        // ===============
        // DEVELOPING MODE
        // ===============

        // Allow console.
        "no-console": [0],
        // Allow logical commenting out code.
        "no-constant-condition": [0]
    }
};
