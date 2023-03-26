# Notes

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
│  │  ├─ template/
│  │  │  ├─ service-template.${timestamp}.yaml
│  │  │  ├─ variability-inputs.${timestamp}.yaml
│  │  │  ├─ variable-service-template.yaml
│  │  │  ├─ ...
│  │  ├─ info.yaml
│  │  ├─ service-inputs.yaml
│  │  ├─ ...
│  ├─ ...
├─ ...
```

## Workflows

### Instance Creation

1. Instance directory is created.
1. Extracted CSAR (Template) is copied into instance template directory.

### Instance Resolving

1. Variability inputs are stored in the instance template directory.
1. Variability in variable service template is resolved based on given variability inputs.
1. Variability-resolved service template is stored in instance template directory.

### Instance Deployment

1. Deployment inputs are copied to the instance directory.
1. Deployment command is sent to orchestrator. Variability-resolved service template is used.

### Instance Redeployment

1. Deployment command is sent once again to the orchestrator. Variability-resolve service templated is used. For
   example, to rerun a failed deployment.

### Instance Adaptation

1. Sensor data is collected and stored as variability inputs.
2. Variability is resolved based on the new variability inputs.
3. Instance is updated based on the new variability-resolved deployment model.

### Instance Undeployment

1. Undeployment command is sent to orchestrator.

### Instance Deletion

1. Instance directory is deleted.

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

## Conditional Elements Uniqueness

| Element | Original Structure | Map | List | Unique | Original Unique |
| ---------- |--| ---------------- | ---------------- | ---------------- | ---------------- |
| Inputs | Map | :material-check: | :material-check: | :material-check: | :material-check: |
| Nodes | Map | :material-check: | :material-check: | :material-check: | :material-check: |
| Relations | List | :material-close: | :material-check: | :material-close: | :material-close: |
| Properties | Map | :material-check: | :material-check: | :material-close: | :material-check: |
| Policies | List | :material-close: | :material-check: | :material-close: | :material-close: |
| Groups | Map | :material-check: | :material-check: | :material-check: | :material-check: |
| Artifacts | Map | :material-check: | :material-check: | :material-close: | :material-check: |


## Limitations

In the following, we briefly discuss limitations of our prototypical implementation.

1. We expect that each relationship templates is used exactly once
1. We expect that `relationship` at requirement assignments is a string
1. We expect that names of hosting relations match `/^(.*_)?host(_.*)?$/` since we do not implement the TOSCA type system.
1. We expect that names of connection relations match `/^(.*_)?connection(_.*)?$/` since we do not implement the TOSCA type system.