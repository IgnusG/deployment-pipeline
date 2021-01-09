.PHONY: build

version:
	npm version $(bump) -m "Bump version to v%s" --preid=""

build:
	CHANNEL=$(channel) TARGET=$(target) node ./extension/functions/create-manifest.js

package:
	CHANNEL=$(channel) TARGET=$(target) node ./extension/functions/create-package.js

publish:
	CHANNEL=$(channel) TARGET=$(target) node ./extension/functions/publish-package.js
