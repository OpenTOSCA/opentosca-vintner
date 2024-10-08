# pruning-outgoing-target-absent

{{ autogenerated_notice('./task docs:generate:tests:variability') }}

## Description

- The node "source" has an outgoing relation "relation" to node "target". 
- The node default condition mode "outgoing" is used. 
- Thus, there is no circle.

- "target" is absent
- Thus, "relation" is absent
- Thus, "source" is absent


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_variability_1_0
topology_template:
    variability:
        options:
            node_default_condition: true
            node_default_condition_mode: outgoing
            relation_default_condition: true
            relation_default_condition_mode: source-target
            type_default_condition: true
    node_templates:
        source:
            type: source
            requirements:
                - relation:
                      node: target
        target:
            type: target
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

