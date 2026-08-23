#!/bin/sh
set -eu

if [ "$#" -eq 0 ]; then
	npmi() {
		npm i "$@" > /dev/null
	}
else
	alias npmi=true
fi

npmi shellcheck
npx shellcheck -o all scripts/*.sh
npmi vnu-jar
npx vnu-jar --Werror --also-check-css --also-check-svg src/*.xhtml src/*.css src/svg/*.svg src/svg/*/*.svg
npmi html-validate
npx html-validate -c config/htmlvalidate.json src/main.xhtml
npmi eslint @eslint/css globals @html-eslint/eslint-plugin @eslint/js @eslint/json @stylistic/eslint-plugin
npx eslint -c config/eslint.config.mjs
