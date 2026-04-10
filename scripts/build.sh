#!/bin/sh
set -eu
sudo apt-get -qq install librsvg2-bin
npm install svgo @swc/cli @swc/core > /dev/null
favicon() {
	substitutions=
	for c in \  \" \# \< \> \{ \}; do
		substitutions="${substitutions}s/${c}/%$(printf %X \'"${c}")/g;"
	done
	favicon="$(npx svgo "$1" -o - --multipass | sed "${substitutions}")"
	sed "s_${1#*/}_data:image/svg+xml,${favicon}_"
}
icons() {
	substitutions=
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
rsvg-convert --page-width 1200 --page-height 630 --top 15 --left 300 -w 600 -h 600 src/favicon.svg > _site/og.png
npm install vnu-jar > /dev/null
npx vnu-jar --Werror _site/index.xhtml
