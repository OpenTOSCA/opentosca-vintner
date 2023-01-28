# properties-throw-multiple-default


## Variable Service Template

The variability of the following variable service template shall be resolved.

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
            default_alternative: true
        - key_one:
            value: value_one_four
            default_alternative: true
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





## Expected Error

The following error is expected to be thrown, when resolving variability.

```text linenums="1"
Property "key_one" of node "node_one" has multiple defaults
```

