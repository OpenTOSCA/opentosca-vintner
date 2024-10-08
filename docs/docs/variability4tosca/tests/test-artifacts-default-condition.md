# artifacts-default-condition

{{ autogenerated_notice('./task docs:generate:tests:variability') }}


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_variability_1_0
topology_template:
    variability:
        options:
            artifact_default_condition: true
            type_default_condition: true
    node_templates:
        node_one:
            type: node
            conditions: false
            artifacts:
                artifact_two_one:
                    type: artifact
        node_two:
            type: node
{% endraw %}
```




## Variability-Resolved Service Template

The following variability-resolved service template is expected.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
    node_templates:
        node_two:
            type: node
{% endraw %}
```

