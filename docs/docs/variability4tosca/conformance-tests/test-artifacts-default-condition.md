# artifacts-default-condition



## Variable Service Template

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    node_one:
      type: node
      conditions: false
      artifacts:
        artifact_two_one:
          type: artifact
    node_two:
      type: node

```



TODO: add all the remaining stuff
