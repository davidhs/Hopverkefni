module.exports = {
    "extends": "airbnb-base",
    "rules": {
        "no-unused-vars": [0, { "vars": "local" }],
        "no-undef": [0, { "vars": "local" }],
        "no-underscore-dangle": [0, { "vars": "local" }],
        "func-names": ["error", "never"],
        "camelcase": [0, "global"],
        "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
        "strict": [0, "global"]
    }
};
