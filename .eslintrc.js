module.exports = {
	/*extends: "@loopback/eslint-config",	*/
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: ['./tsconfig.json'], // Specify it only for TypeScript files
		tsconfigRootDir: __dirname,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint'],
	root: true,
	ignorePatterns: ["**/*.json"],
	/*https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/naming-convention.md 
	{ selector: "variableLike", format: ["camelCase"] },
	{ selector: "memberLike", modifiers: ["public"], format: ["camelCase"]},
	 { selector: "variableLike", format: ["PascalCase"] },
	 { selector: "default", format: ["camelCase"] },     
	*/
	rules: {
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/naming-convention": [
			"error",
			{ selector: "variable", format: ["PascalCase", "camelCase"] },
			{ selector: "parameter", format: ["PascalCase", "camelCase"], leadingUnderscore: "allow" },
			{ selector: "objectLiteralProperty", format: ["PascalCase", "camelCase", "UPPER_CASE"] },
			{ selector: "objectLiteralMethod", format: ["PascalCase"] },
			{ selector: "class", format: ["PascalCase"] },
			{ selector: "classMethod", format: ["PascalCase"], modifiers: ["private"], leadingUnderscore: "allow" },
			{ selector: "classMethod", format: ["PascalCase"], modifiers: ["protected"], leadingUnderscore: "allow" },
			{ selector: "classMethod", format: ["PascalCase"], modifiers: ["public"], leadingUnderscore: "allow" },
			{ selector: "classProperty", format: ["PascalCase", "UPPER_CASE"] },
			{ selector: "enum", format: ["PascalCase", "UPPER_CASE"] },
			{ selector: "function", format: ["PascalCase"] },
			{ selector: "typeLike", format: ["PascalCase"] },
			{ selector: "typeParameter", format: ["UPPER_CASE"] },
			{ selector: "typeMethod", format: ["PascalCase"] },
			{ selector: "interface", format: ["PascalCase"], custom: { regex: "I[A-Z]", match: true } }
		],
	}
};
