BIKESHED_FILES+=cmra.bs
CP_FILES=$(wildcard img/*.png)

release: bikeshed-files copy-files

include resources/bikeshed/build.mk
include resources/build/copy.mk
include resources/build/references.mk
