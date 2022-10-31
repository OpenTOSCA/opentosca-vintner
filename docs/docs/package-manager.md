With this package manager dependencies can be installed from git repositories.

!!! Info
    A correctly configured authentication for Git is assumed at this point and is not part of this component.

## Dependency File
All packages to be installed must be listed in the `dependencies` file in the following format:
```linenums="1"
dir repo checkout
org.alien4cloud.agentpuppet https://github.com/alien4cloud/csar-public-library 3.0.x
... https://... ...
```

## Install
Installs all packages listed in the `dependencies` file:

```linenums="1"
yarn package:install
```
The repositories will be downloaded in `tmp/lib/name-of-dependency`.
Then the specified directory is synced to `lib/name-of-dependency`.

Already installed dependencies will be updated instead.

## Purge
Delete all dependencies that are not listed in the `dependencies` file.
```linenums="1"
yarn package:purge
```

## Check
Verify the syntax of the `dependencies` file
```linenums="1"
yarn package:check
```