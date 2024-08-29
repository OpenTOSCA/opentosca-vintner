# properties-properties

{{ autogenerated_notice('./task docs:generate:tests:variability') }}


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_variability_1_0
topology_template:
  variability:
    options:
      property_pruning: true
      type_default_condition: true
  node_templates:
    node_one:
      type: node_one
      properties:
        - key_one:
            value: value_one
            conditions: true
      conditions: false
{% endraw %}
```




## Variability-Resolved Service Template

The following variability-resolved service template is expected.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_simple_yaml_1_3
{% endraw %}
```
