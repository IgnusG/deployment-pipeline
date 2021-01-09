module.exports = {
    parser: "@typescript-eslint/parser",
    extends: [
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier"
    ],
    plugins: [
        "@typescript-eslint",
    ],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json']
    },
    rules: {
        "comma-dangle": [
            "error",
            ["arrays", "objects", "imports", "exports", "functions"].reduce((a, r) => ({ ...a, [r]: "always-multiline" }), {})
        ],
        "max-len": "off",
        "import/order": ["error", {
            alphabetize: {
                order: 'asc',
            },
            "newlines-between": "always-and-inside-groups"
        }],
        "@typescript-eslint/switch-exhaustiveness-check": "error",
    },
    settings: {
        "import/resolver": {
            typescript: {}
        },
    },
};
