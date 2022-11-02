# Package Manager

{{ experimental_notice() }}

!!! Error "TODO"
    check, list, install, add, upgrade, remove, purge, clean

With this package manager dependencies can be installed.

## Dependency File

The `dependencies` file contains dependencies in the following format:

```text linenums="1"
[name] [repository] [checkout: commit | branch | tag = main]
org.alien4cloud.agentpuppet https://github.com/alien4cloud/csar-public-library 3.0.x
```

## Install

Installs all dependencies listed in the `dependencies` file:

```shell linenums="1"
vintner packages install
```

The repositories will be downloaded in `${OS_TMP}/lib/${DEPENDENCY_NAME}`.
Then the specified directory is synced to `${PROJECT_ROOT}lib/${DEPENDENCY_NAME}`.
Already installed dependencies will be updated instead.

## Purge

Delete all dependencies that are not listed in the `dependencies` file.

```shell linenums="1"
vintner packages purge
```

## Check

Verify the syntax of the `dependencies` file

```shell linenums="1"
vintner packages check
```

## Authenticate at Git Provider

A correctly configured authentication for Git is assumed at this point and is not part of this component.

## Import Dependency inside Service Template

```yaml linenums="1"
imports:
- lib/org.alien4cloud.agentpuppet@3.0.x
```