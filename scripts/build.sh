#!/bin/sh
set -e
npm install svgo @swc/cli @swc/core > /dev/null
favicon() {
	favicon="$(npx svgo "$1" -o - --multipass | sed 's/ /%20/g;s/"/%22/g;s/#/%23/g;s/</%3C/g;s/>/%3E/g;s/{/7B/g;s/}/7D/g')"
	sed "s_${1#*/}_data:image/svg+xml,${favicon}_"
}
icons() {
	for file in "$@"; do
		icon="$(npx svgo "${file}" -o - --multipass )"
		substitutions="${substitutions}s_<img alt=\"\" src=\"${file#*/}\"/>_${icon}_;"
	done
	sed "${substitutions}"
}
worker() {
	worker="$(sed -n '/functions/q;p' "$1" | npx swc -f "$1" --config-file config/swc.json -q | sed 's#&#\\&#g')"
	grep -v "<script src=\"${1#*/}\"></script>" | sed "s#workerString#\`${worker}\`#"
}
mkdir -p _site/
favicon src/favicon.svg < src/main.xhtml | icons src/icons/*.svg | worker src/worker.js > _site/index.xhtml
npm install vnu-jar > /dev/null
npx vnu-jar --Werror _site/index.xhtml
