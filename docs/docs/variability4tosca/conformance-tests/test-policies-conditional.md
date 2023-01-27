# policies-conditional


## Description

- Removes node "node_two" from node templates and policy "policy_one" and "policy_three" since conditions is "false". - Removes policy "policy_two" since conditions is "false".


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    node_one:
      type: node_one
    node_two:
      type: node_two
      conditions: false
  policies:
    - policy_one:
        type: policy_one
        targets:
          - node_one
          - node_two
        conditions: true
    - policy_two:
        type: policy_two
        targets:
          - node_one
          - node_two
        conditions: false
    - policy_three:
        type: policy_three
        targets:
          - node_one
          - node_two

```







## Variability-Resolved Service Template

The following variability-resolved service templated is expected.

```yaml linenums="1"
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
  node_templates:
    node_one:
      type: node_one
  policies:
    - policy_one:
        type: policy_one
        targets:
          - node_one
    - policy_three:
        type: policy_three
        targets:
          - node_one

```


