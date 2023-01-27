# requirement-assignment-default-alternative


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    one:
      type: one
      requirements:
        - two:
            node: two
            conditions: false
        - two_two:
            node: two
            default_alternative: true
    two:
      type: two
      requirements:
        - three: three
    three:
      type: three

```







## Variability-Resolved Service Template

The following variability-resolved service templated is expected.

```yaml linenums="1"
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
  node_templates:
    one:
      type: one
      requirements:
        - two_two:
            node: two
    two:
      type: two
      requirements:
        - three: three
    three:
      type: three

```


