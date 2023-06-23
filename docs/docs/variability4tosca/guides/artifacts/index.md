# Artifacts

In the following, we provide a detailed step-by-step tutorial to deploy the enterprise variant of the shopping application to showcase conditional deployment artifacts and configurations.

!!! Warning "TODO"
    - discuss each variant
    - figures for each variant

## Requirements

You to fulfill the following requirements to follow this walkthrough.

- Access to a GCP project
- A machine having Ubuntu22.04 LTS installed
- Git installed on your machine
- Python3 installed on your machine
- [Unfurl](https://github.com/onecommons/unfurl){target=_blank} installed on your machine
- Terraform installed on your machine
- Terraform is already authenticated

## Preparation

First, install OpenTOSCA Vintner.
For more information see [Installation](../../../installation.md){target=_blank}.

```shell linenums="1"
curl -fsSL https://vintner.opentosca.org/install.sh | sudo bash -
vintner setup init
```

Next, we configure Unfurl as the orchestrator that should be used for the deployment.
For more information see [Orchestrators](../../../orchestrators.md){target=_blank}.

```shell linenums="1"
vintner orchestrators init unfurl
vintner orchestrators enable --orchestrator unfurl
```

## Import the Template

!!! Warning "TODO"
    - figures for vst

First, we clone the repository.
--8<-- "clone.md"

Then, we import the template and create an instance.
Note, creating an instance does not deploy the application but sets everything up for doing so.

```shell linenums="1"
# Add variable service template
vintner templates import --template artifacts --path examples/unfurl-artifacts

# Add instance
vintner instances create --instance artifacts --template artifacts
```

We can optionally inspect the variable service template.
This template contains all possible elements having conditions assigned.

```shell linenums="1"
# (optional) Inspect variable service template
vintner templates inspect --template artifacts
```

## Resolve Variability

We intend to deploy the enterprise variant of the application.
Therefore, we need to resolve the variability by providing respective variability inputs.

```shell linenums="1"
# Resolve variability
vintner instances resolve --instance artifacts --inputs examples/unfurl-artifacts/tests/enterprise/inputs.yaml
```

You can optionally inspect the generated service template.
This template contains only the nodes required for the enterprise variant.

```shell linenums="1"
# (optional) Inspect service template
vintner instances inspect --instance artifacts
```


## Deployment

Finally, we can deploy the application.
Therefore, we need to provide deployment inputs.
An example for the deployment inputs is given in [`examples/unfurl-artifacts/inputs.example.yaml`]({{ get_repo_url('examples/unfurl-artifacts/inputs.example.yaml') }}){target=_blank}.
The deployment will take some minutes.

```shell linenums="1"
# Deploy instance
vintner instances deploy --instance artifacts --inputs ${INPUTS_PATH}
```

## Undeployment

Afterward, you can undeploy the application.

```shell linenums="1"
# Undeploy instance
vintner instances undeploy --instance artifacts
```

You can also optionally remove the instance or cleanup your filesystem.
Note, cleaning up the filesystem removes any vintner data including, e.g., all imported templates and created instances.

```shell linenums="1"
# (optional) Delete instance
vintner instances delete --instance artifacts

# (optional) Cleanup 
vintner setup clean
```

