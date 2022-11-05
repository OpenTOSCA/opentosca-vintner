# Package Manager

{{ experimental_notice() }}

!!! Error "TODO"
    validate, list, install, add, upgrade, remove, purge, clean

With this package manager dependencies can be installed.
Git is required to be installed on the system.

## Dependency File

The `dependencies.yaml` file contains dependencies in the following format:

```text linenums="1"
# <name>@<checkout>: <repo>
org.alien4cloud.agentpuppet@3.0.x: https://github.com/alien4cloud/csar-public-library
```

## Install

!!! Info
    It is recommended to add `lib` to your `.gitignore`.


Installs all dependencies listed in the `dependencies.yaml` file in a `lib` directory.
Already installed dependencies using a branch as checkout will be upgraded instead.

```shell linenums="1"
vintner packages install
```


## Upgrade 

!!! Info
    Only branches can be updated.


## Clean

Delete all dependencies that are not listed in the `dependencies.yaml` file.

```shell linenums="1"
vintner packages clean
```

## Validate

Verify the syntax of the `dependencies.yaml` file

```shell linenums="1"
vintner packages validate
```

## Authenticate at Git Provider

A correctly configured authentication for Git is assumed at this point and is not part of this component.

## Import Dependency inside Service Template

```yaml linenums="1"
imports:
- lib/org.alien4cloud.agentpuppet@3.0.x/types.yaml
```


## Notes

### Cloning Repositories

Requirements

- simple
- cache
- version: branches, tag, commits
- optimize time
- optimize space
- updatable branches

Single Clone Directory

- clone repository
- checkout version of each dependency

Multiple Clone Directories

- clone repository for each dependency
- checkout version

Git Worktrees

- clone repository
- checkout version of each dependency as worktree
