# requirement-assignment-default-condition



## Variable Service Template

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    one:
      type: one
      conditions: false
      requirements:
        - two: two
    two:
      type: two
      requirements:
        - three: three
    three:
      type: three

```



TODO: add all the remaining stuff
