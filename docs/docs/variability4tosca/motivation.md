# Motivation

In the following, we provide a detailed step-by-step tutorial to deploy the development variant of the motivating scenario.
The motivating scenario is a simple composite application that consists a web component and database.
This application can be deployed in different variants.
During development the application should be deployed on a single virtual machine whereas during production an elastic deployment is required and, therefore, the application is deployed on GCP.

<figure markdown>
  ![Motivating Scenario](../assets/images/variability4tosca/motivation/motivation.png){width="700"}
  <figcaption>Figure 1: Motivating Scenario</figcaption>
</figure>

## Requirements

You to fulfill the following requirements to follow this walkthrough.

- Access to an OpenStack instance
- A machine having Ubuntu22.04 LTS installed
- Git installed on your machine
- Python3 installed on your machine
- [xOpera](https://github.com/xlab-si/xopera-opera){target=_blank} installed on your machine
- [Ansible Galaxy Collection `openstack.cloud`](https://galaxy.ansible.com/openstack/cloud){target=_blank} installed on your machine

## Preparation

First, install OpenTOSCA Vintner.
For more information see [Installation](../installation.md){target=_blank}.

```shell linenums="1"
curl -fsSL https://vintner.opentosca.org/install.sh | sudo bash -
vintner setup init
```

We currently support xOpera and Unfurl.
Since both can only be installed on Linux, we implemented a WSL integration for both.
In our case, we run on a Linux machine and use xOpera.
For more information see [Orchestrators](../orchestrators.md){target=_blank}.

```shell linenums="1"
vintner orchestrators init xopera
vintner orchestrators enable --orchestrator xopera
```

## Import

<figure markdown>
  ![Motivating Scenario](../assets/images/variability4tosca/motivation/vst.png){width="700"}
  <figcaption>Figure 2: Variable Service Template</figcaption>
</figure>

First, we clone the repository.
--8<-- "clone.md"

Then, we import the template and create an instance.
Note, creating an instance does not deploy the application but sets everything up for doing so.

```shell linenums="1"
# Add variable service template
vintner templates import --template motivation --path opentosca-vintner/examples/motivation

# Add instance
vintner instances create --instance motivation --template motivation
```

We can optionally inspect the variable service template.
This template contains all possible elements having conditions assigned.
For example, the virtual machine hosted on OpenStack has a condition assigned that checks if the development variant has been chosen.

```shell linenums="1"
# (optional) Inspect variable service template
vintner templates inspect --template motivation
```


## Resolve Variability

We intend to deploy the development variant of the application.
Therefore, we need to resolve the variability by providing respective variability inputs.
In our case, we can use an already predefined variability preset.

```shell linenums="1"
# Resolve variability
vintner instances resolve --instance motivation --presets dev
```

You can optionally inspect the generated service template. 
This template contains only the nodes required for the development variant.

```shell linenums="1"
# (optional) Inspect service template
vintner instances inspect --instance motivation
```


## Deployment

Finally, we can deploy the application.
Therefore, we need to provide deployment inputs which contain, e.g., credentials for accessing OpenStack.
An example for the deployment inputs is given in [`examples/xopera-motivation/inputs.example.yaml`]({{ get_repo_url('examples/xopera-motivation/inputs.example.yaml') }}){target=_blank}.
The deployment will take some minutes.

```shell linenums="1"
# Deploy instance
# See examples/xopera-motivation/inputs.example.yaml as reference
vintner instances deploy --instance motivation --inputs ${INPUTS_PATH}
```

## Undeployment

Afterward, you can undeploy the application.

```shell linenums="1"
# Undeploy instance
vintner instances undeploy --instance motivation
```

You can also optionally remove the instance and cleanup your filesystem (this will also removes other instances from the filesystem).

```shell linenums="1"
# (optional) Delete instance
vintner instances delete --instance motivation

# (optional) Cleanup 
vintner setup clean
```
