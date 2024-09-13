---
tags:
- Contributing
---

# Development

This document holds instructions on developing Vintner.

## GitHub Flow

Our branching workflow follows [GitHub Flow](https://docs.github.com/de/get-started/quickstart/github-flow){target=_blank}.

## Branch Naming Convention

Branches should be names as follows.

- `feature-short-title` for features.
- `fix-short-title` for bug fixes.
- `refactor-short-title` for refactoring.
- `chore-short-title` for chores.
- `docs-short-title` for documentations.
- `project-short-title` for project, such as thesis, EnPro, StuPro ...

## Squash and Merge

Squash your commits into a single commit with a short but meaningful message.
The commit message should have a link to the merge request.
The branch is automatically deleted once merged.

## Tags 

A tag must be created for each publication, thesis, etc.
For example, the following commands create and push the tag for the publication "Modeling Different Deployment Variants of a Composite Application in a Single Declarative Deployment Model" published by Stötzner et al. in 2022.

```shell linenums="1"
git tag -s publication-stoetzner-2022-vdmm -m "Modeling Different Deployment Variants of a Composite Application in a Single Declarative Deployment Model"
git push origin publication-stoetzner-2022-vdmm
```


## Command Line Interface

!!! Info
    `./task cli` uses `src/cli/index.ts` while `./task vintner` uses `build/cli/index.js`.
    Therefore, run `./task cli` to execute the current code without building it first.

We use [commander.js](https://github.com/tj/commander.js){target=_blank} to implement the CLI.
The entry point is `src/cli/index.ts`.
Execute a CLI command during development as follows.

```shell linenums="1"
./task cli -- [command] [options]
```

## Server

We use [express](https://github.com/expressjs/express){target=_blank} to implement the server.
The entry point is `src/server/index.ts`.
Run a development server on [http://localhost:3000](http://localhost:3000){target=_blank} with live-reload as follows.

```shell linenums="1"
./task server:serve
```

## Tests

We use [mocha](https://mochajs.org){target=_blank}, [chai](https://www.chaijs.com){target=_blank}, and [nyc](https://istanbul.js.org){target=_blank} for testing.
Respective tests are inside the `tests` directory.
Run the tests as follows.

```shell linenums="1"
./task test
```

On pushes to the `main` branch or on pull requests, the `tests` workflow is triggered. 
This workflow runs the tests.

## Lint

We use [ESLint](https://eslint.org){target=_blank} for code linting.
Lint typescript as follows.

```shell linenums="1"
./task lint:check
```

Fix lint problems as follows.

```shell linenums="1"
./task lint:fix
```

## Code Style

We use [Prettier](https://prettier.io){target=_blank} for code formatting.
Check the code style as follows.

```shell linenums="1"
./task style:check
```

Fix code style problems as follows.

```shell linenums="1"
./task style:fix
```

## Benchmark

Run the following command, to run to benchmark the variability resolving.

```shell linenums="1"
./task benchmark
```

## Dependencies

We use [license-checker](https://github.com/davglass/license-checker){target=_blank} to handle licenses of (transitive) dependencies.
Check that (transitive) dependencies are licensed as expected as follows.
This check is also executed inside workflows.

```shell linenums="1"
./task licenses:check
```

## Patch Packages 

We use [`patch-package`](https://github.com/ds300/patch-package){target=_blank} to fix dependencies.
For example, adding `logic-solver.d.ts` to [`logic-solver`](https://github.com/meteor/logic-solver){target=_blank}.
Therefore, proceed as follows.

First, make changes to the package inside `node_modules`. 
Then, create the patch.

```shell linenums="1"
yarn patch-package --exclude 'nothing' ${package-name}
```

## Night

The Night workflow is scheduled for every tuesday at 420.
This workflow ensures that the latest release is correctly signed and can be executed.
Moreover, integration tests are executed, which use xOpera, Unfurl, and GCP.
