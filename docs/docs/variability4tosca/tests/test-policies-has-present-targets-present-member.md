# Policy Targets Present Member

## Description

The policy "policy_one" targets two absent nodes and a group which has one absent and one present node. Since one node is present, the policy "policy_one" has present targets.

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
              has_present_targets: policy_one
    node_one:
      type: node_one
      conditions: false
    node_two:
      type: node_two
      conditions: false
    node_three:
      type: node_three
      conditions: false
    node_four:
      type: node_four
      conditions: true
  groups:
    group_one:
      type: group_one
      members:
        - node_three
        - node_four
  policies:
    - policy_one:
        type: policy_one
        targets:
          - node_one
          - node_two
          - group_one
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
        value: true
    node_four:
      type: node_four
  groups:
    group_one:
      type: group_one
      members:
        - node_four
  policies:
    - policy_one:
        type: policy_one
        targets:
          - group_one
```


