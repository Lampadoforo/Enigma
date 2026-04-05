#!/bin/sh
set -e
npm install shellcheck > /dev/null
npx shellcheck scripts/*.sh
npm install vnu-jar > /dev/null
npx vnu-jar --Werror --format text --also-check-css --also-check-svg src/*.xhtml src/*.css src/*.svg src/icons/*.svg
npm install eslint @eslint/js @html-eslint/eslint-plugin > /dev/null
npx eslint
