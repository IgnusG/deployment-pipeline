version:
	npm version $(bump) -m "Bump version to v%s" --preid="preview"

build:
	echo "Building $(channel)"

package:
	echo "Packaging $(channel)"

upload:
	echo "Uploading $(channel)"

publish:
	make build channel=$(channel) && \
	make package channel=$(channel) && \
	make upload channel=$(channel)

