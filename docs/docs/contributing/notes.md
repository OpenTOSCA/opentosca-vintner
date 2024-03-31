---
tags:
- Contributing
---

# Notes

This document holds a collection of arbitrary notes.

## Filesystem

### Home Directory

```text linenums="1"
${vintner_home}/
├─ templates/
├─ instances/
├─ assets/
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

## Template Config 

A template might have a `config.yaml` at root of the following type.

```typescript linenums="1"
export type Config = {
    dependencies: Dependencies
}

export type Dependencies = TemplateDependency[]
export type TemplateDependency = {
    source: string
    target?: string
}
```

## Workflows

### Initialize a new Instance

!!! note "vintner instances init"

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

### Continue an Instance Deployment

!!! note "vintner instances continue"

1. Continue deployment command is sent to the orchestrator. Variability-resolve service templated is used. For
   example, to rerun a failed deployment.

### Swap an Instance Template

!!! note "vintner instances swap"

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

## General Helpful Tools on Linux

```shell linenums="1"
sudo apt-get update -y && sudo apt-get install sudo unzip tree nano wget jq net-tools curl git stress nmap -y
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

## bwCloud Blocked Ports

Some ports are blocked when using bwCloud: https://www.bw-cloud.org/de/bwcloud_scope/netzwerk

## Naming Convention

Types should be named according to the following pattern.

```text linenums="1"
type     = [domain]+.entity[.Name]+
entity   = "nodes" | "relationships" | "capabilities" | "artifacts" | "datatypes" | "groups
         | "policies" | "interfaces"
word     = ("a" ... "z" | "A" ... "Z")[word]
*        = word
```

## Environment

All environment variables are prefixed by `OPENTOSCA_VINTNER_`.
When the following environment variables are read, they are tried to be parsed as JSON.
If they can not be parsed, they are treated as string.

- `OPENTOSCA_VINTNER_VARIABILITY_PRESETS`
- `OPENTOSCA_VINTNER_VARIABILITY_INPUT_${KEY}`
- `OPENTOSCA_VINTNER_DEPLOYMENT_INPUT_${KEY}`

These environment variables should be used with caution. 

## Lines of Code

Run the following command, to count the lines of code in the `src` folder.

```text linenums="1"
cloc src
```

The following output has been generated for the commit `27899d2615366140e21629cb5f7b4a35475e8b3d` on March 23, 2024.

```text linenums="1"
     221 text files.
     218 unique files.                                          
       3 files ignored.

github.com/AlDanial/cloc v 1.98  T=0.17 s (1293.3 files/s, 85539.2 lines/s)
-------------------------------------------------------------------------------
Language                     files          blank        comment           code
-------------------------------------------------------------------------------
TypeScript                     186           2238           1102          10613
Bourne Shell                    18             60             51            190
YAML                             8             12              0            111
EJS                              5              7              0             34
CSV                              1              0              0              1
-------------------------------------------------------------------------------
SUM:                           218           2317           1153          10949
-------------------------------------------------------------------------------
```

## Adding a New Publication

1. Step-by-step guide
1. Zenodo
1. Integration tests
1. Entry in [Publications](../publications.md)
1. Git tag
1. Add used links 

## Used Links

The following links are used in publications.

- https://github.com/opentosca/opentosca-vintner
- https://github.com/OpenTOSCA/opentosca-vintner/actions/runs/6100939642/job/16556255878
- https://vintner.opentosca.org
- https://vintner.opentosca.org/variability4tosca/specification
- https://vintner.opentosca.org/variability4tosca/guides/artifacts
- https://vintner.opentosca.org/variability4tosca/guides/pruning
- https://vintner.opentosca.org/variability4tosca/guides/modes


## Limitations

We briefly discuss limitations of our prototypical implementation.

1. We expect that each relationship templates is used exactly once.
1. We expect that `relationship` at requirement assignments is a string.
1. We expect that names of hosting relations match `/^(.*_)?host(_.*)?$/` since we do not implement the TOSCA type system.
1. We expect that names of connection relations match `/^(.*_)?connection(_.*)?$/` since we do not implement the TOSCA type system.
