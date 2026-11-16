# folder on drafts.fidoalliance.org
MODULE_PATH=cmra

# spec set name, used in the name of the output archive: fido-<SPECSET_NAME>-v<version>-<status>-<date>
SPECSET_NAME=cmra

# naming options for release
RELEASE_DATE=$(shell date +%Y%m%d)
RELEASE_VERSION=1.0
RELEASE_STATUS=wd

# other options
GENERATE_PDF=yes
PUBLISH_PAGES=no

include resources/build/release.mk
include resources/build/deploy.mk