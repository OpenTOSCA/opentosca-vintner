# requirement-assignment-default-alternative-false

{{ autogenerated_notice('./task docs:generate:tests:variability') }}


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_variability_1_0
topology_template:
    variability:
        options:
            type_default_condition: true
            expected_incoming_relation_check: false
    node_templates:
        one:
            type: one
            requirements:
                - two:
                      node: two
                      conditions: false
                - two_two:
                      node: two
                      default_alternative: false
        two:
            type: two
            requirements:
                - three: three
        three:
            type: three
{% endraw %}
```




## Variability-Resolved Service Template

The following variability-resolved service template is expected.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
    node_templates:
        one:
            type: one
        two:
            type: two
            requirements:
                - three: three
        three:
            type: three
{% endraw %}
```

