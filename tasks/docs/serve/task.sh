MKDOCS_IS_DEV=true
export MKDOCS_IS_DEV

MKDOCS_REVISION_ENABLED=false
export MKDOCS_REVISION_ENABLED

# Serve mkdocs (hot-reload)
bash docs/mkdocs serve --watch-theme
