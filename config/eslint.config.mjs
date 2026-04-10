import {defineConfig} from 'eslint/config';
import globals from 'globals';
import html from '@html-eslint/eslint-plugin';
import js from '@eslint/js';

const configjs = (files, sourceType, globs = {}) => ({
	extends: ['js/all'],
	files: [files],
	languageOptions: {
		ecmaVersion: 2020,
		globals: globs,
		sourceType,
	},
	linterOptions: {
		reportUnusedDisableDirectives: 'error',
		reportUnusedInlineConfigs: 'error',
	},
	plugins: {js},
	rules: {
		'func-names': [
			'error',
			'never',
		],
		'id-length': 'off',
		'no-bitwise': 'off',
		'no-magic-numbers': [
			'error',
			{
				ignore: [
					0,
					1,
				],
			},
		],
		'no-ternary': 'off',
		'one-var': [
			'error',
			'never',
		],
		strict: [
			'error',
			'global',
		],
	},
});

export default defineConfig([
	configjs('**/*.mjs', 'module'),
	{
		extends: ['html/all'],
		files: ['**/main.xhtml'],
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
			'html/require-closing-tags': [
				'error',
				{
					selfClosing: 'always',
				},
			],
			'html/require-content': 'off',
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
				},
			],
		},
	},
	configjs('**/worker.js', 'script', globals.worker),
]);
