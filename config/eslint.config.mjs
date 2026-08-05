import css from '@eslint/css';
import {defineConfig} from 'eslint/config';
import globals from 'globals';
import html from '@html-eslint/eslint-plugin';
import js from '@eslint/js';
import json from '@eslint/json';
import stylistic from '@stylistic/eslint-plugin';

const error = object => [
	'error',
	object,
];

const configjs = (files, globs = {}) => ({
	extends: ['js/all'],
	files: [files],
	languageOptions: {
		ecmaVersion: 2020,
		globals: globs,
		sourceType: files.endsWith('.mjs') ? 'module' : 'script',
	},
	linterOptions: {
		reportUnusedDisableDirectives: 'error',
		reportUnusedInlineConfigs: 'error',
	},
	plugins: {js},
	rules: {
		'func-names': error('never'),
		'id-length': 'off',
		'init-declarations': 'off',
		'max-lines': 'off',
		'max-statements': 'off',
		'no-bitwise': 'off',
		'no-invalid-this': 'off',
		'no-loop-func': 'off',
		'no-magic-numbers': 'off',
		'no-param-reassign': 'off',
		'no-ternary': 'off',
		'no-unused-vars': error({
			args: 'none',
		}),
		'one-var': [
			'error',
			'never',
		],
		'prefer-destructuring': error({
			AssignmentExpression: {
				array: true,
				object: false,
			},
			VariableDeclarator: {
				array: true,
				object: true,
			},
		}),
		strict: error('global'),
	},
});

const configStylistic = stylistic.configs.customize({
	braceStyle: '1tbs',
	indent: 'tab',
	jsx: false,
	quoteProps: 'as-needed',
	semi: true,
});
configStylistic.files = ['**/*.{js,mjs}'];
configStylistic.rules['@stylistic/array-bracket-newline'] = error({
	minItems: 2,
	multiline: false,
});
configStylistic.rules['@stylistic/arrow-parens'] = error('as-needed');
configStylistic.rules['@stylistic/curly-newline'] = error('always');
configStylistic.rules['@stylistic/function-call-argument-newline'] = error('consistent');
configStylistic.rules['@stylistic/function-call-spacing'] = 'error';
configStylistic.rules['@stylistic/function-paren-newline'] = 'error';
configStylistic.rules['@stylistic/implicit-arrow-linebreak'] = 'error';
configStylistic.rules['@stylistic/line-comment-position'] = 'error';
configStylistic.rules['@stylistic/linebreak-style'] = 'error';
configStylistic.rules['@stylistic/max-len'] = error({
	// To lower to 120
	code: 140,
	tabWidth: 8,
});
configStylistic.rules['@stylistic/multiline-ternary'] = error('never');
configStylistic.rules['@stylistic/no-extra-parens'] = error('all');
configStylistic.rules['@stylistic/no-extra-semi'] = 'error';
configStylistic.rules['@stylistic/no-mixed-operators'] = 'off';
configStylistic.rules['@stylistic/object-curly-newline'] = error({
	ExportDeclaration: 'never',
	ImportDeclaration: 'never',
	ObjectExpression: {
		consistent: true,
		minProperties: 2,
	},
	ObjectPattern: 'never',
});
configStylistic.rules['@stylistic/object-curly-spacing'] = error('never');
configStylistic.rules['@stylistic/object-property-newline'] = 'error';
configStylistic.rules['@stylistic/one-var-declaration-per-line'] = error('always');
configStylistic.rules['@stylistic/semi-style'] = error('last');
configStylistic.rules['@stylistic/space-before-function-paren'] = error('never');
configStylistic.rules['@stylistic/switch-colon-spacing'] = 'error';

export default defineConfig([
	{
		extends: ['css/recommended'],
		files: ['**/*.css'],
		language: 'css/css',
		plugins: {css},
	},
	{
		extends: ['html/all'],
		files: ['**/main.xhtml'],
		language: 'html/html',
		plugins: {html},
		rules: {
			'html/attrs-newline': 'off',
			// To remove
			'html/element-newline': error({
				skip: [
					'dd',
					'p',
				],
			}),
			'html/indent': error('tab'),
			'html/lowercase': 'off',
			'html/require-closing-tags': error({
				selfClosing: 'always',
			}),
			'html/require-content': 'off',
			'html/require-explicit-size': 'off',
			'html/require-form-method': 'off',
			'html/sort-attrs': error({
				priority: [
					'xmlns',
					'id',
					'name',
					'property',
					'type',
					'class',
					'style',
				],
			}),
		},
	},
	configjs('**/*.mjs'),
	configjs('**/main.js', globals.browser),
	configjs('**/workers/*.js', globals.worker),
	{
		extends: ['json/recommended'],
		files: ['**/*.json'],
		ignores: ['**/package-lock.json'],
		language: 'json/json',
		plugins: {json},
		rules: {
			'json/sort-keys': 'error',
			'json/top-level-interop': 'error',
		},
	},
	configStylistic,
]);
