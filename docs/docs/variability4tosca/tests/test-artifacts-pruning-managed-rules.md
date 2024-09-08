# artifacts-pruning-managed-rules

{{ autogenerated_notice('./task docs:generate:tests:variability') }}


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_variability_1_0_rc_3
artifact_types:
    first.artifact.type:
        derived_from: tosca.artifacts.Root
    second.artifact.type:
        derived_from: tosca.artifacts.Root
node_types:
    application:
        derived_from: tosca.nodes.Root
topology_template:
    variability:
        technology_rules:
            ansible:
                - component: application
                  artifact: first.artifact.type
                  weight: 1
            terraform:
                - component: application
                  artifact: second.artifact.type
                  weight: 0
    node_templates:
        application:
            type: application
            persistent: true
            artifacts:
                - first_artifact_type:
                      type: first.artifact.type
                      file: first_artifact_file
                - second_artifact_type:
                      type: second.artifact.type
                      file: second_artifact_file
{% endraw %}
```




## Variability-Resolved Service Template

The following variability-resolved service template is expected.

```yaml linenums="1"
{% raw %}
tosca_definitions_version: tosca_simple_yaml_1_3
artifact_types:
    first.artifact.type:
        derived_from: tosca.artifacts.Root
    second.artifact.type:
        derived_from: tosca.artifacts.Root
node_types:
    application:
        derived_from: tosca.nodes.Root
topology_template:
    node_templates:
        application:
            type: application~application#first.artifact.type::ansible
            artifacts:
                first_artifact_type:
                    type: first.artifact.type
                    file: first_artifact_file
{% endraw %}
```
