# properties-default-alternative



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
            value: value_one_two
            conditions: false
        - key_one:
            value: value_one_three
            default_alternative: false
    node_two:
      type: node_two
      properties:
        - key_two:
            value: value_two_one
            conditions: false
        - key_two:
            value: value_two_two
            conditions: true
        - key_two:
            value: value_two_three
            default_alternative: true

```



TODO: add all the remaining stuff
