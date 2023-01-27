# artifacts-throw-ambiguous-artifact



## Variable Service Template

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    node_one:
      type: node
      artifacts:
        - artifact_one:
            type: artifact_a
        - artifact_one:
            type: artifact_b

```



## Variability-Resolved Service Template

```yaml linenums="1"

```


TODO: add all the remaining stuff
