---
title: Environment
---

# Working Environment

We use the following working environment during development. 

## Node.js

We are using [Node.js](https://nodejs.org){target=_blank} version `16.14.0`.
To install node, use [nvm](https://github.com/nvm-sh/nvm){target=_blank} or [nvm-windows](https://github.com/coreybutler/nvm-windows){target=_blank}.

```shell linenums="1"
nvm install v16.14.0
nvm use 16.14.0
```

## Repository

The repository is a monorepo consisting of the CLI, server, docs and tests using the following commands.
We are using  [Yarn 1 (Classic)](https://classic.yarnpkg.com/lang/en/){target=_blank}.

```shell linenums="1"
git clone https://github.com/opentosca/opentosca-vintner.git
cd opentosca-vintner
git lfs install
git lfs pull
yarn --frozen-lockfile
```

## Large Files

Larges files, such as binaries or archives used in examples, are added using [git lfs](https://git-lfs.com){target=_blank}.
This includes the following file extensions `.bin`, `.gz`, `.tar`, `.zip`, `.xz`, and `.jar`.


## JetBrains

!!! Warning
    WebStorm Version 2022.3.3 seems to have problems with breakpoints when `src/resolver/graph.ts` is involved.
    However, WebStorm Version 2022.3.2 works fine.

We recommend to use [IntelliJ IDEA](https://www.jetbrains.com/idea){target=_blank}
or [WebStorm](https://www.jetbrains.com/webstorm){target=_blank} installed
using [JetBrains Toolbox](https://www.jetbrains.com/toolbox-app){target=_blank}.
Both are [for free](https://www.jetbrains.com/community/education/#students){target=_blank} for students.
Open the Project Settings using `Ctrl + Alt + S` to configure ESLint and Prettier.

ESLint should be configured as given in the figure below with the following pattern.

```text linenums="1"
{**/*,*}.{ts}
```

<figure markdown>
  ![IntelliJ ESLint Settings](intellij-eslint.png){class=figure}
  <figcaption>Figure 1: IntelliJ ESLint Settings</figcaption>
</figure>

Prettier should be configured as given in the figure below with the following pattern.

```text linenums="1"
{**/*,*}.{ts,json,yaml,yml}
```

<figure markdown>
  ![IntelliJ Prettier Settings](intellij-prettier.png){class=figure}
  <figcaption>Figure 2: IntelliJ Prettier Settings</figcaption>
</figure>