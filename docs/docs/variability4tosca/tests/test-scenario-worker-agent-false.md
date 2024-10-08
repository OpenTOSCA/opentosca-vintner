# scenario-worker-agent-false

{{ autogenerated_notice('./task docs:generate:tests:variability') }}

## Description

- agent and worker hosted on a virtual machine
- virtual machine is only present if either agent or worker is present
- worker is absent

- agent is absent, thus, also the virtual machine is absent


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_variability_1_0
topology_template:
    variability:
        options:
            mode: semantic-loose
            optimization_topology: true
    node_templates:
        agent:
            type: agent
            conditions: false
            requirements:
                - host: vm
        worker:
            type: worker
            conditions: false
            requirements:
                - host: vm
        vm:
            type: vm
{% endraw %}
```




## Variability-Resolved Service Template

The following variability-resolved service template is expected.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_simple_yaml_1_3
{% endraw %}
```

