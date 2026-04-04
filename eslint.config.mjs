import {defineConfig} from 'eslint/config';
import html from '@html-eslint/eslint-plugin';
import js from '@eslint/js';

export default defineConfig([
	{
		extends: ['js/all'],
		files: ['*.mjs'],
		languageOptions: {
			ecmaVersion: 11,
		},
		linterOptions: {
			noInlineConfig: true,
		},
		plugins: {js},
		rules: {
			'array-callback-return': [
				'error',
				{
					checkForEach: true,
				},
			],
			'no-inner-declarations': [
				'error',
				'both',
			],
			'no-irregular-whitespace': [
				'error',
				{
					skipStrings: false,
				},
			],
			'no-undef': [
				'error',
				{
					typeof: true,
				},
			],
			'no-unsafe-optional-chaining': [
				'error',
				{
					disallowArithmeticOperators: true,
				},
			],
		},
	},
	{
		extends: ['html/all'],
		files: ['*.xhtml'],
		language: 'html/html',
		plugins: {html},
		rules: {
			'html/indent': [
				'error',
				'tab',
			],
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
			'html/require-open-graph-protocol': 'off',
			'html/sort-attrs': [
				'error',
				{
					priority: [
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
