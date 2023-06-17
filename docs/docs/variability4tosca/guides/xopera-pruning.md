# Pruning Application

In the following, we provide a detailed step-by-step tutorial to deploy the cloud variant of the pruning application to showcase default conditions and pruning of elements.

!!! Warning "TODO"
    - discuss each variant
    - figures for each variant

## Environment

We expect that the [xOpera CLI](https://github.com/xlab-si/xopera-opera){target=_blank} is installed on a Linux machine ant that access to an [OpenStack](https://www.openstack.org/){target=_blank} instance is available.

## Preparation

First, install OpenTOSCA Vintner.
For more information see [Installation](../../installation.md){target=_blank}.

```shell linenums="1"
curl -fsSL https://vintner.opentosca.org/install.sh | sudo bash -
vintner setup init
```

## Orchestrator

We currently support xOpera and Unfurl.
Since both can only be installed on Linux, we implemented a WSL integration for both.
In our case, we run on a Linux machine and use xOpera.
For more information see [Orchestrators](../../orchestrators.md){target=_blank}.

```shell linenums="1"
vintner orchestrators init xopera
vintner orchestrators enable --orchestrator xopera
```

## Deployment

Deploy the cloud variant of the pruning application.
Therefore, import the template, create an instance, resolve the variability and finally deploy the application.
An example for the deployment inputs is given in [`examples/xopera-pruning/inputs.example.yaml`]({{ get_repo_url('examples/xopera-pruning/inputs.example.yaml') }}){target=_blank}.

```shell linenums="1"
# Add variable service template
vintner templates import --template pruning --path examples/xopera-pruning

# Add instance
vintner instances create --instance pruning --template pruning

# Resolve variability
vintner instances resolve --instance pruning --presets cloud

# (optional) Inspect service template
vintner instances inspect --instance pruning

# Deploy instance
# See examples/xopera-pruning/variability-inputs.example.yaml as reference
vintner instances deploy --instance pruning --inputs ${INPUTS_PATH}
```

## Undeployment

Cleanup the deployment.
Therefore, undeploy the instance and cleanup the filesystem.

```shell linenums="1"
# Undeploy instance
vintner instances undeploy --instance pruning

# Cleanup
vintner setup clean
```
