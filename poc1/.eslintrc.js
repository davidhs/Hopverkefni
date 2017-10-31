module.exports = {
    "extends": "airbnb-base",
    "rules": {
        "no-unused-vars": [0, { "vars": "local" }],
        "func-names": ["error", "never"],
        "strict": [0, "global"],
        "prefer-destructuring": ["error", {"object": false, "array": false}],
        "no-shadow": [
          "error",
          {
            "builtinGlobals": true,
            "hoist": "functions", 
            "allow": []
          }
        ]
    }
};
