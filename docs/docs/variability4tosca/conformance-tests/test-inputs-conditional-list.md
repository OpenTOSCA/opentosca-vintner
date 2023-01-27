# inputs-conditional-list



## Variable Service Template

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  inputs:
    - one:
        type: string
    - two:
        type: string
        conditions: false
    - three:
        type: string
        conditions: true

```



TODO: add all the remaining stuff
