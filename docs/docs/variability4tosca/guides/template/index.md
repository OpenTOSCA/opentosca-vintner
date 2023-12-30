---
tags:
- Variability4TOSCA
- Guide
- Publication
- <%= data.CONFERENCE_NAME %> <%= data.CONFERENCE_YEAR %>
- <%= data.ORCHESTRATOR %>
---


# <%= data.TITLE %>

<div class="video-wrap">
  <div class="video-container">
    <iframe src="<%= data.YOUTUBE %>" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
 </div>
</div>

This document holds a detailed step-by-step guide to deploy the <%= data.VARIANT %> deployment variant of a <%= data.APPLICATION %> application to showcase <%= data.SHOWCASE %>.
The application can be deployed in the following deployment variants, as given in Figure 1.

- <%= data.VARIANT_A %>
- <%= data.VARIANT_B %>
- <%= data.VARIANT_C %>

<figure markdown>
  ![Variants](variants.png){width="700"}
  <figcaption>Figure 1: The different deployment variants.</figcaption>
</figure>

## Requirements

We need to fulfill the following requirements to follow this step-by-step guide.

- <%= data.REQUIREMENT_A %>
- <%= data.REQUIREMENT_B %>
- <%= data.REQUIREMENT_C %>

## Preparation

First, install OpenTOSCA Vintner.
For more information see [Installation](../../../installation.md){target=_blank}.

--8<-- "install.md"

Next, we configure <%= data.ORCHESTRATOR %> as the orchestrator that should be used for the deployment.
For more information see [Orchestrators](../../../orchestrators.md){target=_blank}.

```shell linenums="1"
vintner orchestrators init <%= data.ORCHESTRATOR %>
vintner orchestrators enable --orchestrator <%= data.ORCHESTRATOR %>
```

## Import the Template

<figure markdown>
  ![Variability4TOSCA template](variable-service-template.png){width="700"}
  <figcaption>Figure 2: The Variability4TOSCA template.</figcaption>
</figure>

First, we clone the repository.
--8<-- "clone.md"

Next, we import the Variability4TOSCA template.

```shell linenums="1"
vintner templates import --template <%= data.TEMPLATE_NAME %> --path examples/<%= data.EXAMPLE_DIR %>
```

Next, we initialize an application instance.

```shell linenums="1"
vintner instances init --instance <%= data.INSTANCE_NAME %> --template <%= data.TEMPLATE_NAME %>
```

We can optionally inspect the Variability4TOSCA template.
This template contains all possible elements having conditions assigned.
<%= data.VARIABLE_TEMPLATE_DESCRIPTION %>
An overview is given in Figure 2.

```shell linenums="1"
vintner templates inspect --template <%= INSTANCE_NAME %>
```

## Resolve Variability

<figure markdown>
  ![Variant](variant.png){width="300"}
  <figcaption>Figure 3: The deployment variant.</figcaption>
</figure>

We intend to deploy the <%= data.VARIANT %> deployment variant.
We specify this when resolving variability.

```shell linenums="1"
vintner instances resolve --instance <%= data.INSTANCE_NAME %> --presets <%= data.PRESET %>
```

We can optionally inspect the generated TOSCA-compliant template.
<%= data.TOSCA_TEMPLATE_DESCRIPTION %>
An overview is given in Figure 3.

```shell linenums="1"
vintner instances inspect --instance <%= data.INSTANCE_NAME %>
```

## Deploy the Application

Finally, we deploy the application.
Therefore, we need to provide deployment inputs, e.g., <%= data.DEPLOYMENT_INPUTS_DESCRIPTION %>.
Possible deployment inputs are specified in `topology_template.inputs` of the TOSCA-compliant template.
The deployment will take around <%= data.DEPLOYMENT_TIME %> minutes.

```shell linenums="1"
vintner instances deploy --instance <%= data.INSTANCE_NAME %> --inputs ${INPUTS_PATH}
```

## Undeploy the Application

Afterward, we undeploy the application.

```shell linenums="1"
vintner instances undeploy --instance <%= data.INSTANCE_NAME %>
```

Optionally, we can remove the instance and cleanup the filesystem.
Cleaning up the filesystem removes any data including, e.g., all imported templates and created instances.

```shell linenums="1"
vintner instances delete --instance pruning
vintner setup clean --force
```

## Complexity Analysis

The templates for our complexity analysis can be found {{ repo_link('<%= data.ANALYSIS_PATH %>', 'here') }}.

## Logs

This deployment is also executed in our integration pipeline which is executed once a week.
The logs of the corresponding GitHub action job run can be accessed [here](https://github.com/OpenTOSCA/opentosca-vintner/actions/workflows/night.yaml){target=_blank}.
Relevant steps start with "<%= data.LOGS_PREFIX %>".
Note, a GitHub account is required to access these logs.
The raw logs of a recorded job are [available](./logs.txt){target=_blank} without requiring an GitHub account.

## Zenodo

The assets of this guide can be also found on [Zenodo](<%= data.ZENODO %>){target=_blank}.

## Publication

This guide is part of our [paper](../../../publications.md#<%= data.PUBLICATION %>){target=_blank} accepted at the <%= data.CONFERENCE_NAME %> <%= data.CONFERENCE_YEAR %>.
Also check our other [publications](../../../publications.md){target=_blank}.
