# requirement-assignment-get-relation-presence-index-absent


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    container:
      type: container
      properties:
        - value:
            expression:
              get_relation_presence:
                - node_one
                - 0
    node_one:
      type: node_one
      requirements:
        - relation_one:
            node: node_one
            conditions: false
        - relation_two:
            node: node_two
            conditions: true
    node_two:
      type: node_two
```




## Variability-Resolved Service Template

The following variability-resolved service templated is expected.

```yaml linenums="1"
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
  node_templates:
    container:
      type: container
      properties:
        value: false
    node_one:
      type: node_one
      requirements:
        - relation_two:
            node: node_two
    node_two:
      type: node_two
```


