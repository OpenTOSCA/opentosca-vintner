# Operator &#34;or&#34; Evaluates to &#34;true&#34; (All &#34;true&#34;)

## Description

Assigns "true" to the property "value" of the node "container" since the expression evaluates to "true".

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
              or:
                - true
                - true
                - true
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
        value: true
```


