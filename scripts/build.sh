#!/bin/sh
set -eu

swc() {
	npx swc -f "$1" --config-file config/swc.json -q
}

npm i svgo @swc/cli @swc/core vnu-jar > /dev/null

dir=_site/$(git branch --show-current)
mkdir -p "${dir}/tmp/"

css=$(tr -d '\t\n' < src/style.css | sed 's/\/\*(.*?)\*\///g;s/ {/{/g;s/: /:/g;s/, /,/g;s/ }/}/g;s/img/svg/g')
echo "<style>${css}</style>" > "${dir}/tmp/style.css"

favicon=$(npx svgo -o - --config config/svgo.mjs src/favicon.svg | sed "s/&quot;/'/g" | base64 -w 0)
mime=image/svg+xml
echo "<link type=\"${mime}\" href=\"data:${mime};base64,${favicon}\" rel=\"icon\"/>" > "${dir}/tmp/favicon.svg"

for file in src/icons/*; do
	npx svgo -o - --config config/svgo.mjs "${file}" > "${dir}/tmp/${file##*/}"
done

cmds=/test.css/d\;
workers=
for file in src/workers/*; do
	worker="${file##*/}"
	cmds="${cmds}/${worker}/d;"
	worker="const ${worker%.*}String=\"'use strict';$(sed -n '/functions/q;p' "${file}" | swc "${file}")\";"
	workers="${workers}${worker}"
done
js=$({
	echo "${workers}"
	cat src/main.js
} | swc src/main.js)
echo "<script>//<![CDATA['use strict';{${js}}//]]></script>" > "${dir}/tmp/main.js"

for file in "${dir}"/tmp/*; do
	cmds="${cmds}/${file##*/}/{
		r ${file}
		d
	};"
done
sed "${cmds}" src/main.xhtml | tr -d '\t\n' | sed 's/<!\[CDATA\[/&\n/' > "${dir}/index.xhtml"

rm -r "${dir}/tmp"

npx vnu-jar --Werror "${dir}/index.xhtml"
