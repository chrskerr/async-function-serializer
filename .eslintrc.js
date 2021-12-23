module.exports = {
	"env": {
		"node": true,
		"es2021": true,
		"jest": true,
	},
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
	],
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"ecmaVersion": 12,
		"sourceType": "module",
	},
	"plugins": [
		"@typescript-eslint",
		"eslint-plugin-tsdoc",
	],
	"rules": {
		"prefer-const": "error",
		"prefer-spread": "error",
		"no-loop-func": "error",
		"no-undef": "error",
		"@typescript-eslint/ban-ts-comment": "off",
		"tsdoc/syntax": "warn",
	},
};
