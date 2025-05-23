# implied-default-fixed-left

{{ autogenerated_notice('./task docs:generate:tests:variability') }}


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_variability_1_0_rc_2
topology_template:
    variability:
        inputs:
            l:
                type: boolean
        expressions:
            is_l:
                equal:
                    - variability_input: l
                    - true
            is_r:
                equal:
                    - variability_input: l
                    - false
        options:
            expected_incoming_relation_check: false
            required_incoming_relation_constraint: false
            enrich_technologies: false
            enrich_implementations: false
            unique_technology_constraint: false
            required_technology_constraint: false
    node_templates:
        application:
            type: Application
            anchor: true
            requirements:
                - connection:
                      node: left
                      conditions:
                          logic_expression: is_l
                - connection:
                      node: right
                      default_alternative: true
        right:
            type: Right
            anchor: true
        left:
            type: Left
            anchor: true
{% endraw %}
```

## Variability Inputs

When resolving variability, the following variability inputs shall be used.

```yaml linenums="1"
l: true
```



## Variability-Resolved Service Template

The following variability-resolved service template is expected.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
    node_templates:
        application:
            type: Application
            requirements:
                - connection: left
        right:
            type: Right
        left:
            type: Left
{% endraw %}
```

