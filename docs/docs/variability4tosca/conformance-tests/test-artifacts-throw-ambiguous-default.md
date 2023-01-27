# artifacts-throw-ambiguous-default



## Variable Service Template

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    node_one:
      type: node
      artifacts:
        - artifact_one_one:
            type: artifact_a
            default_alternative: true
        - artifact_one_one:
            type: artifact_b
            default_alternative: true

```



## Variability-Resolved Service Template

```yaml linenums="1"

```


TODO: add all the remaining stuff
