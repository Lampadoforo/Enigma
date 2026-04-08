#!/bin/sh
set -e
npm install vnu-jar > /dev/null
npx vnu-jar --Werror --also-check-css --also-check-svg src/*.xhtml src/*.css src/*.svg src/icons/*.svg
npm install eslint @eslint/js @html-eslint/eslint-plugin globals > /dev/null
npx eslint -c config/eslint.config.mjs
