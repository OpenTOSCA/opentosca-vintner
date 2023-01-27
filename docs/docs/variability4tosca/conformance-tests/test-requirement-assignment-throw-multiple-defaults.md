# requirement-assignment-throw-multiple-defaults



## Variable Service Template

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    one:
      type: one
      requirements:
        - two:
            node: two
            default_alternative: true
        - two:
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

```yaml linenums="1"

```


TODO: add all the remaining stuff
