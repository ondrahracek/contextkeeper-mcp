export default [
  {
    env: {
      node: true,
      es2022: true,
      jest: true
    },
    extends: [
      "eslint:recommended"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    },
    plugins: ["@typescript-eslint"],
    ignores: ["src/__tests__/**", "build/**"],
    rules: {}
  },
];