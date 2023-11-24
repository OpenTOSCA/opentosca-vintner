# implications-unexpected

{{ autogenerated_notice('yarn docs:generate:tests:variability') }}


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  variability:
    options:
      mode: loose
      node_default_condition_mode: incoming-host
      hosting_stack_constraint: true
      optimization: true
      unique: true
  node_templates:
    worker:
      type: worker
      consumed: true
      requirements:
        - left: left
        - right: right
    left:
      type: left
      requirements:
        - host: left_host
    left_host:
      type: left.host
      requirements:
        - host: left_host_host
    left_host_host:
      type: left.host.host
    right:
      type: right
      requirements:
        - host: right_host
    right_host:
      type: right.host
```



## Variability-Resolved Service Template

The following variability-resolved service template is expected.

```yaml linenums="1"
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
  node_templates:
    worker:
      type: worker
```
