#!/bin/sh
set -eu
npm i vnu-jar > /dev/null
npx vnu-jar --Werror --also-check-css --also-check-svg src/*.xhtml src/*.css src/*.svg src/icons/*.svg
npm i html-validate > /dev/null
npx html-validate -c config/htmlvalidate.json src/main.xhtml
npm i eslint @eslint/css globals @html-eslint/eslint-plugin @eslint/js @eslint/json @stylistic/eslint-plugin > /dev/null
npx eslint -c config/eslint.config.mjs
