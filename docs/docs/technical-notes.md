# Technical Notes

## Filesystem

### Home Directory

```text
${vintner_home}/
├─ templates/
├─ instances/
├─ plugins.yaml
```

### Instance Directory

```text
${vintner_home}/
├─ instances/
│  ├─ ${instance-name}/
│  │  ├─ data/
│  │  ├─ template/
│  │  │  ├─ service-template.${timestamp}.yaml
│  │  │  ├─ variability-inputs.${timestamp}.yaml
│  │  │  ├─ variable-service-template.yaml
│  │  │  ├─ ...
│  │  ├─ preset
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

### Instance Update

1. Deployment inputs are copied to the instance directory.
1. Command is sent to orchestrator to update variability-resolved service template.

### Instance Undeployment

1. Undeployment command is sent to orchestrator.

### Instance Deletion

1. Instance directory is deleted.

### Instance Adaptation

1. Sensor data is collected and stored as variability inputs.
2. Variability is resolved based on the new variability inputs.
3. Instance is updated based on the new variability-resolved deployment model.

## Conventions

- `get${data}` returns path to the data, e.g., `Instance#getServiceInputs`.
- `load${data}` returns data loaded from the filesystem, e.g. `Instance#loadServiceInputs`.
- `set${data}` writes data to filesystem, e.g. `Instance#setService`.

## Install NodeJS on Linux

```
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
sudo apt-get install nodejs -y
sudo npm install -g yarn
```

## General Helpful Tools on Linux

```
sudo apt-get install tree nano wget jq net-tools curl git stress -y
```

## Put Some Stress on CPU and Memory

```
stress --cpu 18 --vm 36 --vm-bytes 1024M
```