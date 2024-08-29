# technologies-expected

{{ autogenerated_notice('./task docs:generate:tests:variability') }}


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_variability_1_0
topology_template:
  variability:
    options:
      optimization_technologies: false
      technology_pruning: false
      technology_constraint: false
      expected_technology_check: true
  node_templates:
    container:
      type: container
      technology:
        - ansible:
            conditions: false
{% endraw %}
```





## Expected Error

The following error is expected to be thrown, when resolving variability.

```text linenums="1"
Node "container" expected to have a technology
```