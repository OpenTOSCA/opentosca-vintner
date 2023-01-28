# Operator &#34;and&#34; Evaluates to &#34;false&#34; (Nested)

## Description

Assigns "false" to the property "value" of the node "container" since the expression evaluates to "false".

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
              and:
                - and:
                    - true
                    - false
                - true
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


