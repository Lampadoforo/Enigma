#!/bin/sh
set -Ceu

svgBase64() {
	base64=$(npx svgo -o - --config config/svgo.mjs "$1" | sed "s/&quot;/'/g" | base64 -w 0)
	echo "data:image/svg+xml;base64,${base64}"
}

swc() {
	npx swc -f "$1" --config-file config/swc.json -q
}

if [ "$#" -eq 0 ]; then
	npm i svgo @swc/cli @swc/core vnu-jar > /dev/null
	sudo apt-get install librsvg2-bin
fi

branch=$(git branch --show-current)
dir="_site/${branch}"
mkdir -p "${dir}/tmp/"

cmds=
for file in src/svg/backgrounds/*; do
	name=${file##*/}
	base64=$(svgBase64 "${file}")
	echo "background-image: url('${base64}');" > "${dir}/tmp/${name}"
	cmds="${cmds}/${name}/{
		r ${dir}/tmp/${name}
		d
	};"
done

css=$(sed "${cmds}" src/style.css | tr -d '\t\n' | sed 's/\/\*[^\*]*\*\///g;s/ {/{/g;s/: /:/g;s/, /,/g')
echo "<style>${css}</style>" > "${dir}/tmp/style.css"
cmds=/test.css/d\;

favicon=$(svgBase64 src/svg/favicon.svg)
echo "<link type=\"image/svg+xml\" href=\"${favicon}\" rel=\"icon\"/>" > "${dir}/tmp/favicon.svg"

for file in src/svg/icons/*; do
	npx svgo -o - --config config/svgo.mjs "${file}" > "${dir}/tmp/${file##*/}"
done

rsvg-convert -o "${dir}/logo.png" -w 1200 src/svg/logo.svg
name=$(b3sum -l 3 --raw "${dir}/logo.png" | basenc --base64url).png
mv "${dir}/logo.png" "${dir}/${name}"
cmds="${cmds}s/logo.png/${branch}\/${name}/;"

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
