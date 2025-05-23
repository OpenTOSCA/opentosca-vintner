# implications-implies-left

{{ autogenerated_notice('./task docs:generate:tests:variability') }}


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_variability_1_0
topology_template:
    variability:
        inputs:
            mode:
                type: string
                default: left
        presets:
            left:
                inputs:
                    mode: left
            right:
                inputs:
                    mode: right
        expressions:
            is_left:
                equal:
                    - variability_input: mode
                    - left
            is_right:
                equal:
                    - variability_input: mode
                    - right
        options:
            mode: semantic-loose
            node_default_condition_mode: incoming-host
            required_hosting_constraint: true
            optimization_topology: true
            optimization_topology_unique: true
    node_templates:
        worker:
            type: worker
            anchor: true
            implies:
                - - relation_presence:
                        - SELF
                        - left
                  - logic_expression: is_left
                - - relation_presence:
                        - SELF
                        - right
                  - logic_expression: is_right
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
{% endraw %}
```




## Variability-Resolved Service Template

The following variability-resolved service template is expected.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
    node_templates:
        worker:
            type: worker
            requirements:
                - left: left
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
{% endraw %}
```

