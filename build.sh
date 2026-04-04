#!/bin/sh
set -e
npm install svgo @swc/cli @swc/core
favicon() {
	sed "s_$1_data:image/svg+xml,$(npx svgo $1 -o - | sed 's/"/%22/g;s/</%3C/g;s/>/%3E/g')_"
}
worker() {
	sed "s_<script src=\"$1\"></script>__;s_`'use strict';onmessage=\${onmessage}`_\"$(npx swc -q $1)\"_"
}
tr -d '\t\n' | favicon favicon.svg | worker worker.js < Enigma.xhtml > index.xhtml
