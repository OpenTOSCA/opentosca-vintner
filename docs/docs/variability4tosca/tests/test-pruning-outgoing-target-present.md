# pruning-outgoing-target-present

{{ autogenerated_notice('yarn docs:generate:tests:variability') }}

## Description

- The node "source" has an outgoing relation "relation" to node "target". 
- The node default condition mode "outgoing" is used. 
- Thus, there is no cycle.
- Nothing is removed.


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  variability:
    options:
      node_default_condition: true
      node_default_condition_mode: outgoing
      relation_default_condition: true
      relation_default_condition_mode: source-target
      type_default_condition: true
  node_templates:
    source:
      type: source
      requirements:
        - relation:
            node: target
    target:
      type: target
```



## Variability-Resolved Service Template

The following variability-resolved service template is expected.

```yaml linenums="1"
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
  node_templates:
    source:
      type: source
      requirements:
        - relation:
            node: target
    target:
      type: target
```
