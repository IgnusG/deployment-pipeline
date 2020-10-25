version:
	npm version $(bump) -m "Bump version to v%s" --preid=""

build:
	echo "Building $(channel) $(target)"

package:
	echo "Packaging $(channel) $(target)"

upload:
	echo "Uploading $(channel) $(target)"

publish:
	make build channel=$(channel) target=$(target) && \
	make package channel=$(channel) target=$(target) && \
	make upload channel=$(channel) target=$(target)
