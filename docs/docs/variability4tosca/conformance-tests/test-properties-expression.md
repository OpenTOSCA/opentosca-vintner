# properties-expression



## Variable Service Template

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    node_one:
      type: node_one
      properties:
        - key_one:
            expression:
              get_variability_input: some_input

```



TODO: add all the remaining stuff
