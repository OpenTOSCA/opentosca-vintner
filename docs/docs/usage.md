---
tags:
- Vintner
---

# Usage

This document holds instructions on using Vintner.

## CLI

To ensure that Vintner can be executed, run the following command.

```shell linenums="1"
vintner --version
```

From there on, use the help command.
See [Interface](./interface.md){target=_blank} for a complete interface specification.

```shell linenums="1"
vintner --help
```

## Server

To start the server, run the following command.
See [Interface](./interface.md){target=_blank} for a complete interface specification.

```shell linenums="1"
vintner server start
```

## Configuration

The following environment variables can be used for configuration.

| Environment Variable       | Default            | Description                               |
|----------------------------|--------------------|-------------------------------------------|
| OPENTOSCA_VINTNER_HOME_DIR | ${HOME_DIR}/.opentosca_vintner | Configures the home directory of Vintner. |
