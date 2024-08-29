# Operator "valid_values" Evaluates to "true"

{{ autogenerated_notice('./task docs:generate:tests:variability') }}

## Description

Assigns "true" to the property "value" of the node "container" since the parameter is a valid value.

## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    container:
      type: container
      properties:
        - value:
            expression:
              valid_values:
                - 1
                - - 0
                  - 1
{% endraw %}
```




## Variability-Resolved Service Template

The following variability-resolved service template is expected.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
  node_templates:
    container:
      type: container
      properties:
        value: true
{% endraw %}
```
