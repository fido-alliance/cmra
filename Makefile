# folder on drafts.fidoalliance.org
MODULE_PATH=cmra

# git options for release
RELEASE_SPEC=cmra
RELEASE_REPO_BRANCH=main
RELEASE_RESOURCES_BRANCH=main

# naming options for release
RELEASE_DATE=$(shell date +%Y%m%d)
RELEASE_VERSION=1.0
RELEASE_STATUS=wd
OFFICIAL_RELEASE=false

include resources/build/release.mk
include resources/build/deploy.mk
