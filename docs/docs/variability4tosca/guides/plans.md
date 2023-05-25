# Shopping Applications

In the following, we provide a detailed step-by-step tutorial to deploy the community variant of the shopping application to showcase conditional artifacts and configurations.

!!! Warning "TODO"
    - discuss each variant
    - figures for each variant
    - correct example inputs and naming etc

## Environment

We expect the following environment: 

- Ubuntu22.04
- [xOpera CLI](https://github.com/xlab-si/xopera-opera){target=_blank}
- [Google Cloud CLI](https://cloud.google.com/sdk/gcloud){target=_blank}
- Service account for an GCP project
- There must be already an app engine service called "default"

## Preparation

First, install OpenTOSCA Vintner.
For more information see [Installation](../installation.md){target=_blank}.

```shell linenums="1"
curl -fsSL https://vintner.opentosca.org/install.sh | sudo bash -
vintner setup init
```

## Orchestrator

We currently support xOpera and Unfurl.
Since both can only be installed on Linux, we implemented a WSL integration for both.
In our case, we run on a Linux machine and use xOpera.
For more information see [Orchestrators](../orchestrators.md){target=_blank}.

```shell linenums="1"
vintner orchestrators init xopera
vintner orchestrators enable --orchestrator xopera
```

## Deployment

Deploy the cloud variant of the application.
Therefore, import the template, create an instance, resolve the variability and finally deploy the application.
An example for the deployment inputs is given in [`examples/xopera-plans/inputs.example.yaml`]({{ get_repo_url('examples/xopera-plans/inputs.example.yaml') }}){target=_blank}.

```shell linenums="1"
# Add variable service template
vintner templates import --template plans --path examples/xopera-plans

# Add instance
vintner instances create --instance plans --template plans

# Resolve variability
vintner instances resolve --instance plans --presets cloud

# (optional) Inspect service template
vintner instances inspect --instance plans

# Deploy instance
# See examples/xopera-plans/variability-inputs.example.yaml as reference
vintner instances deploy --instance plans --inputs ${INPUTS_PATH}
```

## Undeployment

Cleanup the deployment.
Therefore, undeploy the instance and cleanup the filesystem.

```shell linenums="1"
# Undeploy instance
vintner instances undeploy --instance plans

# Cleanup
vintner setup clean
```
