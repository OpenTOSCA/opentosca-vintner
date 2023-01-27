# relationships-throw-undefined



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
        - three:
            node: three
            relationship: rthree
    three:
      type: three
  relationship_templates:
    rtwo:
      type: rtwo

```



## Variability-Resolved Service Template

```yaml linenums="1"

```


TODO: add all the remaining stuff
