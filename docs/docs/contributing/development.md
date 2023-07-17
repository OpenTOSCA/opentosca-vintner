# Development

Contributions are very much welcome.
But please follow the following guidelines and our [Code of Conduct](code-of-conduct.md){target=_blank}.

## GitHub Flow

Our branching workflow follows [GitHub Flow](https://docs.github.com/de/get-started/quickstart/github-flow){target=_blank}.

## Branch Naming Convention

Branches should be names as follows

- `fix-short-title` for bug fixes
- `docs-short-title` for documentations
- `feature-short-title` for features
- `refactor-short-title` for refactoring
- `imrpove-short-title` for improvements
- `project-short-title` for thesis, EnPro, StuPro ...

## Squash and Merge

Please squash your commits into a single commit with a short but meaningful message and delete the branch afterwards.
The commit message should not have a link to the merge request.

## Signed Commits

Commits are required to be signed.
Therefore, you need to register a signing key.
For more information see

- [Generating a new GPG key](https://docs.github.com/en/authentication/managing-commit-signature-verification/generating-a-new-gpg-key){target=_blank}
- [Adding a GPG key to your GitHub account](https://docs.github.com/en/authentication/managing-commit-signature-verification/adding-a-gpg-key-to-your-github-account){target=_blank}
- [Telling Git About Your Signing Key](https://docs.github.com/en/authentication/managing-commit-signature-verification/telling-git-about-your-signing-key){target=_blank}
- [Signing Commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits){target=_blank}

You can enable auto-signing for a specific repository with the following command

```shell linenums="1"
git config commit.gpgsign true
```

## Command Line Interface

!!! Info
    `yarn cli` uses `src/cli/index.ts` while `yarn vintner` uses `build/cli/index.js`.
    Therefore, run `yarn cli` to execute the current code without building it first.

The CLI is build using [commander.js](https://github.com/tj/commander.js){target=_blank}.
The entry point is `src/cli/index.ts`.
To execute a CLI command during development, run

```shell linenums="1"
yarn cli [command] [options]
```

## Server

The server is build using [express](https://github.com/expressjs/express){target=_blank}.
The entry point is `src/server/index.ts`.
To run a development server on [http://localhost:3000](http://localhost:3000){target=_blank} with live-reload, run

```shell linenums="1"
yarn server:serve
```

## Tests

We use [mocha](https://mochajs.org){target=_blank}, [chai](https://www.chaijs.com){target=_blank}, and [nyc](https://istanbul.js.org){target=_blank} for testing.
Respective tests are inside the `tests` directory.
To run the tests, use

```shell linenums="1"
yarn test
```

To run the tests inside docker, use

```shell linenums="1"
yarn test:docker
```

On pushes to the `main` branch these tests are executed.

## Lint

[ESLint](https://eslint.org){target=_blank} is used for linting.
To lint typescript, run the following command

```shell linenums="1"
yarn lint:check
```

To fix lint problems, run the following command

```shell linenums="1"
yarn lint:fix
```

## Code Style

[Prettier](https://prettier.io){target=_blank} is used to format code.
To check the code style, run the following command

```shell linenums="1"
yarn style:check
```

To fix code style problems, run the following command

```shell linenums="1"
yarn style:fix
```

## Benchmark

Run the following command, to run to benchmark the variability resolving.

```shell linenums="1"
yarn benchmark
```

## Licenses

[license-checker](https://github.com/davglass/license-checker){target=_blank} is used for handling licenses of (transitive) dependencies.
To check that (transitive) dependencies are licensed as expected, run the following command.
This check is also executed inside workflows.

```shell linenums="1"
yarn licenses:check
```


## Patch Packages 

We use [`patch-package`](https://github.com/ds300/patch-package){target=_blank} to fixing third party libraries.
For example, adding `logic-solver.d.ts` to [`logic-solver`](https://github.com/meteor/logic-solver){target=_blank}.
Therefore, make changes to the package inside `node_modules`, then run the following command.

```shell linenums="1"
yarn patch-package ${package-name}
```

If you need to patch the `package.json`, then append the option `--exclude 'nothing'` as stated in [#311](https://github.com/ds300/patch-package/issues/311){target=_blank}.

## Build

To locally build the project, run the following command.
This will transpile Javascript inside the `/build` directory.

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

## Release

On pushes to the `main` branch, the `release` workflow is triggered.
This workflow runs several tests, builds and packages the project and creates a new release.
Thereby, an existing release and `latest` tag is deleted.
There is only one release at total.
During the workflow the string `__VERSION__` inside a Javascript file is replace with the current commit hash.
The current version can be checked using `vintner --version`.

## Night

The `night` workflow is scheduled for every tuesday at 420.
This workflow ensures that the latest release is correctly signed and can be executed.