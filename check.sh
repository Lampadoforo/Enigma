#!/bin/sh
set -e
wget -qO vnu.jar https://github.com/validator/validator/releases/download/latest/vnu.jar
java -jar vnu.jar Enigma.xhtml
npm install eslint @eslint/js @html-eslint/eslint-plugin
npx eslint
