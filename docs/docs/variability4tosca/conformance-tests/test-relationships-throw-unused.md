# relationships-throw-unused



## Variable Service Template

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    one:
      type: one
      conditions: false
      requirements:
        - two:
            node: two
            conditions: false
            relationship: rtwo
    two:
      type: two
      requirements:
        - three: three
    three:
      type: three
  relationship_templates:
    rtwo:
      type: rtwo
    rthree:
      type: rthree

```



## Variability-Resolved Service Template

```yaml linenums="1"

```


TODO: add all the remaining stuff
