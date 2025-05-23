# hosting-aware-pruning-host-elastic

{{ autogenerated_notice('./task docs:generate:tests:variability') }}


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_variability_1_0
topology_template:
    variability:
        inputs:
            static:
                type: boolean
                default: true
        presets:
            static:
                inputs:
                    static: true
            elastic:
                inputs:
                    static: false
        expressions:
            is_static:
                equal:
                    - variability_input: static
                    - true
            is_elastic:
                equal:
                    - variability_input: static
                    - false
        options:
            mode: semantic-loose
            node_default_condition_mode: incoming-host
            required_hosting_constraint: true
            optimization_topology: false
            optimization_topology_unique_backward: true
    node_templates:
        shop:
            type: shop.component
            anchor: true
            requirements:
                - host:
                      node: os_compute
                - host:
                      node: gcp_runtime
                - database:
                      node: os_database
                - database:
                      node: gcp_database
        os_database:
            type: os.database
            requirements:
                - host: os_compute
        os_monitor:
            type: os.monitor
            requirements:
                - host: os_compute
        os_compute:
            type: os.compute
            conditions:
                logic_expression: is_static
            requirements:
                - host: os_cloud
        os_cloud:
            type: os.provider
        gcp_runtime:
            type: gcp.runtime
            conditions:
                logic_expression: is_elastic
            requirements:
                - host: gcp_cloud
        gcp_database:
            type: gcp.database
            requirements:
                - host: gcp_dbms
        gcp_dbms:
            type: gcp.dbms
            conditions:
                logic_expression: is_elastic
            requirements:
                - host: gcp_cloud
        gcp_cloud:
            type: gcp.provider
{% endraw %}
```





## Expected Error

The following error is expected to be thrown, when resolving variability.

```text linenums="1"
The result is ambiguous considering nodes (without optimization)
```
