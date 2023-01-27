# consistency-throw-multiple-hosting-relations



## Variable Service Template

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    one:
      type: one
      requirements:
        - host:
            node: two
            conditions: true
        - host:
            node: three
            conditions: true
    two:
      type: two
    three:
      type: three

```



## Variability-Resolved Service Template

```yaml linenums="1"

```


TODO: add all the remaining stuff
