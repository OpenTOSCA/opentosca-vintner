---
tags:
- Contributing
---

# Release

This document contains information about releases.

## Build

To locally build the project, run the following command.
This will transpile Javascript inside the `/build` directory.
During the build, the string `__VERSION__` inside a Javascript file is replace with the current commit hash.
The current version can be checked using `vintner --version`.

```shell linenums="1"
yarn build
```

## Package

{{ linux_only_notice() }}

To locally package the project, run the following command.
This will package the previously transpiled Javascript using [`pkg`](https://github.com/vercel/pkg){target=_blank} and
generate binaries inside the `/dist` directory.

```shell linenums="1"
yarn package
```

The issue considering the failed bytecode generation of MiniSat is known and can be ignored in our case.

## GitHub

On pushes to the `main` branch, the `release` workflow is triggered.
This workflow runs several tests, builds and packages the project and creates a new [GitHub release](https://github.com/OpenTOSCA/opentosca-vintner/releases/tag/latest){target=_blank}.
Thereby, an existing GitHub release and `latest` tag is deleted.
There is only one release at total.

However, there is also the `build` workflow. 
This workflow basically has the same steps as the `release` workflow but does create his own GitHub release and does not deploy the docs.

## Night

The `night` workflow is scheduled for every tuesday at 420.
This workflow ensures that the latest release is correctly signed and can be executed.

## NPM

There is also a npm package [`opentosca-vintner`](https://www.npmjs.com/package/opentosca-vintner){target=_blank}.
New versions are published manually.
To publish a new version, first update the version number in `package.json` and then run

````shell linenums="1"
yarn release:npm
````

## Docker

There are also Docker containers: [https://github.com/OpenTOSCA/opentosca-vintner/pkgs/container/opentosca-vintner](https://github.com/OpenTOSCA/opentosca-vintner/pkgs/container/opentosca-vintner){target=_blank}.
They are automatically build and pushed during the Release workflow.


## Zenodo

There is also a Zenodo record with a unique DOI for OpenTOSCA Vintner: [https://doi.org/10.5281/zenodo.10155277](https://doi.org/10.5281/zenodo.10155277){target=_blank}.
To publish a new version, run the Zenodo workflow on GitHub.
This workflow will create a draft of a new version based on the latest GitHub release.
The version must be manually published on Zenodo.
