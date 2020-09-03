GITHUB_REPO="datashare-plugin-text-paginator"

clean:
		rm -Rf ./dist ${GITHUB_REPO}-*.tgz

dist: clean
		npm run build

release: dist
		./release.sh ${GITHUB_REPO} ${RELEASE_VERSION} ${GITHUB_API_TOKEN}
