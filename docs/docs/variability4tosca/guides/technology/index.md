---
title: Conditional Technologies
tags:
- Variability4TOSCA
- Guide
- Unfurl
---

# Conditional Deployment Technologies

This document holds the step-by-step guide to deploy the Kubernetes deployment variant of the [Online Boutique application](https://github.com/OpenTOSCA/opentosca-vintner-boutique-demo){target=_blank} to showcase the automated selection of deployment technologies.
The application can be deployed in the following deployment variants.

- static on a single virtual machine on a local OpenStack (OS) instance
- elastic on Google Cloud Platform (GCP)
- elastic on Kubernetes


## Requirements

We need to fulfill the following requirements to follow this step-by-step tutorial.

- Linux machine, e.g., Ubuntu 22.04
- Access to a Kubernetes cluster, e.g., [minikube](https://minikube.sigs.k8s.io){target=_blank}

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


## Enrich the Template

Next, we clone the repository. 

```shell linenums="1"
git clone https://github.com/OpenTOSCA/opentosca-vintner.git
cd opentosca-vintner
git lfs install
git lfs pull
```

Next, we make a copy of the Variability4TOSCA template.

```shell linenums="1"
cp -R examples/unfurl-technology---boutique---plus-maintenance-automated /tmp/boutique-model
```


Next, we enrich the Variability4TOSCA template.
This will automatically generate conditional deployment technology assignments.

```shell linenums="1"
vintner template enrich --template /tmp/boutique-model/variable-service-template.yaml --output /tmp/boutique-model/variable-service-template.yaml
```

## Resolve the Template

We want to deploy the Kubernetes variant with the all features enabled.
Therefore, we first create the following file.

```yaml linenums="1" title="/tmp/variability-inputs.yaml"
env: KUBERNETES
optional_payment_feature: true
premium_payment_feature: true
optional_analytical_feature: true
premium_analytical_feature: true
```

Next, we resolve the variability and generate a TOSCA model.
This will automatically select deployment technologies.

```shell linenums="1"
vintner template resolve --template /tmp/boutique-model/variable-service-template.yaml --output /tmp/boutique-model/variable-service-template.yaml --inputs /tmp/variability-inputs.yaml
```

Next, we generate the Deployment Technology-Specific Models.

```shell linenums="1"
vintner template implement --dir /tmp/boutique-model --orchestrator unfurl
```

## Import the Template

Next, we import the TOSCA template.

```shell linenums="1"
vintner templates import --template boutique-model --path /tmp/boutique-model
```

Then, we initialize an application instance.

```shell linenums="1"
vintner instances init --instance boutique-instance --template boutique-model
```

## Deploy the Application

Next, we need a Kubernetes cluster. 
We can start a development one locally using minikube. 

```shell linenums="1"
minikube start
```

Next, we provide deployment inputs, e.g., credentials to Kubernetes.
These inputs are specified in `topology_template.inputs` of the TOSCA-compliant model.
The following inputs must be defined.

```yaml linenums="1" title="/tmp/deployment-inputs.yaml"
database_password: YOUR_DB_PASSWORD
dbms_password: YOUR_DBMS_PASSWORD
k8s_host: YOUR_K8S_HOST
k8s_ca_cert_file: YOUR_K8S_CA_CERT_FILE
k8s_client_cert_file: YOUR_K8S_CLIENT_CERT_FILE
k8s_client_key_file: YOUR_K8S_CLIENT_KEY_FILE
```

In case of minikube, the following deployment inputs should be fitting.
Note, you need to resolve `$(minikube ip)` and `$HOME` first.

- `k8s_host`: `http://$(minikube ip):8443`
- `k8s_ca_cert_file`: `$HOME/.minikube/ca.crt`
- `k8s_client_cert_file`: `$HOME/.minikube/profiles/minikube/client.crt`
- `k8s_client_key_file`: `$HOME/.minikube/profiles/minikube/client.key`

Next, we start the deployment. 
The deployment will take around 1-2 minutes.

```shell linenums="1"
vintner instances deploy --instance boutique-instance --inputs /tmp/deployment-inputs.yaml
```

## Test the Application 

Next, we can test that the application is correctly working.
Therefore, find out the endpoint assigned by the ingress.
In case of minikube, this can be done as follows. 

```shell linenums="1"
ENDPOINT=$(minikube service frontend-external --url)
```

Next, we can start the load generator. 

```shell linenums="1"
docker run -it --rm -e FRONTEND_ADDR=${ENDPOINT} -e USERS=5 --network host ghcr.io/opentosca/opentosca-vintner-boutique-demo:loadgenerator-v10
```

We can observe the following.

```text linenums="1"
Type     Name                                                                          # reqs      # fails |    Avg     Min     Max    Med |   req/s  failures/s
--------|----------------------------------------------------------------------------|-------|-------------|-------|-------|-------|-------|--------|-----------
GET      /                                                                                  6     0(0.00%) |     55      48      76     52 |    0.00        0.00
GET      /cart                                                                              3     0(0.00%) |     23      17      30     24 |    0.10        0.00
POST     /cart                                                                              9     0(0.00%) |     21      13      37     20 |    0.30        0.00
POST     /cart/checkout                                                                     2     0(0.00%) |     39      18      61     18 |    0.00        0.00
GET      /product/0PUK6V6EV0                                                                3     0(0.00%) |     26      18      30     30 |    0.20        0.00
GET      /product/1YMWWN1N4O                                                                2     0(0.00%) |     18      11      25     11 |    0.00        0.00
GET      /product/2ZYFJ3GM2N                                                                3     0(0.00%) |     25      16      32     28 |    0.10        0.00
GET      /product/66VCHSJNUP                                                                2     0(0.00%) |     20      11      29     11 |    0.00        0.00
GET      /product/6E92ZMYYFZ                                                                2     0(0.00%) |     23      20      27     20 |    0.20        0.00
GET      /product/9SIQT8TOJO                                                                1     0(0.00%) |     30      30      30     30 |    0.00        0.00
GET      /product/L9ECAV7KIM                                                                3     0(0.00%) |     16      10      29     11 |    0.00        0.00
GET      /product/LS4PSXUNUM                                                                4     0(0.00%) |     22      12      31     19 |    0.20        0.00
POST     /setCurrency                                                                       2     0(0.00%) |     37      23      51     23 |    0.10        0.00
--------|----------------------------------------------------------------------------|-------|-------------|-------|-------|-------|-------|--------|-----------
         Aggregated                                                                        42     0(0.00%) |     28      10      76     25 |    1.20        0.00
```


Thus, we conclude that the application has been deployed as desired.


## Undeploy the Application

Afterward, we can undeploy the application.

```shell linenums="1"
vintner instances undeploy --instance boutique-instance
```

We can also optionally remove the instance or cleanup the filesystem.
Note, cleaning up the filesystem removes any vintner data including, e.g., all imported templates and created instances.

```shell linenums="1"
vintner instances delete --instance boutique-instance
vintner setup clean --force
```
