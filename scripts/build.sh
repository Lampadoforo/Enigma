#!/bin/sh
set -eu
npm i svgo @swc/cli @swc/core vnu-jar > /dev/null
dir=_site/$(git branch --show-current)
mkdir -p "${dir}/tmp/"
css=$(sed 's|/\*.*\*/||g' src/style.css | tr -d '\t\n' | sed -f scripts/css.sed)
echo "<style>${css}</style>" > "${dir}/tmp/style.css"
favicon=
for c in \  \" \# \< \> \{ \}; do
	favicon="${favicon}s/${c}/%$(printf %X \'"${c}")/g;"
done
favicon=$(npx svgo src/favicon.svg -o - --multipass | sed "${favicon}")
echo "<link type=\"image/svg+xml\" href=\"data:image/svg+xml,${favicon}\" rel=\"icon\"/>" > "${dir}/tmp/favicon.svg"
for file in src/icons/*; do
	npx svgo "${file}" -o - --multipass > "${dir}/tmp/${file##*/}"
done
worker=$(sed -n '/functions/q;p' src/worker.js | npx swc -f src/worker.js --config-file config/swc.json -q)
js=$({
	echo "const workerString=\"'use strict';${worker}\";"
	cat src/main.js
} | npx swc -f src/main.js --config-file config/swc.json -q)
echo "<script>//<![CDATA['use strict';{${js}}//]]></script>" > "${dir}/tmp/main.js"
cmds=/worker.js/d\;
for file in "${dir}"/tmp/*; do
	cmds="${cmds}/${file##*/}/{
		r ${file}
		d
	};"
done
sed "${cmds}" src/main.xhtml | tr -d '\t\n' | sed 's/<!\[CDATA\[/&\n/' > "${dir}/index.xhtml"
rm -r "${dir}/tmp"
npx vnu-jar --Werror "${dir}/index.xhtml"
