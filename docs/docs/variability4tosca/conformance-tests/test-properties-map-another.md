# properties-map-another



## Variable Service Template

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    node_one:
      type: node_one
      properties:
        - key_one:
            value: value_one_one
            conditions: false
        - key_one:
            some_key: some_value

```



TODO: add all the remaining stuff
