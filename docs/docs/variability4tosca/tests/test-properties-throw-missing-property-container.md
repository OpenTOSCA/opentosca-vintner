# properties-throw-missing-property-container

{{ autogenerated_notice('./task docs:generate:tests:variability') }}


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_variability_1_0
topology_template:
    node_templates:
        node_one:
            type: node_one
            properties:
                key_one: value_one
            conditions: false
{% endraw %}
```





## Expected Error

The following error is expected to be thrown, when resolving variability.

```text linenums="1"
Container of property "key_one@0" of node "node_one" does not exist
```
