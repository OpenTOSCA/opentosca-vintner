---
tags:
- Variability4TOSCA
- Guide
- Publication
- Zenodo
- CLOSER 2024
- Unfurl
---

# Hosting-Aware Pruning

This document holds the step-by-step guide to deploy the on-premise deployment variant of a webshop application to showcase the hosting-aware pruning.
The webshop application can be deployed in the following deployment variants.

- on-premise/ local: Kubernetes on a single virtual machine on a local OpenStack (OS) instance
- cloud: Google Cloud Platform (GCP)


## Requirements

We need to fulfill the following requirements to follow this step-by-step guide.

- Linux machine, e.g., Ubuntu 22.04
- Access to an OpenStack instance


## Preparation

First, we install OpenTOSCA Vintner.
For more information see [Installation](../../../installation.md){target=_blank}.

--8<-- "install.md"

Next, we install Unfurl.

```shell linenums="1"
vintner install unfurl
```

Next, we configure Unfurl as the orchestrator that should be used for the deployment.

```shell linenums="1"
vintner orchestrators init unfurl
vintner orchestrators enable --orchestrator unfurl
```

Next, we attest that Vintner can use unfurl. 

```shell linenums="1"
vintner orchestrators attest --orchestrator unfurl
```


## Import the Template

<figure>
  <img src="variable-service-template.png" width="400"/>
  <figcaption>Figure 1: The Variability4TOSCA model.</figcaption>
</figure>

Next, we import the Variability4TOSCA template.

```shell linenums="1"
vintner templates import --template aware --path examples/unfurl-aware
```

Then, we initialize an application instance.

```shell linenums="1"
vintner instances init --instance aware --template aware
```

We can optionally inspect the Variability4TOSCA model.
This model contains all possible elements having conditions assigned.
However, due to the hosting-aware pruning, only a handful of condition must be modeled.
This is shown in Figure 1.

```shell linenums="1"
vintner templates inspect --template aware
```


## Resolve Variability

<figure>
  <img src="variant.png" width="650"/>
  <figcaption>Figure 2: The derived TOSCA model.</figcaption>
</figure>

We want to deploy the on-premise variant of the webshop application on Kubernetes using OpenStack.
We specify this when resolving variability as follows.

```shell linenums="1"
vintner instances resolve --instance aware --presets local
```

You can optionally inspect the generated TOSCA-compliant model.
This template contains only the elements required for the on-premise variant, e.g., Kubernetes.
This is shown in Figure 2.

```shell linenums="1"
vintner instances inspect --instance aware
```


## Deploy the Application

Finally, we can deploy the application.
Therefore, we need to provide deployment inputs, e.g., credentials to OpenStack.
These inputs are specified in `topology_template.inputs` of the TOSCA-compliant model.
The following inputs must be defined.

```yaml linenums="1"
os_compute_network: <OS_COMPUTE_NETWORK>
os_compute_key_name: <OS_COMPUTE_KEY_NAME>
os_compute_ssh_user: <OS_COMPUTE_SSH_USER>
os_compute_ssh_key_file: <OS_COMPUTE_SSH_KEY_FILE>
os_region_name: <OS_REGION_NAME>
os_auth_type: <OS_AUTH_TYPE>
os_auth_url: <OS_AUTH_URL>
os_identity_api_version: <OS_IDENTITY_API_VERSION>
os_interface: <OS_INTERFACE>
os_application_credential_id: <OS_APPLICATION_CREDENTIAL_ID>
os_application_credential_secret: <OS_APPLICATION_CREDENTIAL_SECRET>

# Also required. Just fill them with dummy values.
database_password: <DATABASE_PASSWORD>
gcp_region: <GCP_REGION>
gcp_service_account_file: <GCP_SERVICE_ACCOUNT_FILE>
gcp_project: <GCP_PROJECT>
gcp_auto_scaling: <GCP_AUTO_SCALING>
```

Next, we start the deployment. 
The deployment will take around 5-10 minutes.

```shell linenums="1"
vintner instances deploy --instance aware --inputs ${INPUTS_PATH}
```

Do not abort the deployment manually. 
Not even in case of errors.
Once the deployment command exits, the deployment can be retried as follows.

```shell linenums="1"
vintner instances continue --instance aware
```


## Test the Application 

Next, we can test that the application is correctly working. 
Therefore, find out the hostname of the provisioned virtual machine.

```shell linenums="1"
curl --fail-with-body http://${HOSTNAME_OF_VM}
```

If no hostname has been assigned, then use the IPv4 address.

```shell linenums="1"
curl --fail-with-body http://[${IPv4_ADDRESS_OF_VM}]
```

This should return the following.

```json linenums="1"
{
   "MESSAGE": "Successfully executed query",
   "QUERY": "SELECT 1 + 1;",
   "DB_DIALECT": "mysql",
   "DB_NAME": "shop",
   "DB_ADDRESS": "mysql",
   "DB_USERNAME": "root",
   "DB_PASSWORD": "5e88"
}
```

We can observe the following.

- according to `MESSAGE`, the query has been successful
- according to `DB_ADDRESS`, the MySQL instance running in Kubernetes has been used

Thus, we conclude that the application has been deployed as desired.


## Undeploy the Application

Afterward, we can undeploy the application.

```shell linenums="1"
vintner instances undeploy --instance aware
```

We can also optionally remove the instance or cleanup the filesystem.
Note, cleaning up the filesystem removes any vintner data including, e.g., all imported templates and created instances.

```shell linenums="1"
vintner instances delete --instance aware
vintner setup clean --force
```

## Logs

This deployment is also executed in our integration pipeline, which is executed once a week.
The logs of the corresponding GitHub action can be accessed [here](https://github.com/OpenTOSCA/opentosca-vintner/actions/workflows/night.yaml){target=_blank}.
Relevant jobs start with "Unfurl Aware".
Note, a GitHub account is required to access these logs.
The raw logs are [available](../../../assets/documents/night.zip){target=_blank} without requiring an GitHub account.

## Zenodo

The assets of this guide can be also found on [Zenodo](https://doi.org/10.5281/zenodo.10452506){target=_blank}.

## Publication

This guide is part of our [paper](../../../publications.md#hosting-aware-pruning-of-components-in-deployment-models){target=_blank} published at the CLOSER 2024.
Also check our other [publications](../../../publications.md){target=_blank}.
