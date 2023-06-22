# Notes

This document contains a collection of arbitrary notes.

## Filesystem

### Home Directory

```text linenums="1"
${vintner_home}/
├─ templates/
├─ instances/
├─ plugins.yaml
```

### Instance Directory

```text linenums="1"
${vintner_home}/
├─ instances/
│  ├─ ${instance-name}/
│  │  ├─ data/
│  │  ├─ service-inputs/
│  │  │  ├─ ${timestamp}.yaml
│  │  ├─ templates/
│  │  │  ├─ ${timestamp}/
│  │  │  │  ├─ service-template.${timestamp}.yaml
│  │  │  │  ├─ variability-inputs.${timestamp}.yaml
│  │  │  │  ├─ variable-service-template.yaml
│  │  │  │  ├─ ...
│  │  ├─ info.yaml
│  │  ├─ ...
│  ├─ ...
├─ ...
```

## Instance Info

| Keyname                   | Mandatory | Type   | Description                                                                            |
|---------------------------|-----------|--------|----------------------------------------------------------------------------------------|
| name                      | true      | String | Instance name                                                                          |
| creation_timestamp        | true      | Number | ISO milliseconds of creation date                                                      |
| resolved_timestamp        | false     | Number | ISO milliseconds of latest variablity inputs and variability-resolved service template |
| template_timestamp        | true      | Number | ISO milliseconds of latest variable service template                                   |
| service_inputs_timestamp  | false     | Number | ISO milliseconds of latest service inputs                                              |


## Workflows

### Create a new Instance

!!! note "vintner instances create"

1. Instance directory is created.
1. Extracted CSAR (Template) is copied into instance template directory.
1. Instance info is updated

### Resolve the Variability of an Instance

!!! note "vintner instances resolve"

1. Variability inputs are stored in the instance template directory.
1. Variability in variable service template is resolved based on given variability inputs.
1. Variability-resolved service template is stored in instance template directory.

### Deploy an Instance

!!! note "vintner instances deploy"

1. Deployment inputs are copied to the service inputs directory.
1. Deployment command is sent to orchestrator. Variability-resolved service template is used.

### Redeploy an Instance

!!! note "vintner instances redeploy"

1. Deployment command is sent once again to the orchestrator. Variability-resolve service templated is used. For
   example, to rerun a failed deployment.

### Update an Instance Template

!!! note "vintner instances update-template"

1. New template is copied into (new) instance template directory
1. Instance info is updated

### Update an Instance 

!!! note "vintner instances update"

1. Deployment inputs are copied to the service inputs directory.
1. Instance info is updated.
1. Update command is sent to orchestrator. Variability-resolved service template is used.

Note, requires to resolve variability first.
In contrast to deploying an instance, deployment inputs can be changed and the update command instead of the deploy command is sent to the orchestrator.

### Adapt an Instance

!!! note "vintner instances adapt"

1. Sensor data is collected and stored as variability inputs.
2. Variability is resolved based on the new variability inputs.
3. Instance is updated based on the new variability-resolved topology template.
1. Instance info is updated.

In contrast to updating an instance template, adapting an instance regenerates the variability-resolve topology template and does not swap the variable topology template.
In contrast to updating an instance, variability inputs change and variability is resolved.

### Undeploy an Instance

!!! note "vintner instances undeploy"

1. Undeployment command is sent to orchestrator.

### Delete an Instance

!!! note "vintner instances delete"

1. Instance directory is deleted.

Note, this does not undeploy the instance.

## Conventions

- `get${data}` returns path to the data, e.g., `Instance#getServiceInputs`.
- `load${data}` returns data loaded from the filesystem, e.g. `Instance#loadServiceInputs`.
- `set${data}` writes data to filesystem, e.g. `Instance#setService`.

## Install NodeJS on Linux

```shell linenums="1"
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo bash -
sudo apt-get install nodejs -y
sudo npm install -g yarn
```

## General Helpful Tools on Linux

```shell linenums="1"
sudo apt-get update -y && sudo apt-get install tree nano wget jq net-tools curl git stress nmap -y
```

## Put Some Stress on CPU and Memory

```shell linenums="1"
stress --cpu 18 --vm 36 --vm-bytes 1024M
```

## Reverse SSH Tunnel

```shell linenums="1"
ssh -N -R 2999:192.168.178.46:3001 pi
```

## Executable File under Windows

```shell linenums="1"
git update-index --chmod=+x <path to file>
```

## Naming Convention

Types should be named according to the following pattern.

```text linenums="1"
type     = [domain]+.entity[.Name]+
entity   = "nodes" | "relationships" | "capabilities" | "artifacts" | "datatypes" | "groups
         | "policies" | "interfaces"
word     = ("a" ... "z" | "A" ... "Z")[word]
*        = word
```


## Limitations

In the following, we briefly discuss limitations of our prototypical implementation.

1. We expect that each relationship templates is used exactly once
1. We expect that `relationship` at requirement assignments is a string
1. We expect that names of hosting relations match `/^(.*_)?host(_.*)?$/` since we do not implement the TOSCA type system.
1. We expect that names of connection relations match `/^(.*_)?connection(_.*)?$/` since we do not implement the TOSCA type system.