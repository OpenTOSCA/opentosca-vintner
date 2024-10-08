# outputs-pruning-produced-unfurl-attribute-not

{{ autogenerated_notice('./task docs:generate:tests:variability') }}


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_variability_1_0
node_types:
    container:
        derived_from: tosca.nodes.Root
        attributes:
            some_attribute:
                type: string
topology_template:
    variability:
        options:
            type_default_condition: true
            output_default_condition: true
            output_default_consistency_condition: true
            output_default_semantic_condition: true
            property_default_condition: true
    outputs:
        input:
            type: string
            value: "{{ '::container::some_attribute' | eval }}"
    node_templates:
        container:
            type: container
            conditions: false
{% endraw %}
```




## Variability-Resolved Service Template

The following variability-resolved service template is expected.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_simple_yaml_1_3
node_types:
    container:
        derived_from: tosca.nodes.Root
        attributes:
            some_attribute:
                type: string
{% endraw %}
```

