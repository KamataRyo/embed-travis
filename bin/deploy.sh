#!/usr/bin/env bash

# this file run on CI tool and make release.
# Released product hosted on Github and WordPress SVN directory

set -e

if ! [[ "$WP_VERSION"         == "$WP_VERSION_TO_DEPLOY" && \
	    "$TRAVIS_PHP_VERSION" == "$PHP_VERSION_TO_DEPLOY" && \
	    "$WP_MULTISITE"       == "$WP_MULTISITE_TO_DEPLOY" ]]; then
	echo "Not deploying from this matrix";
	exit
elif [[ "false" != "$TRAVIS_PULL_REQUEST" ]]; then
	echo "Not deploying pull requests."
	exit
elif ! [[ "master" == "$TRAVIS_BRANCH" ]]; then
	echo "Not on the 'master' branch."
	if [[ "" == "$TRAVIS_TAG" ]]; then
		echo "Not tagged."
		exit
	else
		echo "tagged."
	fi
fi

COMMIT_MESSAGE=$(git log --format=%B -n 1 "$TRAVIS_COMMIT")

rm -rf .git
cat .svnignore > .gitignore

git init
git config user.name "kamataryo"
git config user.email "kamataryo@travis-ci.org"
git add .
git commit --quiet -m "Deploy from travis." -m "Original commit is $TRAVIS_COMMIT."

if [[ "master" == "$TRAVIS_BRANCH" ]]; then
	echo "enforcing pushing to 'latest'.."
	git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:latest > /dev/null 2>&1
	echo "deployed on 'latest' branch, which is tested on PHP=$TRAVIS_PHP_VERSION & WP=$WP_VERSION"
fi

if ! [[  "" == "$TRAVIS_TAG" ]]; then
	echo "Deleting remote not compiled tag '$TRAVIS_TAG'.."
	git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" ":$TRAVIS_TAG" > /dev/null 2>&1
	echo "Making new tag with compiled files..."
	git tag "$TRAVIS_TAG" -m "$COMMIT_MESSAGE" -m "Original commit is $TRAVIS_COMMIT."
	echo "Pushing new tag '$TRAVIS_TAG'..."
	git push --force --quiet --tag "https://${GH_TOKEN}@${GH_REF}" > /dev/null 2>&1
	echo "deployed as '$TRAVIS_TAG', tested on PHP=$TRAVIS_PHP_VERSION & WP=$WP_VERSION"
fi

exit 0
