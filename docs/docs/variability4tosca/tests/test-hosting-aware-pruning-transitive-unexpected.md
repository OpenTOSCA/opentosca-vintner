# hosting-aware-pruning-transitive-unexpected

{{ autogenerated_notice('./task docs:generate:tests:variability') }}

## Description

- circle at hypervisor
- circle at agent

- pruned due to optimization


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_variability_1_0
topology_template:
    variability:
        options:
            mode: semantic-loose
            node_default_condition_mode: incoming-host
            required_hosting_constraint: false
            optimization_topology: true
            optimization_topology_unique: true
            expected_hosting_check: false
    node_templates:
        agent:
            type: agent
            requirements:
                - host: vm
        worker:
            type: worker
            anchor: true
            requirements:
                - host:
                      node: vm
        vm:
            type: vm
            requirements:
                - host: hypervisor
        hypervisor:
            type: hypervisor
{% endraw %}
```




## Variability-Resolved Service Template

The following variability-resolved service template is expected.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_simple_yaml_1_3
topology_template:
    node_templates:
        worker:
            type: worker
{% endraw %}
```

