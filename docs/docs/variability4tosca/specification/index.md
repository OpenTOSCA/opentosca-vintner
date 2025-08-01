---
title: Specification
tags:
- Variability4TOSCA
- Specification
---

--8<-- "enumerate.html"

# Variability4TOSCA Specification 1.0 Release Candidate

This document specifies Variability4TOSCA which extends
[TOSCA Simple Profile in YAML Version 1.3](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html){target=_blank}
with conditional elements to model deployment variability.
This includes conditional node templates, relationship templates, properties, artifacts, groups, policies, types, inputs, and imports.
In the following, we discuss the differences and the [processes to resolve the variability](#processing).
The specification is under active development and is not backwards compatible with any previous versions.

## Terminology 

We quickly introduce some terminologies.

- A condition holds if the condition evaluates to true.
- An element is present if all assigned conditions hold.
- An element is absent if not all assigned conditions hold.
- A variability resolver is a TOSCA processor that resolves the variability of a variable service template, thus, derives a variability-resolved service template

## Service Template

A service template must have the TOSCA definitions version `tosca_variability_1_0`.
Such a service template is also called variable service template.

| Keyname                   | Mandatory | Type   | Description                                                              |
|---------------------------|-----------|--------|--------------------------------------------------------------------------|
| tosca_definitions_version | true       | String | The required TOSCA definitions version. Must be `tosca_variability_1_0`. |


## Topology Template

A topology template additionally contains a variability definition.
Such a topology template is also called variable topology template.

| Keyname     | Mandatory | Type                  | Description                                                                                 |
|-------------|-----------|-----------------------|---------------------------------------------------------------------------------------------|
| variability | true       | VariabilityDefinition | A required object for variability inputs, variability presets, and variability expressions. |


## Variability Definition

A variability definition defines variability inputs, variability presets, variability expressions, and variability options.

| Keyname                  | Mandatory | Type                                             | Description                                                                                                                                                 |
|--------------------------|-----------|--------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| inputs                   | false     | Map(String, VariabilityInput)                    | An optional map of input parameters used inside variability expressions.                                                                                    |
| presets                  | false     | Map(String, VariabilityPreset)                   | An optional map of variability preset definitions.                                                                                                          |
| expressions              | false     | Map(String, VariabilityExpression)               | An optional map of variability expressions.                                                                                                                 |
| constraints              | false     | List(LogicExpression)                            | An optional list of constraints respected when resolving variability.                                                                                       |
| options                  | false     | Map(String, Boolean)                             | An optional map of variability options.                                                                                                                     |
| type_specific_conditions | false     | String &#124; List(TypeSpecificDefaultCondition) | An optional definition of type-specific default conditions. If string, then treated as relative file to import (default: "./type-specific-conditions.yaml") |
| qualities         | false     | String &#124; List(TechnologyRule)               | An optional definition of technology assignment rules. If string, then treated as relative file to import (default: ["./rules.yaml", "./lib/rules.yaml"]).  |
| plugins                  | false     | PluginDefinition                                 | An optional definition of plugins.                                                                                                                          |

The following non-normative and incomplete example contains a variability definition which declares the variability
input `mode` and  two variability presets `dev` and `prod` are defined which either assigns `mode` the value `dev` or `prod`.
Furthermore, two variability conditions `is_dev` and `is_prod` which evaluate if `mode` equals `dev` or `prod`, respectively.

```yaml linenums="1"
variability:
    inputs:
        mode:
            type: string

    presets:
        dev:
            name: Development
            description: Deploy the application on a private cloud
            inputs:
                mode: dev
        prod:
            name: Production
            description: Deploy the application on a public cloud
            inputs:
                mode: prod

    expressions:
        is_dev: { equal: [ { variability_input: mode }, dev ] }
        is_prod: { equal: [ { variability_input: mode }, prod ] }
```


## Variability Input

A variability input is an input parameter which additionally has the following keywords.

| Keyname            | Mandatory | Type                       | Description                                                                                |
|--------------------|-----------|----------------------------|--------------------------------------------------------------------------------------------|
| default_expression | false     | ValueExpression            | A value expression as default.                                                             |
| mandatory          | false     | String &#124; List(String) | Mandatory variability inputs.                                                              |
| optional           | false     | String &#124; List(String) | Any other variability input.                                                               |
| choices            | false     | List(String)               | Requires none, one, or multiple of referenced variability input.                           |
| alternatives       | false     | List(String)               | Requires exactly one of the referenced variability input.                                  |
| requires           | false     | String &#124; List(String) | (Cross-tree) Implies/ requires another variability input.                                  |
| excludes           | false     | String &#124; List(String) | (Cross-tree) Excludes another variability input.                                           |

For example, the following variability input has a value expression as default value assigned. 

````yaml linenums="1"
inputs:
    mode:
        type: string
        default_expression: <ValueExpression>
````

## Variability Options

There are the following variability options.
More specific options override wider set options.
For example, the following options the mode `strict` is configured. 
This mode disables all default conditions and pruning.
However, pruning of nodes is explicitly set by `node_pruning`, thus, nodes are pruned regardless of the set mode.

````yaml linenums="1"
options: 
    mode: manual
    node_pruning: true
````

### General Options

The following options are general options.

| Keyname | Mandatory | Type                                                                                                                | Default | Description             |
|---------|-----------|---------------------------------------------------------------------------------------------------------------------|---------|-------------------------|
| mode    | false     | manual &#124; consistent-strict &#124; consistent-loose &#124; default &#124; semantic-strict &#124; semantic-loose | manual  | Configure pruning mode. |

### Default Condition Options

The following options are used to configure the default conditions of elements.

| Keyname                                  | Mandatory | Type                                                                                                  | Default                  | Description                                                                        |
|------------------------------------------|-----------|-------------------------------------------------------------------------------------------------------|--------------------------|------------------------------------------------------------------------------------|
| default_condition                        | false     | Boolean                                                                                               | false                    | Enable all default conditions (consistency and semantic).                          |
| input_default_condition                  | false     | Boolean                                                                                               | false                    | Enable default condition for inputs (consistency and semantic).                    |
| input_default_consistency_condition      | false     | Boolean                                                                                               | false                    | Enable default consistency condition for inputs.                                   |
| input_default_semantic_condition         | false     | Boolean                                                                                               | false                    | Enable default semantic condition for inputs.                                      |
| node_default_condition                   | false     | Boolean                                                                                               | false                    | Enable default condition for nodes (consistency and semantic).                     |
| node_default_condition_mode              | false     | List(source &#124; incoming &#124; incomingnaive &#124; host &#124; artifact &#124; artifactnaive, -) | incoming-artifact        | Configure the default condition for nodes.                                         |
| node_default_consistency_condition       | false     | Boolean                                                                                               | false                    | Enable default consistency condition for nodes.                                    |
| node_default_semantic_condition          | false     | Boolean                                                                                               | false                    | Enable default semantic condition for nodes.                                       |
| output_default_condition                 | false     | Boolean                                                                                               | false                    | Enable default condition for outputs (consistency and semantic).                   |
| output_default_condition_mode            | false     | List(produced &#124; default, -)                                                                      | produced                 | Configure the default condition for outputs.                                       |
| output_default_consistency_condition     | false     | Boolean                                                                                               | false                    | Enable default consistency condition for outputs.                                  |
| output_default_semantic_condition        | false     | Boolean                                                                                               | false                    | Enable default semantic condition for outputs.                                     |
| relation_default_condition               | false     | Boolean                                                                                               | false                    | Enable default condition for relations (consistency and semantic).                 |
| relation_default_condition_mode          | false     | List(source &#124; target &#124; default, -)                                                          | source-target            | Configure the default condition for relations.                                     |
| relation_default_consistency_condition   | false     | Boolean                                                                                               | false                    | Enable default semantic condition for relations.                                   |
| relation_default_semantic_condition      | false     | Boolean                                                                                               | false                    | Enable default consistency condition for relations.                                |
| relation_default_implied                 | false     | Boolean                                                                                               | false                    | Enable default implication for relations. Does not apply for hosting relations.    |
| policy_default_condition                 | false     | Boolean                                                                                               | false                    | Enable default condition for policies (consistency and semantic).                  |
| policy_default_consistency_condition     | false     | Boolean                                                                                               | false                    | Enable default consistency condition for policies.                                 |
| policy_default_semantic_condition        | false     | Boolean                                                                                               | false                    | Enable default semantic condition for policies.                                    |
| group_default_condition                  | false     | Boolean                                                                                               | false                    | Enable default condition for groups (consistency and semantic).                    |
| group_default_consistency_condition      | false     | Boolean                                                                                               | false                    | Enable default consistency condition for groups.                                   |
| group_default_semantic_condition         | false     | Boolean                                                                                               | false                    | Enable default semantic condition for groups.                                      |
| artifact_default_condition               | false     | Boolean                                                                                               | false                    | Enable default condition for artifacts (consistency and semantic).                 |
| artifact_default_condition_mode          | false     | List(container &#124; technology &#124; default, -)                                                   | container                | Configure the default condition for artifacts.                                     |
| artifact_default_consistency_condition   | false     | Boolean                                                                                               | false                    | Enable default consistency condition for artifacts.                                |
| artifact_default_semantic_condition      | false     | Boolean                                                                                               | false                    | Enable default semantic condition for artifacts.                                   |
| property_default_condition               | false     | Boolean                                                                                               | false                    | Enable default condition for properties (consistency and semantic).                |
| property_default_condition_mode          | false     | List(container &#124; consuming &#124; default, -)                                                    | container-consuming      | Configure the default condition for properties.                                    |
| property_default_consistency_condition   | false     | Boolean                                                                                               | false                    | Enable default consistency condition for properties.                               |
| property_default_semantic_condition      | false     | Boolean                                                                                               | false                    | Enable default semantic condition for properties.                                  |
| type_default_condition                   | false     | Boolean                                                                                               | false                    | Enable default condition for types (consistency and semantic).                     |
| type_default_consistency_condition       | false     | Boolean                                                                                               | false                    | Enable default consistency condition for types.                                    |
| type_default_semantic_condition          | false     | Boolean                                                                                               | false                    | Enable default semantic condition for types.                                       |
| technology_default_condition             | false     | Boolean                                                                                               | false                    | Enable default condition for (deployment) technologies (consistency and semantic). |
| technology_default_condition_mode        | false     | List(container &#124; other &#124; default, -)                                                        | container-other-scenario | Configure the default condition for (deployment) technologies.                     |
| technology_default_consistency_condition | false     | Boolean                                                                                               | false                    | Enable default consistency condition for technologies.                             |
| technology_default_semantic_condition    | false     | Boolean                                                                                               | false                    | Enable default semantic condition for technologies.                                |

### Pruning Options

The following options are used to configure the pruning of elements.

| Keyname                        | Mandatory | Type                                      | Default       | Description                                                             |
|--------------------------------|-----------|-------------------------------------------|---------------|-------------------------------------------------------------------------|
| pruning                        | false     | Boolean                                   | false         | Enable pruning of all elements  (consistency and semantic).             |
| input_pruning                  | false     | Boolean                                   | false         | Enable pruning of inputs (consistency and semantic).                    |
| input_consistency_pruning      | false     | Boolean                                   | false         | Enable consistency pruning of inputs.                                   |
| input_semantic_pruning         | false     | Boolean                                   | false         | Enable semantic pruning of inputs.                                      |
| node_pruning                   | false     | Boolean                                   | false         | Enable pruning of nodes (consistency and semantic).                     |
| node_consistency_pruning       | false     | Boolean                                   | false         | Enable consistency pruning of nodes.                                    |
| node_semantic_pruning          | false     | Boolean                                   | false         | Enable semantic pruning of nodes.                                       |
| output_pruning                 | false     | Boolean                                   | false         | Enable pruning of output (consistency and semantic).                    |
| output_consistency_pruning     | false     | Boolean                                   | false         | Enable consistency pruning of output.                                   |
| output_semantic_pruning        | false     | Boolean                                   | false         | Enable semantic pruning of output.                                      |
| relation_pruning               | false     | Boolean                                   | false         | Enable pruning of relations (consistency and semantic).                 |
| relation_consistency_pruning   | false     | Boolean                                   | false         | Enable consistency pruning of relations.                                |
| relation_semantic_pruning      | false     | Boolean                                   | false         | Enable semantic pruning of relations.                                   |
| policy_pruning                 | false     | Boolean                                   | false         | Enable pruning of policies (consistency and semantic).                  |
| policy_consistency_pruning     | false     | Boolean                                   | false         | Enable consistency pruning of policies.                                 |
| policy_semantic_pruning        | false     | Boolean                                   | false         | Enable semantic pruning of policies.                                    |
| group_pruning                  | false     | Boolean                                   | false         | Enable pruning of groups (consistency and semantic).                    |
| group_consistency_pruning      | false     | Boolean                                   | false         | Enable consistency pruning of groups.                                   |
| group_semantic_pruning         | false     | Boolean                                   | false         | Enable semantic pruning of groups.                                      |
| artifact_pruning               | false     | Boolean                                   | false         | Enable pruning of artifacts (consistency and semantic).                 |
| artifact_consistency_pruning   | false     | Boolean                                   | false         | Enable consistency pruning of artifacts.                                |
| artifact_semantic_pruning      | false     | Boolean                                   | false         | Enable semantic pruning of artifacts.                                   |
| property_pruning               | false     | Boolean                                   | false         | Enable pruning of properties (consistency and semantic).                |
| property_consistency_pruning   | false     | Boolean                                   | false         | Enable consistency pruning of properties.                               |
| property_semantic_pruning      | false     | Boolean                                   | false         | Enable semantic pruning of properties.                                  |
| type_pruning                   | false     | Boolean                                   | false         | Enable pruning of types (consistency and semantic).                     |
| type_consistency_pruning       | false     | Boolean                                   | false         | Enable consistency pruning of types.                                    |
| type_semantic_pruning          | false     | Boolean                                   | false         | Enable semantic pruning of types.                                       |
| technology_pruning             | false     | Boolean                                   | false         | Enable pruning of (deployment) technologies (consistency and semantic). |
| technology_consistency_pruning | false     | Boolean                                   | false         | Enable consistency pruning of technologies.                             |
| technology_semantic_pruning    | false     | Boolean                                   | false         | Enable semantic pruning of technologies.                                |

### Checks Options

The following options are used to configure checks.

| Keyname                            | Mandatory | Type    | Default | Description                                                                     |
|------------------------------------|-----------|---------|---------|---------------------------------------------------------------------------------|
| checks                             | false     | Boolean | true    | Enable all checks.                                                              |
| consistency_checks                 | false     | Boolean | true    | Enable all consistency checks.                                                  |
| semantic_checks                    | false     | Boolean | true    | Enable all semantic checks.                                                     |
| relation_source_check              | false     | Boolean | true    | Enable the consistency check regarding present relation sources.                |
| relation_target_check              | false     | Boolean | true    | Enable the consistency check regarding present relation targets.                |
| ambiguous_hosting_check            | false     | Boolean | true    | Enable the consistency check regarding at maximum one present hosting relation. |
| missing_artifact_container_check   | false     | Boolean | true    | Enable the consistency check regarding present container of artifacts.          |
| ambiguous_artifact_check           | false     | Boolean | true    | Enable the consistency check regarding ambiguous present artifacts.             |
| missing_property_container_check   | false     | Boolean | true    | Enable the consistency check regarding present container of properties.         |
| ambiguous_property_check           | false     | Boolean | true    | Enable the consistency check regarding ambiguous present properties.            |
| missing_type_container_check       | false     | Boolean | true    | Enable the consistency check regarding present containers of types.             |
| ambiguous_type_check               | false     | Boolean | ture    | Enable the consistency check regarding exactly one present type per container.  |
| expected_hosting_check             | false     | Boolean | true    | Enable the semantic check regarding an expected present hosting relation.       |
| expected_incoming_relation_check   | false     | Boolean | true    | Enable the semantic check regarding an expected incoming relation.              |
| expected_artifact_check            | false     | Boolean | true    | Enable the semantic check regarding an expected artifact.                       |
| expected_technology_check          | false     | Boolean | true    | Enable the consistency check regarding present technologies.                    |
| missing_technology_container_check | false     | Boolean | true    | Enable the consistency check regarding present container of technologies.       |
| ambiguous_technology_check         | false     | Boolean | true    | Enable the consistency check regarding ambiguous present technologies.          |
| ambiguous_relation_check           | false     | Boolean | true    | Enable the consistency check regarding ambiguous present relations.             |
| ambiguous_input_check              | false     | Boolean | true    | Enable the consistency check regarding ambiguous present inputs.                |
| ambiguous_output_check             | false     | Boolean | true    | Enable the consistency check regarding ambiguous present outputs.               |
| unconsumed_input_check             | false     | Boolean | true    | Enable the semantic check regarding not consumed inputs.                        |
| unproduced_output_check            | false     | Boolean | true    | Enable the consistency check regarding not produced outputs.                    |
| required_technology_check          | false     | Boolean | true    | Enable _in the enricher_ if technology is required when enriching technologies  |
| anchor_check                       | false     | Boolean | true    | Enable _in the populator_ if an anchor exists                                   |

### Solver Options

The following options are used to configure the solver.

| Keyname                               | Mandatory | Type                                    | Default | Description                                                                                                               |
|---------------------------------------|-----------|-----------------------------------------|---------|---------------------------------------------------------------------------------------------------------------------------|
| optimization_topology                 | false     | Boolean &#124; min &#124; max           | false   | Configure optimization considering topology.                                                                              | 
| optimization_topology_unique          | false     | Boolean                                 | true    | Enable check for unique results considering topology.                                                                     |
| optimization_topology_unique_backward | false     | Boolean                                 | false   | Enable check for unique results considering topology in backwards compatibility (does not expecte topology optimization). |
| optimization_topology_mode            | false     | count &#124; weight                     | weight  | Configure optimization mode considering topology.                                                                         |
| optimization_technologies             | false     | Boolean &#124; min &#124; max           | false   | Enable optimization considering technologies.                                                                             | 
| optimization_technologies_unique      | false     | Boolean                                 | false   | Enable check for unique results considering technologies.                                                                 | 
| optimization_technologies_mode        | false     | count &#124; weight &#124; weight-count | count   | Configure optimization mode considering technologies.                                                                     | 
| optimization_scenarios                | false     | Boolean                                 | false   | Enable optimization considering scenarios.                                                                                | 
| optimization_scenarios_unique         | false     | Boolean                                 | false   | Enable check for unique scenarios.                                                                                        | 


### Enricher Options

The following options are used to configure the enricher.

| Keyname                       | Mandatory | Type    | Default | Description                                                                                                           |
|-------------------------------|-----------|---------|---------|-----------------------------------------------------------------------------------------------------------------------|
| enrich_input_condition        | false     | Boolean | true    | Enable if a condition should be enriched to an element considering a variability input having the element id as name. |
| enrich_technologies           | false     | Boolean | false   | Enable if technologies are enriched.                                                                                  |
| enrich_technologies_best_only | false     | Boolean | false   | Enable if only best technoloiges are enriched.                                                                        |
| enrich_implementations        | false     | Boolean | false   | Enable if implementations are enriched.                                                                               |


### Normalizer Options

The following options are used to configure the normalizer.

| Keyname                               | Mandatory | Type    | Default  | Description                                                         |
|---------------------------------------|-----------|---------|----------|---------------------------------------------------------------------|
| automatic_default_alternatives        | false     | Boolean | false    | Enable if default alternatives should be automatically selected.    |
| fallback_property_default_alternative | false     | Boolean | true     | Enable if fallback properties should use default alternative flags. |


### Constraints Options

_This is an experimental feature._

The following options are used to configure constraints.

| Keyname                                | Mandatory | Type     | Default | Description                                                      |
|----------------------------------------|-----------|----------|---------|------------------------------------------------------------------|
| constraints                            | false     | Boolean  | false   | Enable all constraints.                                          |
| relation_source_constraint             | false     | Boolean  | false   | Enable the constraint regarding present relation sources.        |
| relation_target_constraint             | false     | Boolean  | false   | Enable the constraint regarding present relation targets.        |
| relation_enhanced_implication_mode     | false     | Boolean  | true    | Enable enhanced implied relations.                               |
| artifact_container_constraint          | false     | Boolean  | false   | Enable the constraint regarding present container of artifacts.  |
| property_container_constraint          | false     | Boolean  | false   | Enable the constraint regarding present container of properties. |
| type_container_constraint              | false     | Boolean  | false   | Enable the constraint regarding present containers of types.     |
| required_hosting_constraint               | false     | Boolean  | false   | Enable the constraint regarding present hosting stack.           |
| single_hosting_constraint | false     | Boolean  | false   | Enable the constraint regarding present single hosting.          |
| required_technology_constraint         | false     | Boolean  | false   | Enable the constraint regarding technologies.                    |
| unique_property_constraint             | false     | Boolean  | false   | Enable the constraint regarding unique property names.           |
| unique_artifact_constraint             | false     | Boolean  | false   | Enable the constraint regarding unique artifact names.           |
| unique_input_constraint                | false     | Boolean  | false   | Enable the constraint regarding unique deployment input names.   |
| unique_output_constraint               | false     | Boolean  | false   | Enable the constraint regarding unique deployment output names.  |
| unique_relation_constraint             | false     | Boolean  | false   | Enable the constraint regarding unique relation names.           |
| unique_scenario_constraint           | false     | Boolean  | false   | Enable the constraint regarding unique scenarios.          |
| required_artifact_constraint           | false     | Boolean  | false   | Enable the constraint regarding required artifact.               |
| required_incoming_relation_constraint  | false     | Boolean  | false   | Enable the constraint regarding required incoming relation.      |

### Pruning Modes

There are several predefined pruning modes which provide different useful combinations of default conditions and the pruning of elements that can be directly used.

- `manual`: no default or pruning conditions are enabled at all
- `consistent-strict`: all default consistency conditions are enabled
- `consitent-loose`: consistency pruning is enabled
- `default`: all default conditions are enabled (consistency and semantic)
- `semantic-strict`: consistency pruning is enabled and semantic defaults
- `semantic-loose`: pruning is enabled everywhere (consistency and semantic)

Note, pruning modes do not consider input and output pruning in `tosca_variability_1_0_rc_2` but in `tosca_variability_1_0_rc_3`.

### RC v2

`tosca_variability_1_0_rc_2` has the following default values.

```yaml linenums="1"
mode: semantic-loose
node_default_condition_mode: incomingnaive-artifact-host
optimization_topology: min
optimization_topology_unique: true
optimization_technologies: max
optimization_technologies_mode: weight-count
required_technology_constraint: true
required_hosting_constraint: true
single_hosting_constraint: true
relation_default_implied: true
unconsumed_input_check: false
unproduced_output_check: false
enrich_technologies: true
enrich_technologies_best_only: true
enrich_implementations: true
```

### RC v3

`tosca_variability_1_0_rc_3` has the following default values.
Also, pruning modes consider input and output pruning.

```yaml linenums="1"
mode: semantic-loose
node_default_condition_mode: incomingnaive-artifact-host
optimization_topology: min
optimization_topology_unique: true
optimization_technologies: max
optimization_technologies_mode: weight-count
optimization_technologies_unique: false
required_technology_constraint: true
required_hosting_constraint: true
single_hosting_constraint: true
unique_property_constraint: true
unique_artifact_constraint: true
unique_input_constraint: true
unique_output_constraint: true
unique_relation_constraint: true
unique_technology_constraint: true
relation_default_implied: true
checks: false
enrich_technologies: true
enrich_technologies_best_only: true
enrich_implementations: true

relation_default_condition_mode: source-target-default
artifact_default_condition_mode: container-managed-default
output_default_condition_mode: produced-default
property_default_condition_mode: container-consuming-default
technology_default_condition_mode: container-other-scenario-default

fallback_property_default_alternative: false
```


## Default Conditions

There are element-generic default conditions and type-specific default conditions.
Element-generic default conditions are generic default conditions defined per element.
However, type-specific default conditions are defined per type, e.g., node type, and, thus, override element-generic default conditions.

### Element-Generic Default Conditions

The following element-generic default conditions can be assigned to elements.

| Element                                 | Consistency | Semantic | Default Conditions                                                                 |
|-----------------------------------------|-------------|----------|------------------------------------------------------------------------------------|
| Node with Incoming Relations (incoming) | false       | true     | Check if any incoming relation is present.                                         |
| Node with Artifacts (artifact)          | false       | true     | Check if any artifact is present.                                                  |
| Property (container)                    | true        | false    | Check if the container, e.g., node template or policy, of the property is present. |
| Input                                   | false       | true     | Check if the input is consumed.                                                    |
| Output                                  | true        | false    | Check if the output is produced.                                                   |
| Relation                                | true        | false    | Check if the source and target of the relation is present.                         |
| Policy                                  | false       | true     | Check if the policy has any targets which are present.                             |
| Group                                   | false       | true     | Check if the group has any members which are present.                              |
| Artifact (container)                    | true        | false    | Check if the node template of the artifact is present.                             |
| Technology (container)                  | true        | false    | Check if the node template of the technology is present.                           |
| Technology (other)                      | true        | false    | Check if no other technology of the node template is present.                      |
| Technology (scenario)                   | true        | false    | Check if the deployment scenario is present.                                       |
| Root                                    | true        | true     | The default condition of element always holds.                                     |

Thereby, we define a consistency condition a condition which targets the consistency of the metamodel, thus, ensuring that the metamodel can be correctly parsed, e.g., a property must have a container.
In contrast, a semantic condition targets semantic aspect of elements or the type system, e.g., a node without incoming relations is not used and can be removed.

Depending on the context, other default conditions are more applicable.
The following default conditions can be chosen instead of the ones introduced above.

| Element                                      | Consistency | Semantic | Default Conditions                                                             |
|----------------------------------------------|-------------|----------|--------------------------------------------------------------------------------|
| Node with Incoming Relations (incomingnaive) | false       | true     | Check if any incoming relation is present using `has_incoming_relation_naive`. |
| Node with Incoming Relations (source)        | false       | true     | Check if any source of any incoming relation is present.                       |
| Node with Outgoing Relations (outgoing)      | false       | true     | Check if any outgoing relation is present.                                     |
| Node with Outgoing Relations (outgoingnaive) | false       | true     | Check if any outgoing relation is present using `has_outgoing_relation_naive`. |
| Node with Host (host)                        | false       | true     | Check if any host is present.                                                  |
| Node with Artifact (artifactnaive)           | false       | true     | Check if any artifact is present using `has_artifact_naive`.                   |
| Relation (source)                            | true        | false    | Check if the source of the relation is present.                                |
| Relation (target)                            | true        | false    | Check if the target of the relation is present.                                |
| Artifact (managed)                           | false       | true     | Check if the artifact is managed by any technology.                            |
| Property (consuming)                         | true        | false    | Check if the consumed property or input is present.                            |
| Element (default)                            | true        | false    | Check if no other elements in scope is present.                                |


### Type-Specific Default Conditions

_Conditional types conflict with this feature!_

Type-specific default conditions can be defined to override element-generic default conditions for specific type.
A type-specific default condition is defined as follows and is supported for nodes, relations, properties, artifact, groups, and policies.

| Keyname           | Mandatory | Type                                                   | Default                                                                                                  | Description                                             |
|-------------------|-----------|--------------------------------------------------------|----------------------------------------------------------------------------------------------------------|---------------------------------------------------------|
| conditions        | true      | VariabilityCondition &#124; List(VariabilityCondition) | A variability condition. If a list is given, then the conditions are combined using the _and_ operation. |
| consistency       | false     | Boolean                                                | false                                                                                                    | Configures the condition to be a consistency condition. |
| semantic          | false     | Boolean                                                | true                                                                                                     | Configures the condition to be a semantic condition.    |

For example, the node type `scenario.monitor` defines a type-specific semantic default condition checking for the presence of its host.

```yaml linenums="1"
type_specific_conditions:
    node_types:
        scenario.monitor:
            conditions: {host_presence: SELF}
            semantic: true
```

## Technology Rules

_Conditional types conflict with this feature!_

Technology rules can be defined to automatically select a deployment technology for a component.
A technology rule is defined as follows.

| Keyname    | Mandatory | Type                                                   | Description                                                                                                     |
|------------|-----------|--------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| technology | true      | String                                                 | The name of the deployment technology.                                                                          |
| component  | true      | String                                                 | The type of the component to which the technology can be assigned.                                              |
| hosting    | false     | List(String)                                           | The type of the host of the component which the technology requires. If list, then refers to the hosting stack. |
| conditions | false     | VariabilityCondition &#124; List(VariabilityCondition) | The conditions under which a technology can be assigned to a component.                                         |
| weight     | false     | Number                                                 | The weight which is minimized (default is 1).                                                                   |
| assign     | false     | String                                                 | Configure the node type that is assigned (default: `${current_type}.${technology_name}.${host_type_prefix}`).   |                                                                                                                                             |                                                                                                                                                                               |

For example, the node type `application` can be deployed using the deployment technology `terraform` if the host is of type `terraform_host`.

```yaml linenums="1"
qualities:
    terraform:
        - component: application
          hosting: terraform_host
```


## Variability Preset

A variability preset predefines values for variability inputs that might be used when resolving variability.

| Keyname     | Mandatory | Type                                  | Description                                         |
|-------------|-----------|---------------------------------------|-----------------------------------------------------|
| name        | false     | String                                | An optional name of the variability preset.         |
| description | false     | String                                | An optional description for the variability preset. |
| inputs      | true      | Map(String, InputParameterAssignment) | A required map of input parameter assignments.      |

For example, the following variability preset `dev` set the values of the two variability inputs `mode` and `another_input` but not of `another_another_input`.

```yaml linenums="1"
variability:
    inputs:
        mode:
            type: string
            
        another_input: 
           type: string
           
        another_another_input:
            type: string

    presets:
        dev:
            name: Development
            description: Deploy the application on a private cloud
            inputs:
                mode: dev
                another_input: another_value
```


## Variability Expression

A variability expression is an expression which consists of operators and functions which are listed below.
For example, the following expression returns the total amount of costs.
This result might be used inside a variability condition to ensure that the deployment costs are within a specific
budget.

```yaml linenums="1"
topology_template:
   variability: 
       expressions:
           my_expression: {add: [{variability_input: costs_offering_a}, {variability_input: costs_offering_b}]}
```

There are different kinds of variability expressions, as displayed in Figure 1.
Value expressions return any kind of value and logic expressions return Booleans.

<figure markdown>
   ![Variability Expressions](variability-expressions.svg)
   <figcaption>Figure 1: Different variability expressions types</figcaption>
</figure>


## Variability Condition

A variability condition is a logic expression targeting the presence of an element, as displayed in Figure 1.
Allowed operators and functions are listed below.
For example, the following variability condition `is_prod` evaluates to true if the variability input `mode` equals `prod`.

```yaml linenums="1"
topology_template: 
    variability:
        inputs: 
            mode: 
                type: string
                
        expressions:
            is_prod: {equal: [{variability_input: mode}, prod]}

    node_template:
        my_prod_node:
            type: my.prod.node
            conditions: {logic_expression: is_prod}
```

## Node Template

A node template is a conditional element, thus, variability conditions and other options can be assigned.
These conditions must hold otherwise the respective node template is not present.
A node template can also hold conditional types, artifact, and properties.

| Keyname                       | Mandatory | Type                                                                                 | Description                                                                                                                                                                              |
|-------------------------------|-----------|--------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type                          | true      | String &#124; List(Map(String, TypeAssignment))                                      | The type or a list of conditional type assignments.                                                                                                                                      |
| conditions                    | false     | VariabilityCondition &#124; List(VariabilityCondition)                               | An optional variability condition. If a list is given, then the conditions are combined using the _and_ operation.                                                                       |
| artifacts                     | false     | Map(String, ArtifactTemplate) &#124; List(Map(String, ArtifactTemplate){single})     | An optional map of artifact or a list of artifact maps. If a list is given, then each artifact map must contain only one artifact.                                                       | 
| properties                    | false     | Map(String, PropertyAssignment) &#124; List(Map(String, PropertyAssignment){single}) | An optional map of property assignments or a list of property assignments maps. If a list is given, then each property assignment map must contain only one property.                    | 
| default_condition             | false     | Boolean                                                                              | Enable the default condition for this element. This overrides the variability options of the variable topology template.                                                                 |
| default_consistency_condition | false     | Boolean                                                                              | Enable the default consistency condition for this element. Default condition must be enabled for this element. This overrides the variability options of the variable topology template. |
| default_semantic_condition    | false     | Boolean                                                                              | Enable the default semantic condition for this element. Default condition must be enabled for this element. This overrides the variability options of the variable topology template.    |
| default_condition_mode        | false     | source &#124; relation &#124; host &#124; source-host &#124; relation-host           | Configure the default condition for this element.                                                                                                                                        |
| anchor                    | false     | Boolean                                                                              | Configure if node is anchor, e.g., always consumed by an end user from the browser. This will prevent unexpected pruning by setting the pruning option to false.                     |
| pruning                       | false     | Boolean                                                                              | Enable the pruning for this element. This overrides the variability options of the variable topology template.                                                                           |
| consistency_pruning           | false     | Boolean                                                                              | Enable the consistency pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.                     |
| semantic_pruning              | false     | Boolean                                                                              | Enable the semantic pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.                        |
| weight                        | false     | Boolean &#124; Non-Negative Number                                                   | Configure the weight of this element used during optimization (default is 1).                                                                                                            |
| implies                       | false     | List(Tuple(Target: VariabilityCondition, Condition?: VariabilityCondition))          | An optional list of implications following the pattern `element implies target` or `(element and condition) implies target`.                                                             |
| technology                    | false     | String &#124; List(Map(String, TechnologyTemplate){single})                          | An optional conditional assignment of deployment technologies.                                                                                                                           |
| managed                       | false     | Boolean                                                                              | Enable if node is managed (default is true).                                                                                                                                             |
| implied                       | false     | Boolean                                                                              | Enables that the manual conditions are used to imply the element.                                                                                                                        |


For example, the following node template has a variability condition assigned.

```yaml linenums="1"
prod_database:
    type: my.prod.db
    conditions: {logic_expression: is_prod}
```

## Technology Template 

A technology template is a conditional elements, thus, variability conditions and other options can be assigned. 
These conditions must hold otherwise the respective technology template is not present. 

| Keyname                       | Mandatory | Type                                                   | Description                                                                                                                                                                              |
|-------------------------------|-----------|--------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| conditions                    | false     | VariabilityCondition &#124; List(VariabilityCondition) | An optional variability condition. If a list is given, then the conditions are combined using the _and_ operation.                                                                       |
| default_alternative           | false     | Boolean                                                | Declare the technology as default. This overwrites assigned conditions. There must be only one default assignment.                                                                       |                                                                                                       |
| default_condition             | false     | Boolean                                                | Enable the default condition for this element. This overrides the variability options of the variable topology template.                                                                 |
| default_condition_mode        | false     | container &#124; other &#124; container-other          | Configure the default condition for this element.                                                                                                                                        |
| default_consistency_condition | false     | Boolean                                                | Enable the default consistency condition for this element. Default condition must be enabled for this element. This overrides the variability options of the variable topology template. |
| default_semantic_condition    | false     | Boolean                                                | Enable the default semantic condition for this element. Default condition must be enabled for this element. This overrides the variability options of the variable topology template.    |
| pruning                       | false     | Boolean                                                | Enable the pruning for this element. This overrides the variability options of the variable topology template.                                                                           |
| consistency_pruning           | false     | Boolean                                                | Enable the consistency pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.                     |
| semantic_pruning              | false     | Boolean                                                | Enable the semantic pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.                        |
| weight                        | false     | Boolean &#124; Non-Negative Number                     | Configure the weight of this element used during optimization (default is 1).                                                                                                            |
| assign                        | false     | String                                                 | Configure the node type that is assigned (default: `${current_type}.${technology_name}.${host_type_prefix}`).                                                                            |                                                                                                                                             |                                                                                                                                                                               |


## Type Assignment

A type is a conditional element, thus, variability conditions and further options can be assigned to a type assignment.
These conditions must hold otherwise the respective relationship is not present.

| Keyname                       | Mandatory | Type                                                                        | Description                                                                                                                                                                              |
|-------------------------------|-----------|-----------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| conditions                    | false     | VariabilityCondition &#124; List(VariabilityCondition)                      | An optional variability condition. If a list is given, then the conditions are combined using the _and_ operation.                                                                       |
| default_alternative           | false     | Boolean                                                                     | Declare the type as default. This overwrites assigned conditions. There must be only one default assignment.                                                                             |                                                                                                       |
| default_condition             | false     | Boolean                                                                     | Enable the default condition for this element. This overrides the variability options of the variable topology template.                                                                 |
| default_consistency_condition | false     | Boolean                                                                     | Enable the default consistency condition for this element. Default condition must be enabled for this element. This overrides the variability options of the variable topology template. |
| default_semantic_condition    | false     | Boolean                                                                     | Enable the default semantic condition for this element. Default condition must be enabled for this element. This overrides the variability options of the variable topology template.    |
| pruning                       | false     | Boolean                                                                     | Enable the pruning for this element. This overrides the variability options of the variable topology template.                                                                           |
| consistency_pruning           | false     | Boolean                                                                     | Enable the consistency pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.                     |
| semantic_pruning              | false     | Boolean                                                                     | Enable the semantic pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.                        |
| implies                       | false     | List(Tuple(Target: VariabilityCondition, Condition?: VariabilityCondition)) | An optional list of implications following the pattern `element implies target` or `(element and condition) implies target`.                                                             |

For example, the following node template `database` has a conditional type switching between a development and production database.

```yaml linenums="1"
database:
    type:
       - my.dev.db:
            conditions: <VariabilityCondition>
       - my.prod.db:
            conditions: <VariabilityCondition>
```

## Requirement Assignment

A requirement assignment is a conditional element, thus, variability conditions and other options can be assigned. 
These conditions must hold otherwise the respective relationship is not present.

| Keyname                       | Mandatory | Type                                                                        | Description                                                                                                                                                                                                      |
|-------------------------------|-----------|-----------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| conditions                    | false     | VariabilityCondition &#124; List(VariabilityCondition)                      | An optional variability condition. If a list is given, then the conditions are combined using the _and_ operation.                                                                                               |
| default_alternative           | false     | Boolean                                                                     | Declare the requirement assignment as default. This overwrites assigned conditions. There must be only one default assignment.                                                                                   |                                                                                                       |
| default_condition             | false     | Boolean                                                                     | Enable the default condition for this element. This overrides the variability options of the variable topology template.                                                                                         |
| default_consistency_condition | false     | Boolean                                                                     | Enable the default consistency condition for this element. Default condition must be enabled for this element. This overrides the variability options of the variable topology template.                         |
| default_semantic_condition    | false     | Boolean                                                                     | Enable the default semantic condition for this element. Default condition must be enabled for this element. This overrides the variability options of the variable topology template.                            |
| default_condition_mode        | false     | source-target &#124; source &#124; target                                   | Configure the default condition for this element.                                                                                                                                                                |
| pruning                       | false     | Boolean                                                                     | Enable the pruning for this element. This overrides the variability options of the variable topology template.                                                                                                   |
| consistency_pruning           | false     | Boolean                                                                     | Enable the consistency pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.                                             |
| semantic_pruning              | false     | Boolean                                                                     | Enable the semantic pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.                                                |
| implies                       | false     | List(Tuple(Target: VariabilityCondition, Condition?: VariabilityCondition)) | An optional list of implications following the pattern `element implies target` or `(element and condition) implies target`.                                                                                     |
| implied                       | false     | Boolean &#124; SOURCE &#124; TARGET &#124; CONTAINER                        | Enables that the manual conditions are used to imply the element when the source/ target (depending on the configuration) is present. This overrides the variability options of the variable topology template.  |                                                                                    |

For example, the following requirement assignment `host` has a variability condition assigned.

```yaml linenums="1"
requirements:
    - host:
          node: dev_runtime
          conditions: {logic_expression: is_dev}
```

## Relationship Templates 

A relationship template can contain conditional properties.
Note, the presence of a relationship template is bound to the presence of the requirement assignment in which it is used.
A relationship template can also hold conditional properties.

| Keyname         | Mandatory | Type                                                                                 | Description                                                                                                                                                           |
|-----------------|-----------|--------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type            | true      | String &#124; List(Map(String, TypeAssignment))                                      | The type or a list of conditional type assignments.                                                                                                                   |
| properties      | false     | Map(String, PropertyAssignment) &#124; List(Map(String, PropertyAssignment){single}) | An optional map of property assignments or a list of property assignments maps. If a list is given, then each property assignment map must contain only one property. |

For example, the following relationship templates contains conditional properties.

```yaml linenums="1"
relationship_templates:
    my_relationship:
        type: my.relationship
        properties:
            -   property_one:
                    value: value_one
                    conditions: <VariabilityCondition>
            -   property_two:
                    value: value_two
                    conditions: <VariabilityCondition>
```

## Property Assignment

A property is a conditional element, thus, variability conditions and other options can be assigned.
These conditions must hold otherwise the respective relationship is not present.
However, this only applies if the property assignment is wrapped as the following object and if it is used in a list.

| Keyname                       | Mandatory | Type                                                                        | Description                                                                                                                                                                                |
|-------------------------------|-----------|-----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| value                         | false     | (Original) PropertyAssignment                                               | The value of the property.                                                                                                                                                                 |
| expression                    | false     | ValueExpression                                                             | A value expressions which is evaluated and used as value.                                                                                                                                  |
| conditions                    | false     | VariabilityCondition &#124; List(VariabilityCondition)                      | An optional variability condition. If a list is given, then the conditions are combined using the _and_ operation.                                                                         |
| default_alternative           | false     | Boolean                                                                     | Declare the value as default. This overwrites assigned conditions. There must be only one default assignment.                                                                              |                                                                                                       |
| default_condition             | false     | Boolean                                                                     | Enable the default condition for this element. This overrides the variability options of the variable topology template.                                                                   |
| default_condition_mode        | false     | container &#124; consuming &#124; container-consuming                       | Configure the default condition for this element.                                                                                                                                          |
| default_consistency_condition | false     | Boolean                                                                     | Enable the default consistency condition for this element. Default condition must be enabled for this element. This overrides the variability options of the variable topology template.   |
| default_semantic_condition    | false     | Boolean                                                                     | Enable the default semantic condition for this element. Default condition must be enabled for this element. This overrides the variability options of the variable topology template.      |
| pruning                       | false     | Boolean                                                                     | Enable the pruning for this element. This overrides the variability options of the variable topology template.                                                                             |
| consistency_pruning           | false     | Boolean                                                                     | Enable the consistency pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.                       |
| semantic_pruning              | false     | Boolean                                                                     | Enable the semantic pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.                          |
| implies                       | false     | List(Tuple(Target: VariabilityCondition, Condition?: VariabilityCondition)) | An optional list of implications following the pattern `element implies target` or `(element and condition) implies target`.                                                               |

These keywords are used to detect if a property assignment is wrapped. 
Thus, if any of these keywords must be used as value for property, then this property must be wrapped.
For example, the property `key_one` has the value `{value: the_value}` and, thus, must be wrapped.

```yaml linenums="1"
properties:
- key_one:
      value: {value: the_value}

- conditional_property:
      value: conditional_value
      conditions: <VariabilityCondition>
```

## Group Template

A group is conditional element, thus, variability conditions and other options can be assigned.
Depending on the group type the conditions are either assigned to the group itself or to the group members.
A group can also hold conditional types and properties.

In general, the conditions are assigned to the group itself.
These conditions must hold otherwise the respective group is not present.
We refer to such a group also as conditional group.

However, if the group is derived from `variability.groups.ConditionalMembers` then the conditions are assigned to the
group members.
These conditions must hold otherwise the respective group members are not present in the variability-resolved service template.
Furthermore, group elements can be node templates and requirement assignments.
We refer to such a group also as variability group.
A variability group is always absent and, thus, always removed when resolving variability.

| Keyname             | Mandatory | Type                                                                                 | Description                                                                                                                                                           |
|---------------------|-----------|--------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type                | true      | String &#124; List(Map(String, TypeAssignment))                                      | The type or a list of conditional type assignments.                                                                                                                   |
| members             | false     | List(String &#124; Tuple(String, String) &#124; Tuple(String, Number))               | An optional list of node templates names or requirement assignment names/ index of a node template.                                                                   |
| conditions          | false     | VariabilityCondition &#124; List(VariabilityCondition)                               | An optional variability condition. If a list is given, then the conditions are combined using the _and_ operation.                                                    |
| properties          | false     | Map(String, PropertyAssignment) &#124; List(Map(String, PropertyAssignment){single}) | An optional map of property assignments or a list of property assignments maps. If a list is given, then each property assignment map must contain only one property. |
| pruning             | false     | Boolean                                                                              | Enable the pruning for this element. This overrides the variability options of the variable topology template.                                                        |
| consistency_pruning | false     | Boolean                                                                              | Enable the consistency pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.  |
| semantic_pruning    | false     | Boolean                                                                              | Enable the semantic pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.     |
| implies             | false     | List(Tuple(Target: VariabilityCondition, Condition?: VariabilityCondition))          | An optional list of implications following the pattern `element implies target` or `(element and condition) implies target`.                                          |

For example, the following group `example_group` is a conditional group which is only present if assigned conditions hold.

```yaml linenums="1"
conditional_group:
    type: tosca.groups.Root
    members: [prod_database, [application, prod_connects_to]]
    conditions: {logic_expression: is_prod}
```

However, the following group `example_group` assigns its assigned conditions to its members, i.e., the node template `prod_database` and the requirement assignment `prod_connects_to` of the node template `application`.
In contrast to the previous example this group is not derived from `variability.groups.ConditionalMembers`.
Thus, the presence of the node template `prod_database` depends on condition `is_prod`.

```yaml linenums="1"
variability_group:
    type: variability.groups.ConditionalMembers
    members: [prod_database, [application, prod_connects_to]]
    conditions: {logic_expression: is_prod}
```

## Policy Template

A policy template is a conditional element, thus, variability conditions and other options can be assigned.
These conditions must hold otherwise the respective policy is not present.
A policy can also hold conditional types and properties.

| Keyname                       | Mandatory | Type                                                                                 | Description                                                                                                                                                                              |
|-------------------------------|-----------|--------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type                          | true      | String &#124; List(Map(String, TypeAssignment))                                      | The type or a list of conditional type assignments.                                                                                                                                      |
| conditions                    | false     | VariabilityCondition &#124; List(VariabilityCondition)                               | An optional variability condition. If a list is given, then the conditions are combined using the _and_ operation.                                                                       |
| properties                    | false     | Map(String, PropertyAssignment) &#124; List(Map(String, PropertyAssignment){single}) | An optional map of property assignments or a list of property assignments maps. If a list is given, then each property assignment map must contain only one property.                    |
| default_condition             | false     | Boolean                                                                              | Enable the default condition for this element. This overrides the variability options of the variable topology template.                                                                 |
| default_consistency_condition | false     | Boolean                                                                              | Enable the default consistency condition for this element. Default condition must be enabled for this element. This overrides the variability options of the variable topology template. |
| default_semantic_condition    | false     | Boolean                                                                              | Enable the default semantic condition for this element. Default condition must be enabled for this element. This overrides the variability options of the variable topology template.    |
| pruning                       | false     | Boolean                                                                              | Enable the pruning for this element. This overrides the variability options of the variable topology template.                                                                           |
| consistency_pruning           | false     | Boolean                                                                              | Enable the consistency pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.                     |
| semantic_pruning              | false     | Boolean                                                                              | Enable the semantic pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.                        |
| implies                       | false     | List(Tuple(Target: VariabilityCondition, Condition?: VariabilityCondition))          | An optional list of implications following the pattern `element implies target` or `(element and condition) implies target`.                                                             |

For example, the following policy template `anticollocation` has the variability condition `is_prod` assigned.
Depending on the presence of this policy, the node templates `wordpress` and `mysql` _must not_ be hosted on the same server, e.g., during production.
For more information about this example, take a look in the [TOSCA Simple Profile in YAML Version 1.3](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#_Toc16506587){target=_blank}.

```yaml linenums="1"
node_templates:
    wordpress:
        type: tosca.nodes.WebServer
        requirements:
            - host:
                  node_filter:
                      capabilities:
                          - os:
                                properties:
                                    - architecture: x86_64
                                    - type: linux

    mysql:
        type: tosca.nodes.DBMS.MySQL
        requirements:
            - host:
                  node: tosca.nodes.Compute
                  node_filter:
                      capabilities:
                          - os:
                                properties:
                                    - architecture: x86_64
                                    - type: linux

policies:
    - anticollocation:
          type: tosca.policies.AntiCollocation
          targets: [wordpress_server, mysql]
          conditions: {logic_expression: is_prod}
```


## Artifact Template

A (deployment) artifact is a conditional element, thus, variability conditions and other options can be assigned.
These conditions must hold otherwise the respective artifact is not present.
An artifact can also hold conditional properties.

| Keyname                       | Mandatory | Type                                                                                 | Description                                                                                                                                                                              |
|-------------------------------|-----------|--------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type                          | true      | String &#124; List(Map(String, TypeAssignment))                                      | The type or a list of conditional type assignments.                                                                                                                                      |
| conditions                    | false     | VariabilityCondition &#124; List(VariabilityCondition)                               | An optional variability condition. If a list is given, then the conditions are combined using the _and_ operation.                                                                       |
| default_alternative           | false     | Boolean                                                                              | Declare the artifact as default. This overwrites assigned conditions. There must be only one default artifact.                                                                           |                                                                                                       |
| properties                    | false     | Map(String, PropertyAssignment) &#124; List(Map(String, PropertyAssignment){single}) | An optional map of property assignments or a list of property assignments maps. If a list is given, then each property assignment map must contain only one property.                    |
| default_condition             | false     | Boolean                                                                              | Enable the default condition for this element. This overrides the variability options of the variable topology template.                                                                 |
| default_condition_mode        | false     | List(container &#124; technology, -)                                                 | Configure the default condition for this element.                                                                                                                                        |
| default_consistency_condition | false     | Boolean                                                                              | Enable the default consistency condition for this element. Default condition must be enabled for this element. This overrides the variability options of the variable topology template. |
| default_semantic_condition    | false     | Boolean                                                                              | Enable the default semantic condition for this element. Default condition must be enabled for this element. This overrides the variability options of the variable topology template.    |
| pruning                       | false     | Boolean                                                                              | Enable the pruning for this element. This overrides the variability options of the variable topology template.                                                                           |
| consistency_pruning           | false     | Boolean                                                                              | Enable the consistency pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.                     |
| semantic_pruning              | false     | Boolean                                                                              | Enable the semantic pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.                        |
| implies                       | false     | List(Tuple(Target: VariabilityCondition, Condition?: VariabilityCondition))          | An optional list of implications following the pattern `element implies target` or `(element and condition) implies target`.                                                             |

For example, the following node template `my_node` has two artifacts `artifact_a` and `artifact_b` assigned which are both conditional.

```yaml linenums="1"
my_node:
    type: my.node
    artifacts:
        - artifact_a:
              conditions: <VariabilityCondition>
        - artifact_b:
              conditions: <VariabilityCondition>
```

## Topology Template Input

A topology template input is a conditional element, thus, variability conditions and other options can be assigned.
These conditions must hold otherwise the respective input is not present.

| Keyname                       | Mandatory | Type                                                                        | Description                                                                                                                                                                               |
|-------------------------------|-----------|-----------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| conditions                    | false     | VariabilityCondition &#124; List(VariabilityCondition)                      | An optional variability condition. If a list is given, then the conditions are combined using the _and_ operation.                                                                        |
| implies                       | false     | List(Tuple(Target: VariabilityCondition, Condition?: VariabilityCondition)) | An optional list of implications following the pattern `element implies target` or `(element and condition) implies target`.                                                              |
| default_alternative           | false     | Boolean                                                                     | Declare the input as default. This overwrites assigned conditions. There must be only one default assignment.                                                                             |                                                                                                       |
| default_condition             | false     | Boolean                                                                     | Enable the default condition for this element. This overrides the variability options of the variable topology template.                                                                  |
| default_consistency_condition | false     | Boolean                                                                     | Enable the default consistency condition for this element. Default condition must be enabled for this element. This overrides the variability options of the variable topology template.  |
| default_semantic_condition    | false     | Boolean                                                                     | Enable the default semantic condition for this element. Default condition must be enabled for this element. This overrides the variability options of the variable topology template.     |
| default_condition_mode        | false     | source &#124; relation &#124; host &#124; source-host &#124; relation-host  | Configure the default condition for this element.                                                                                                                                         |
| pruning                       | false     | Boolean                                                                     | Enable the pruning for this element. This overrides the variability options of the variable topology template.                                                                            |
| consistency_pruning           | false     | Boolean                                                                     | Enable the consistency pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.                      |
| semantic_pruning              | false     | Boolean                                                                     | Enable the semantic pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.                         |


For example, the topology template input has a variability condition assigned.

```yaml linenums="1"
inputs:
   ssh_key_file:
       type: string
       conditions: <VariabilityCondition>
```

## Topology Template Output

A topology template output is a conditional element, thus, variability conditions and other options can be assigned.
These conditions must hold otherwise the respective output is not present.

| Keyname                         | Mandatory | Type                                                                        | Description                                                                                                                                                                                 |
|---------------------------------|-----------|-----------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| conditions                      | false     | VariabilityCondition &#124; List(VariabilityCondition)                      | An optional variability condition. If a list is given, then the conditions are combined using the _and_ operation.                                                                          |
| implies                         | false     | List(Tuple(Target: VariabilityCondition, Condition?: VariabilityCondition)) | An optional list of implications following the pattern `element implies target` or `(element and condition) implies target`.                                                                |
| default_alternative             | false     | Boolean                                                                     | Declare the output as default. This overwrites assigned conditions. There must be only one default assignment.                                                                              |                                                                                                       |
| default_condition               | false     | Boolean                                                                     | Enable the default condition for this element. This overrides the variability options of the variable topology template.                                                                    |
| default_consistency_condition   | false     | Boolean                                                                     | Enable the default consistency condition for this element. Default condition must be enabled for this element. This overrides the variability options of the variable topology template.    |
| default_semantic_condition      | false     | Boolean                                                                     | Enable the default semantic condition for this element. Default condition must be enabled for this element. This overrides the variability options of the variable topology template.       |
| default_condition_mode          | false     | source &#124; relation &#124; host &#124; source-host &#124; relation-host  | Configure the default condition for this element.                                                                                                                                           |
| pruning                         | false     | Boolean                                                                     | Enable the pruning for this element. This overrides the variability options of the variable topology template.                                                                              |
| consistency_pruning             | false     | Boolean                                                                     | Enable the consistency pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.                        |
| semantic_pruning                | false     | Boolean                                                                     | Enable the semantic pruning for this element. Pruning must be enabled for this element. This overrides the variability options of the variable topology template.                           |

For example, the topology template output has a variability condition assigned.

```yaml linenums="1"
outputs:
   vm_address:
       type: string
       conditions: <VariabilityCondition>
```


## Import Definition

An import definition is a conditional element, thus, variability conditions and other options can be assigned.
These conditions must hold otherwise the respective import is not present.

| Keyname    | Mandatory | Type                                                                        | Description                                                                                                                  |
|------------|-----------|-----------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| conditions | false     | VariabilityCondition &#124; List(VariabilityCondition)                      | An optional variability condition. If a list is given, then the conditions are combined using the _and_ operation.           |
| implies    | false     | List(Tuple(Target: VariabilityCondition, Condition?: VariabilityCondition)) | An optional list of implications following the pattern `element implies target` or `(element and condition) implies target`. |

For example, the following import has a variability condition assigned.

```yaml linenums="1"
import:
   - file: some_file
     conditions: <VariabilityCondition>
```

## Normative Group Types

There are two normative group types `variability.groups.Root` and `variability.groups.ConditionalMembers`.
The first group type is the root group every other variability-related group, such as `variability.groups.ConditionalMembers` should derive from.

```yaml linenums="1"
variability.groups.Root:
    derived_from: tosca.groups.Root
```

The second group type should be used for variability groups.

```yaml linenums="1"
variability.groups.ConditionalMembers:
    derived_from: variability.groups.Root
    conditions: VariabilityCondition | List(VariabilityCondition)    
```

## Normative Interface Types

The following normative interfaces define a management interface for nodes and relationships.
Currently, no management operations are defined.
The definition is intended to be extended in other specifications, e.g., for building deployment artifacts after resolving variability.

### Variability Management Interface for Nodes

The following interface manages the variability-related operations of nodes.

```yaml linenums="1"
tosca.interfaces.node.management.Variability:
    derived_from: tosca.interfaces.Root
```

### Variability Management Interface for Relationships

The following interface manages the variability-related operations of relationships.

```yaml linenums="1"
tosca.interfaces.relationship.management.Variability:
    derived_from: tosca.interfaces.Root
```

## Intrinsic Functions

The following intrinsic functions can be used inside a variability expression.

### Logical Operators

The following logical operators can be used inside a logic expression.

| Keyname | Input                                       | Output  | Description                                        |
|---------|---------------------------------------------|---------|----------------------------------------------------|
| and     | List(BooleanExpression)                     | Boolean | Evaluates if all values are `true`.                |
| or      | List(BooleanExpression)                     | Boolean | Evaluates if at least one value is `true`.         |
| not     | BooleanExpression                           | Boolean | Negates the given value.                           |
| xor     | List(BooleanExpression)                     | Boolean | Evaluates if an odd number of arguments is `true`. |
| exo     | List(BooleanExpression)                     | Boolean | Evaluates if exactly one value is `true`.          |
| implies | Tuple(BooleanExpression, BooleanExpression) | Boolean | Evaluates if first value implies the second value. |
| amo     | List(BooleanExpression)                     | Boolean | Evaluates if at most one value is `true`.          |

### Arithmetic Operators

The following arithmetic operators can be used inside a variability expression.

| Keyname | Input                                       | Output  | Description                               |
|---------|---------------------------------------------|---------|-------------------------------------------|
| add     | List(NumericExpression)                     | Numeric | Sums up given values.                     |
| sub     | List(NumericExpression)                     | Numeric | Subtracts values from the first one.      |
| mul     | List(NumericExpression)                     | Numeric | Multiplies given values.                  |
| div     | List(NumericExpression)                     | Numeric | Divides values from the first one.        |
| mod     | Tuple(NumericExpression, NumericExpression) | Numeric | Divides values and returns the remainder. |

### Presence Operators

The following presence operators can be used inside a logic expression.

| Keyname                     | Input                                                                                                                                        | Output  | Description                                                                                                                                                                      |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| variability_input           | String                                                                                                                                       | Any     | Returns the value of a variability input.                                                                                                                                        |
| logic_expression            | String                                                                                                                                       | Boolean | Returns the value of the Logic Expression.                                                                                                                                       |
| value_expression            | String                                                                                                                                       | Any     | Returns the value of the Value Expression.                                                                                                                                       |
| node_presence               | Node: String &#124; SELF &#124; CONTAINER &#124; SOURCE &#124; TARGET                                                                        | Boolean | Returns if node is present.                                                                                                                                                      |
| host_presence               | Node: String &#124; SELF &#124; CONTAINER &#124; SOURCE &#124; TARGET                                                                        | Boolean | Returns if any host of the node is present. Note, an error will be thrown later when consistency is checked if there are multiple hosting relations present.                     |
| has_source                  | Node: String &#124; SELF &#124; CONTAINER &#124; SOURCE &#124; TARGET                                                                        | Boolean | Returns if any source of any incoming relation of the node template is present.                                                                                                  |
| has_incoming_relation       | Node: String &#124; SELF &#124; CONTAINER &#124; SOURCE &#124; TARGET                                                                        | Boolean | Returns if the node template is target of at least one present incoming relationship.                                                                                            |
| has_incoming_relation_naive | Node: String &#124; SELF &#124; CONTAINER &#124; SOURCE &#124; TARGET                                                                        | Boolean | Returns if the node template is target of at least one present incoming relationship in a naive way that will result in a circle considering the default condition of relations. |
| has_outgoing_relation       | Node: String &#124; SELF &#124; CONTAINER &#124; SOURCE &#124; TARGET                                                                        | Boolean | Returns if the node template is source of at least one present outgoing relationship.                                                                                            |
| has_outgoing_relation_naive | Node: String &#124; SELF &#124; CONTAINER &#124; SOURCE &#124; TARGET                                                                        | Boolean | Returns if the node template is source of at least one present outgoing relationship in a naive way that will result in a circle considering the default condition of relations. |
| has_artifact                | Node: String &#124; SELF &#124; CONTAINER &#124; SOURCE &#124; TARGET                                                                        | Boolean | Returns if any artifact of the node template is present.                                                                                                                         |
| has_artifact_naive          | Node: String &#124; SELF &#124; CONTAINER &#124; SOURCE &#124; TARGET                                                                        | Boolean | Returns if any artifact of the node template is present in a naive way that will result in a circle considering the default condition of artifacts.                              |
| relation_presence           | Tuple(Node: String &#124; SELF &#124; CONTAINER, Relation: String &#124; Number)                                                             | Boolean | Returns if relation is present.                                                                                                                                                  |
| artifact_presence           | Tuple(Node: String &#124; SELF &#124; CONTAINER, Artifact: String &#124; Number)                                                             | Boolean | Returns if artifact is present.                                                                                                                                                  |
| is_managed                  | SELF &#124; Tuple(Node: String &#124; SELF &#124; CONTAINER, Artifact: String &#124; Number)                                                 | Boolean | Returns if artifact is managed by a deployment technology.                                                                                                                       |
| policy_presence             | Policy: String &#124; Number                                                                                                                 | Boolean | Returns if policy is present.                                                                                                                                                    |
| group_presence              | Group: String                                                                                                                                | Boolean | Returns if group is present.                                                                                                                                                     |
| input_presence              | Input: String &#124; Number                                                                                                                  | Boolean | Returns if input is present.                                                                                                                                                     |
| is_consumed                 | Input: String &#124; Number                                                                                                                  | Boolean | Returns if input is consumed by a property.                                                                                                                                      |
| output_presence             | Output: String &#124; Number                                                                                                                 | Boolean | Returns if output is present.                                                                                                                                                    |
| is_produced                 | Output: String &#124; Number                                                                                                                 | Boolean | Returns if output is produced by a property.                                                                                                                                     |
| source_presence             | SELF &#124; CONTAINER                                                                                                                        | Boolean | Returns if source node of relation is present. Can only be used inside a relation. Otherwise use `node_presence`.                                                                |
| target_presence             | SELF &#124; CONTAINER                                                                                                                        | Boolean | Returns if target node of relation is present. Can only be used inside a relation. Otherwise use `node_presence`.                                                                |
| has_present_target          | Policy: String &#124; Number &#124; SELF &#124; CONTAINER                                                                                    | Boolean | Returns if any target of the given policy is present.                                                                                                                            |
| has_present_member          | Group: String &#124; SELF &#124; CONTAINER                                                                                                   | Boolean | Returns if any member of the given group is present.                                                                                                                             |
| node_type_presence          | Tuple(Node: String &#124; SELF &#124; CONTAINER &#124; SOURCE &#124; TARGET, Type: String &#124; Number)                                     | Boolean | Returns if type of node is present.                                                                                                                                              |
| relation_type_presence      | Triple(Node: String &#124; SELF &#124; CONTAINER, Relation: String &#124; Number, Type: String &#124; Number)                                | Boolean | Returns if type of relation is present.                                                                                                                                          |
| group_type_presence         | Tuple(Group: String &#124; SELF &#124; CONTAINER, Type: String &#124; Number)                                                                | Boolean | Returns if type of group is present.                                                                                                                                             |
| policy_type_presence        | Tuple(Group: String &#124; SELF &#124; CONTAINER, Type: String &#124; Number)                                                                | Boolean | Returns if type of policy is present.                                                                                                                                            |
| artifact_type_presence      | Tuple(Node: String &#124; SELF &#124; CONTAINER &#124; SOURCE &#124; TARGET, Type: String &#124; Number)                                     | Boolean | Returns if type of policy is present.                                                                                                                                            |
| node_property_presence      | Tuple(Node: String &#124; SELF &#124; CONTAINER &#124; SOURCE &#124; TARGET, Property: String &#124; Number)                                 | Boolean | Returns if property of node is present.                                                                                                                                          |
| relation_property_presence  | Tuple(Node: String &#124; SELF &#124; CONTAINER, Relation: String &#124; Number, Property: String &#124; Number)                             | Boolean | Returns if property of relation is present.                                                                                                                                      |
| group_property_presence     | Tuple(Group: String &#124; SELF &#124; CONTAINER, Property: String &#124; Number)                                                            | Boolean | Returns if property of group is present.                                                                                                                                         |
| policy_property_presence    | Tuple(Policy: String &#124; Number &#124; SELF &#124; CONTAINER &#124, Property: String &#124; Number)                                       | Boolean | Returns if property of policy is present.                                                                                                                                        |
| artifact_property_presence  | Tuple(Node: String &#124; SELF &#124; CONTAINER &#124; SOURCE &#124; TARGET, Artifact: String &#124; Number, Property: String &#124; Number) | Boolean | Returns if property of artifact is present.                                                                                                                                      |
| container_presence          | SELF &#124; CONTAINER                                                                                                                        | Boolean | Returns if container is present. Can only be used inside a property or artifact.                                                                                                 |
| import_presence             | Import: Number                                                                                                                               | Boolean | Returns if import is present.                                                                                                                                                    |
| technology_presence         | Tuple(Node: String, Technology: String &#124; Number)                                                                                        | Boolean | Returns if technology of node is present.                                                                                                                                        |


### String Operators 

The following string operators can be used inside a variability expression.

| Keyname                | Input                                                                            | Output  | Description                                                                                                                                                  |
|------------------------|----------------------------------------------------------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| concat                 | List(ValueExpression)                                                            | String  | Concatenates the given values.                                                                                                                               |
| join                   | Tuple(List(ValueExpression), String)                                             | String  | Joins the given values using the provided delimiter.                                                                                                         |
| token                  | Tuple(ValueExpression, String, Number)                                           | String  | Splits a given value by the provided delimiter and returns the element specified by the provided index.                                                      |

### Constraint Operators

The following constraint operators can be used inside a variability expression.

| Keyname          | Input                                                                 | Output  | Description                                                           |
|------------------|-----------------------------------------------------------------------|---------|-----------------------------------------------------------------------|
| equal            | List(ValueExpression)                                                 | Boolean | Evaluates if the given values are equal.                              |
| greater          | Tuple(NumericExpression, NumericExpression)                           | Boolean | Evaluates if the first value is greater than the second value.        |
| greater_or_equal | Tuple(NumericExpression, NumericExpression)                           | Boolean | Evaluates if the first value is greater or equal to the second value. |
| less             | Tuple(NumericExpression, NumericExpression)                           | Boolean | Evaluates if the first value is less than the second value.           |
| less_or_equal    | Tuple(NumericExpression, NumericExpression)                           | Boolean | Evaluates if the first value is less or equal to the second value.    |
| in_range         | Tuple(NumericExpression, Tuple(NumericExpression, NumericExpression)) | Boolean | Evaluates if the value is in a given range.                           |
| valid_values     | Tuple(ValueExpression, List(ValueExpression))                         | Boolean | Evaluates if the value is element of the list.                        |
| length           | Tuple(ValueExpression, NumericExpression)                             | Boolean | Evaluates if the value has a given length.                            |
| min_length       | Tuple(ValueExpression, NumericExpression)                             | Boolean | Evaluates if the value has a minimum length.                          |
| max_length       | Tuple(ValueExpression, NumericExpression)                             | Boolean | Evaluates if the value has a maximum length.                          |

### Analytical Operators

The following analytical operators can be used inside a variability expression.

| Keyname                | Input                                             | Output | Description                                          |
|------------------------|---------------------------------------------------|--------|------------------------------------------------------|
| sum                    | List(Number)                                      | Number | Returns the sum of the given values.                 |
| count                  | List(Number)                                      | Number | Returns the count of the given values.               |
| min                    | List(Number)                                      | Number | Returns the min of the given values.                 |
| max                    | List(Number)                                      | Number | Returns the max of the given values.                 |
| mean                   | List(Number)                                      | Number | Returns the mean of the given values.                |
| median                 | List(Number)                                      | Number | Returns the median of the given values.              |
| variance               | List(Number)                                      | Number | Returns the variance of the given values.            |
| standard_deviation     | List(Number)                                      | Number | Returns the standard deviation of the given values.  |
| linear_regression      | List(List(Tuple(Number, Number)), Number)         | Number | Returns the prediction using linear regression.      |
| polynomial_regression  | List(List(Tuple(Number, Number)), Number, Number) | Number | Returns the prediction using polynomial regression.  |
| logarithmic_regression | List(List(Tuple(Number, Number)), Number)         | Number | Returns the prediction using logarithmic regression. |
| exponential_regression | List(List(Tuple(Number, Number)), Number)         | Number | Returns the prediction using exponential regression. |


### Date Operators

The following date operators can be used inside a variability expression.

| Keyname        | Input                                                                          | Output  | Description                                                 |
|----------------|--------------------------------------------------------------------------------|---------|-------------------------------------------------------------|
| weekday        | Empty List                                                                     | String  | Returns the current weekday.                                |
| same           | Tuple(String &#124; Number, String &#124; Number)                              | Boolean | Returns if first date is the same date as the second.       |
| before         | Tuple(String &#124; Number, String &#124; Number)                              | Boolean | Returns if first date is before the second date.            |
| before_or_same | Tuple(String &#124; Number, String &#124; Number)                              | Boolean | Returns if first date is before or same as the second date. |
| after          | Tuple(String &#124; Number, String &#124; Number)                              | Boolean | Returns if first date is after the second date.             |
| after_or_same  | Tuple(String &#124; Number, String &#124; Number)                              | Boolean | Returns if first date is after or same as the second date.  |
| within         | Tuple(String &#124; Number, Tuple(String &#124; Number, String &#124; Number)) | Boolean | Returns if given date is within the given dates.            |

## Plugin Definition 

The following plugins can be defined.

| Keyname                       | Mandatory | Type          | Description                                                                                                                                |
|-------------------------------|-----------|---------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| technology                    | false     | List(String)  | An optional list of technology rule plugins. Strings are treated as relative imports. Plugins are also loaded from "./plugins/technology". |


## Technology Plugin

A technology plugin must export the following interface.

```typescript linenums="1"
export type TechnologyPluginBuilder = {
    build(graph: Graph): TechnologyPlugin
}
```

```typescript linenums="1"
export type TechnologyPlugin = {
    assign: (node: Node) => {[technology: string]: TechnologyTemplate}[]
    implement: (name: string, type: NodeType) => NodeTypeMap
}
```

## Processing

_This section is outdated._

We describe on a high-level the steps to derive a variability-resolved service template from a variable service template.

### Resolve Variability

To resolve the variability in a variable service template, conduct the following steps:

1. Ensure that TOSCA definitions version is `tosca_variability_1_0`.
1. Retrieve variability inputs assignments.
1. Check the presence of all elements.
1. Remove all elements, e.g., node templates or artifacts, which are not present.
1. Remove all group members which are not present from group template.
1. Remove all policy targets which are not present from policy template.
1. Remove all variability groups.
1. Remove all non-standard elements, e.g., variability definition, variability groups, or `conditions` at node templates.
1. Transform all lists introduced in this document, such as property lists, to maps as defined in TOSCA.
1. Set the TOSCA definitions version to `tosca_simple_yaml_1_3`.


### Retrieve Variability Inputs Assignments

Variability inputs can be assigned either directly or indirectly using (possibly multiple) variability presets.
Therefore, conduct the following steps: 

1. Merge all variability presets following the order in which they have been collected. 
1. Merge directly assigned variability inputs.

Thereby, inputs which are merged at a later step, override existing inputs.
Thus, directly assigned variability inputs have the highest priority.
For example, given the following variability definition.

```yaml linenums="1"
variability:
    inputs:
        mode:
            type: string
        another_input: 
            type: string
        another_another_input:
            type: string

    presets:
        dev:
            name: Development
            description: Deploy the application on a private cloud
            inputs:
                mode: dev
                another_input: dev
                another_another_input: dev
        prod:
            name: Production
            description: Deploy the application on a public cloud
            inputs:
                mode: prod
                another_input: prod
```

When the presets `dev` and `prod` are applied and the variability input `mode` is directly assigned to `override`, then the following variability inputs are retrieved. 

```yaml linenums="1"
mode: override
another_input: prod
another_another_input: dev
```

### Check Element Presence

To check if an element is present, check that all assigned conditions hold:

1. Collect all conditions which are assigned to the element via `conditions`.
1. Collect all conditions which are assigned to variability groups via `conditions` which the element is member of.
1. (Optional) Assign default conditions if no conditions have been collected yet.
1. (Optional) Assign pruning conditions.
1. Evaluate assigned conditions.

The element is present if all conditions hold.

### Conduct Checks

To conduct the consistency and semantic checks, conduct the following steps:

1. Ensure that each relation source of a present relation is present.
1. Ensure that each relation target of a present relation is present.
1. Ensure that every present node has at maximum one present hosting relation.
1. Ensure that the node of each present artifact is present.
1. Ensure that present artifacts have unique names within their node.
1. Ensure that the node of each present property is present.
1. Ensure that present properties have unique names within their node.
1. Ensure that the container of each present type is present.
1. Ensure that each present type container has exactly one present type.
1. Ensure that every present node has a present hosting relation if the node had at least one conditional relation in the variable
1. Ensure that every present node has a present incoming relation if the node had at least one incoming relation in the variable service template.
1. Ensure that every present node has a present deployment artifact if the node had at least one deployment artifact in the variable service template.

Since the derived variability-resolved service template might be further processed, e.g. by
[topology completion](https://cs.emis.de/LNI/Proceedings/Proceedings232/247.pdf){target=_blank},
some or all of these checks might be omitted.

### Pruning Elements

To further support modeling, elements can be pruned by additionally evaluating the respective default condition before evaluating assigned conditions.
For example, when evaluating if a property of a node template is present, then evaluate first if respective node template is present and then assigned conditions.
Such pruning propagates through the whole topology.
For example, the properties of a relationship template used in a requirement assignment of a node template which is not present are also not present.

There are element-generic default conditions and type-specific default conditions. 
Element-generic default conditions are generic default conditions defined per element. 
However, type-specific default conditions are defined per type, e.g., node type, and, thus, override element-generic default conditions.

### Optimization

The variability-resolved service template can be optimized regarding the weight of node templates. 
The default weight of a node template is 1.
Per default, the variability-resolved service template is optimized regarding the minimal weight/ number of node templates.
The primary intention is to minimize the deployment complexity, but optimization could be also used, e.g., to minimize overall costs.
The weight of a node template can be configured in its definition.
Moreover, technology selection can be optimized.

## Element System

When introducing conditional elements, we follow typically the approach of using a list whose entries are maps that contain a single element.
Thus, elements can just be defined as usual but in a list (instead of a map) and can even share the same names. 
This has some implication on managing elements which we are discussing in the following.

### Element Collections

As an overview, the following table shows the collections that are used in TOSCA and the ones which are used in Variability4TOSCA.

| Element    | TOSCA  | Variability4TOSCA |
|------------|--------|-------------------|
| Inputs     | Map    | Map, List         |
| Outputs    | Map    | Map, List         |
| Nodes      | Map    | Map, List         |
| Relations  | List   | List              |
| Properties | Map    | Map, List         |
| Policies   | List   | List              |
| Groups     | Map    | Map, List         |
| Artifacts  | Map    | Map, List         |

### Element Uniqueness

As an overview, the following table shows the uniqueness of elements in TOSCA and in Variability4TOSCA in terms of identifiers, such as the key in a map.
This is directly related to the used collections.

| Element    | TOSCA            | Variability4TOSCA |
|------------|------------------|-------------------|
| Inputs     | :material-check: | :material-close:  |
| Outputs    | :material-check: | :material-close:  |
| Nodes      | :material-check: | :material-check:  |
| Relations  | :material-close: | :material-close:  |
| Properties | :material-check: | :material-close:  |
| Policies   | :material-close: | :material-close:  |
| Groups     | :material-check: | :material-check:  |
| Artifacts  | :material-check: | :material-close:  |

### Element Identifier System

Each element has an identifier that is unique per (variable) service template.
This identifier system is required since some conditional elements, such as artifacts, can have non-unique names.
The identifier of an element is constructed as follows.

```text linenums="1"
<Element Type>.<Element Name>[@<Element Index>][.<Element Container ID>]
```

Available element types are `node`, `relation`, `property`, `group`, `policy`, `artifact`, `input`, `output`, `technology`, `type`, and `import`.

For example, consider the given variable service template.

```yaml linenums="1"
node_templates:
    my_node:
        type: my.node
        properties:
           - my_property:
                value: first
                conditions: <VariabilityCondition>
           - my_property:
                value: second
                conditions: <VariabilityCondition>
        artifacts:
           - my_artifact:
                file: path/to/my_artifact_first
                conditions: <VariabilityCondition>
           - my_artifact:
                file: path/to/my_artifact_second
                conditions: <VariabilityCondition>
```


Next, the following identifiers, among others, exist.

- `node.my_node` for the node template `my_node`.
- `property.my_property@0.node.my_node` for the first property `my_property` of the node template `my_node`.
- `artifact.my_artifact@1.node.my_node` for the second artifact `my_artifact` of the node template `my_node`.


### Element Display System

Each element has a display representation that is unique per (variable) service template.
This display system is required since some conditional elements, such as artifacts, can have non-unique names.
The display representation of an element is constructed as follows.

```text linenums="1"
<Element Type> "<Element Name>[@<Element Index>]"[ of <Element Container Display>]
```

Available element types are `Node`, `Relation`, `Property`, `Group`, `Policy`, `Artifact`, `Input`, `Output`, `Technology`, `Type`, and `Import`.

For example, consider the given variable service template.

```yaml linenums="1"
node_templates:
    my_node:
        type: my.node
        properties:
           - my_property:
                value: first
                conditions: <VariabilityCondition>
           - my_property:
                value: second
                conditions: <VariabilityCondition>
        artifacts:
           - my_artifact:
                file: path/to/my_artifact_first
                conditions: <VariabilityCondition>
           - my_artifact:
                file: path/to/my_artifact_second
                conditions: <VariabilityCondition>
```


Next, the following display representations, among others, exist.

- `Node "my_node"` for the node template `my_node`.
- `Property "my_property@0" of Node "my_node"` for the first property `my_property` of the node template `my_node`.
- `Artifact "my_artifact@1" of Node "my_node"` for the second artifact `my_artifact` of the node template `my_node`.

--8<-- "vacd.md"
