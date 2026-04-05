import {defineConfig} from 'eslint/config';
import html from '@html-eslint/eslint-plugin';
import js from '@eslint/js';

export default defineConfig([
	{
		extends: ['js/all'],
		files: ['**/*.mjs'],
		languageOptions: {
			ecmaVersion: 11,
		},
		linterOptions: {
			noInlineConfig: true,
		},
		plugins: {js},
		rules: {
			'func-names': [
				'error',
				'never',
			],
			'id-length': 'off',
			'logical-assignment-operators': [
				'error',
				'always',
				{
					enforceForIfStatements: true,
				},
			],
			'no-bitwise': 'off',
			'no-ternary': 'off',
			'one-var': [
				'error',
				'never',
			],
		},
	},
	{
		extends: ['html/all'],
		files: ['**/*.xhtml'],
		language: 'html/html',
		plugins: {html},
		rules: {
			'html/attrs-newline': [
				'error',
				{
					ifAttrsMoreThan: 5,
				},
			],
			'html/element-newline': [
				'error',
				{
					skip: [
						'dd',
						'p',
					],
				},
			],
			'html/indent': [
				'error',
				'tab',
			],
			'html/lowercase': 'off',
			'html/no-multiple-empty-lines': [
				'error',
				{
					max: 0,
				},
			],
			'html/require-closing-tags': [
				'error',
				{
					selfClosing: 'always',
				},
			],
			'html/require-explicit-size': 'off',
			'html/require-form-method': 'off',
			'html/require-open-graph-protocol': 'off',
			'html/sort-attrs': [
				'error',
				{
					priority: [
						"xmlns",
						"id",
						"name",
						"type",
						"class",
						"style",
					],
				}
			],
		},
	},
]);
