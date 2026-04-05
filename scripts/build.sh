#!/bin/sh
set -e
npm install svgo @swc/cli @swc/core
favicon() {
	sed "s_$1_data:image/svg+xml,$(npx svgo "$1" -o - | sed 's/"/%22/g;s/</%3C/g;s/>/%3E/g')_"
}
svg() {
	for icon in "$@"; do
		echo "$icon"
		sed "s_<img alt=\"\" src=\"$icon\"/>_$(npx svgo "$icon" -o -)_"
	done
}
worker() {
	sed "s_<script src=\"$1\"></script>__;s_'use strict';onmessage=\${onmessage}_$(npx swc -q "$1")_"
}
tr -d '\t\n' < main.xhtml | favicon favicon.svg | svg icons/*.svg | worker worker.js > index.xhtml
