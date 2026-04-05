#!/bin/sh
set -e
npm install svgo @swc/cli @swc/core > /dev/null
favicon() {
	sed "s_${1#*/}_data:image/svg+xml,$(npx svgo "$1" -o - | sed 's/"/%22/g;s/#/%23/g;s/</%3C/g;s/>/%3E/g')_"
}
icons() {
	for icon in "$@"; do
		e="${e}s_<img alt=\"\" src=\"${icon#*/}\"/>_$(npx svgo "$icon" -o -)_;"
	done
	sed "$e"
}
worker() {
	sed "s#<script src=\"${1#*/}\"></script>##;s#'use strict';onmessage=\${onmessage}#$(npx swc -q "$1")#"
}
cat src/main.xhtml | favicon src/favicon.svg | icons src/icons/*.svg | worker src/worker.js > index.xhtml
