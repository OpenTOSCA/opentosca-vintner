# Motivation

In the following, we provide a detailed step-by-step tutorial to deploy the development variant of the motivating scenario.
The motivating scenario is a simple composite application that consists a web component and database.
This application can be deployed in different variants.
During development the application should be deployed on a single virtual machine whereas during production an elastic deployment is required and, therefore, the application is deployed on GCP.

<figure markdown>
  ![Motivating Scenario](../assets/images/motivation.png){width="700"}
  <figcaption>Figure 1: Motivating Scenario</figcaption>
</figure>

## Environment

We expect that the following is installed on a Linux machine.

- [xOpera CLI](https://github.com/xlab-si/xopera-opera){target=_blank}
- [Google Cloud CLI](https://cloud.google.com/sdk/gcloud){target=_blank}
- [Ansible Galaxy Collection `openstack.cloud`](https://galaxy.ansible.com/openstack/cloud){target=_blank}

## Preparation

First, install OpenTOSCA Vintner.
For more information see [Installation](../installation.md){target=_blank}.

```shell linenums="1"
wget -q https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-x64
mv vintner-linux-x64 /usr/bin/vintner
chmod +x /usr/bin/vintner
vintner setup init
```

## Orchestrator

We currently support xOpera and Unfurl.
Since both can only be installed on Linux, we implemented a WSL integration for both.
In our case, we run on a Linux machine and use xOpera.
For more information see [Orchestrators](../orchestrators.md){target=_blank}.

```shell linenums="1"
vintner orchestrators init opera
vintner orchestrators enable --orchestrator opera
```

## Deployment

Deploy the development variant of the motivating scenario.
Therefore, import the template, create an instance, resolve the variability and finally deploy the application.
An example for the deployment inputs is given in [`examples/opera-motivation/inputs.example.yaml`]({{ get_repo_url('examples/opera-motivation/inputs.example.yaml') }}){target=_blank}

```shell linenums="1"
# Add variable service template
vintner templates import --template motivation --path motivation

# Add instance
vintner instances create --instance motivation --template motivation

# Resolve variability
vintner instances resolve --instance motivation --preset dev

# (optional) Inspect service template
vintner instances inspect --instance motivation

# Deploy instance
# See examples/opera-motivation/inputs.example.yaml as reference
vintner instances deploy --instance motivation --inputs ${INPUTS_PATH}
```

## Undeployment

Cleanup the deployment.
Therefore, undeploy the instance and cleanup the filesystem.

```shell linenums="1"
# Undeploy instance
vintner instances undeploy --instance motivation

# Cleanup
vintner setup clean
```
