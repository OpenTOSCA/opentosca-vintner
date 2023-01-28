# Operator "less_than" Evaluates to "false" (Greater)

## Description

Assigns "false" to the property "value" of the node "container" since the first parameter is greater than the second parameter.

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
              less_than:
                - 2
                - 1
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
        value: false
```


