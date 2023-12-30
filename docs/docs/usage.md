---
tags:
- Vintner
---

# Usage

This document holds instructions on using Vintner.

## Use the CLI

First, we ensure that Vintner can be executed.

```shell linenums="1"
vintner --version
```

From there on use the help command.
See [Interface](./interface.md){target=_blank} for a complete interface specification.

```shell linenums="1"
vintner --help
```


## Enable an Orchestrator

Vintner requires an orchestrator for the deployment.
See [Orchestrators](./orchestrators.md){target=_blank} for a complete interface specification.

First, we initialize the config.

```shell linenums="1"
vintner orchestrators init ${ORCHESTRATOR_NAME}
```

Next, we enable the orchestrator. 

```shell linenums="1"
vintner orchestrators enable ${ORCHESTRATOR_NAME}
```

## Deploy an Application

First, we import the Variability4TOSCA template.

```shell linenums="1"
vintner templates import --template ${TEMPLATE_NAME} --path ${TEMPLATE_PATH}
```

Next, we initialize an application instance.

```shell linenums="1"
vintner instances init --instance ${INSTANCE_NAME} --template ${TEMPLATE_NAME}
```

Next, we specify variability inputs.

Next, we resolve the variability.

```shell linenums="1"
vintner instances resolve --instance ${INSTANCE_NAME} --inputs ${VARIABILITY_INPUTS}
```

Next, we specify deployment inputs. 

Next, we deploy the application. 

```shell linenums="1"
vintner instances deploy --instance ${INSTANCE_NAME} --inputs ${DEPLOYMENT_INPUTS_PATH}
```

## Undeploy an Application

Eventually, we undeploy the application.

```shell linenums="1"
vintner instances undeploy --instance ${INSTANCE_NAME}
```

## Configuration

The following environment variables can be used for configuration.

| Environment Variable       | Default            | Description                               |
|----------------------------|--------------------|-------------------------------------------|
| OPENTOSCA_VINTNER_HOME_DIR | ${HOME_DIR}/.opentosca_vintner | Configures the home directory of Vintner. |

## Start the Server

Vintner can be used as server.
To start the server, run the following command.

```shell linenums="1"
vintner server start
```