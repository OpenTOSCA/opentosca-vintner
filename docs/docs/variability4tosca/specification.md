---
title: Specification
---

# Variability4TOSCA Specification 1.0 Release Candidate

This document specifies Variability4TOSCA which extends
[TOSCA Simple Profile in YAML Version 1.3](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html)
{target=_blank}
with conditional elements.
In the following, we discuss the differences.
The specification is under active development and is not backwards compatible with any previous versions.

## Service Template Definition

A Service Template must have the TOSCA Definitions Version `tosca_variability_1_0`.
Such a Service Template is also called Variable Service Template.

| Keyname                   | Mandatory | Type   | Description                                                              |
|---------------------------|-----------|--------|--------------------------------------------------------------------------|
| tosca_definitions_version | yes       | String | The required TOSCA Definitions Version. Must be `tosca_variability_1_0`. |

The version is expected to be set to `tosca_simple_1_3` when the Service Template is transformed
to [TOSCA Simple Profile in YAML Version 1.3](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html){target=_blank}.

## Topology Template Definition

A Topology Template additionally contains a Variability Definition.
Such a Topology Template is also called Variable Topology Template.

| Keyname     | Mandatory | Type                  | Description                                                                                 |
|-------------|-----------|-----------------------|---------------------------------------------------------------------------------------------|
| variability | yes       | VariabilityDefinition | A required object for Variability Inputs, Variability Presets, and Variability Expressions. |

## Variability Definition

A Variability Definition defines Variability Inputs, Variability Presets, and Variability Conditions.

| Keyname     | Mandatory | Type                                         | Description                                                                       |
|-------------|-----------|----------------------------------------------|-----------------------------------------------------------------------------------|
| inputs      | yes       | Map(String, InputParameterDefinition)        | A required map of Input Parameter Definitions used inside Variability Conditions. |
| presets     | no        | Map(String, VariabilityPresetDefinition)     | An optional map of Variability Preset Definitions.                                |
| expressions | no        | Map(String, VariabilityExpressionDefinition) | An optional map of Variability Expression Definitions.                            |

The following non-normative and incomplete example contains a Variability Definition which declares the Variability
Input `mode` and two Variability Conditions `is_dev` and `is_prod` which evaluates if `mode` equals `dev` resp. `prod`.
Furthermore, two Variability Presets `dev` and `prod` are defined which either assigns `mode` the value `dev` or `prod`.

```linenums="1"
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
        is_dev: {equal: [{get_variability_input: mode}, dev]}
        is_prod: {equal: [{get_variability_input: mode}, prod]}
```

This definition is expected to be removed when the Service Template is transformed
to [TOSCA Simple Profile in YAML Version 1.3](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html){target=_blank}.

## Variability Preset Definition

A Variability Preset predefines values for Variability Inputs that might be used when resolving variability.

| Keyname     | Mandatory | Type                                  | Description                                         |
|-------------|-----------|---------------------------------------|-----------------------------------------------------|
| name        | no        | String                                | An optional name of the Variability Preset.         |
| description | no        | String                                | An optional description for the Variability Preset. |
| inputs      | yes       | Map(String, InputParameterAssignment) | A required map of Input Parameter Assignments.      |

## Variability Expression Definition

A Variability Expression is an expression which consists of operators and functions which are listed below.
For example, the following expression returns the total amount of costs.
This result might be used inside a Variability Condition to ensure that the deployment costs are within a specific
budget.

```linenums="1"
expression: {add: [{get_variability_input: costs_offering_a}, {get_variability_input: costs_offering_b}]}
```

## Variability Condition Definition

A Variability Condition is a Variability Expression that returns a boolean.
Allowed operators and functions are listed below.
For example, the following condition evaluates to true if the Variability Input `mode` equals `prod`.

```linenums="1"
is_prod: {equal: [{get_variability_input: mode}, prod]}
```

## Node Template Definition

A Node Template can additionally contain Variability Conditions.
These conditions must be satisfied otherwise the respective Node Template is not present.

Furthermore, assigned Artifact Definitions can be a list of Artifact Definitions Maps which contains only one Artifact
Definition in order to allow Artifact Definition names to be used multiple times.

| Keyname             | Mandatory | Type                                                                                             | Description                                                                                                        |
|---------------------|-----------|--------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| conditions          | no        | VariabilityConditionDefinition &#124; List(VariabilityConditionDefinition)                       | An optional Variability Condition. If a list is given, then the conditions are combined using the _and_ operation. |
| artifacts           | no        | ArtifactDefinitionsMap &#124; List(ArtifactDefinitionsMap)                                       | An optional map of Artifact Definitions or a list of Artifact Definitions Maps.                                    | 


The following non-normative and incomplete example contains a Node Template that has a Variability Condition assigned.

```linenums="1"
prod_database:
    type: gcp.sql.db
    conditions: {get_variability_expression: is_prod}
```

The `conditions` keyword is expected to be removed when the Service Template is transformed
to [TOSCA Simple Profile in YAML Version 1.3](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html){target=_blank}.

Furthermore, artifacts must be transformed to an Artifact Definitions Map.

## Requirement Assignment Definition

A Requirement Assignment can additionally contain Variability Conditions.
These conditions must be satisfied otherwise the respective relationship is not present.

| Keyname    | Mandatory | Type                                                                       | Description                                                                                                        |
|------------|-----------|----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| conditions | no        | VariabilityConditionDefinition &#124; List(VariabilityConditionDefinition) | An optional Variability Condition. If a list is given, then the conditions are combined using the _and_ operation. |

The following non-normative and incomplete example contains a Requirement Assignment that has a Variability Condition
assigned.

```linenums="1"
requirements:
    - host:
          node: dev_runtime
          conditions: {get_variability_expression: is_dev}
```

The `conditions` keyword is expected to be removed when the Service Template is transformed
to [TOSCA Simple Profile in YAML Version 1.3](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html){target=_blank}.

## Group Template Definition

A Group Template can additionally contain Variability Conditions.
Depending on the Group Type the conditions are either assigned to the group itself or to the group members.
In general, the conditions are assigned to the group itself.
These conditions must be satisfied otherwise the respective group is not present.
Such a group is also called Conditional Group.

However, if the group is derived from `variability.groups.ConditionalMembers` then the conditions are assigned to the
group members.
These conditions must be satisfied otherwise the respective group members are not present.
Furthermore, group elements can be Node Templates and Requirement Assignments.
Such a group is also called Variability Group.

| Keyname    | Mandatory | Type                                                                       | Description                                                                                                        |
|------------|-----------|----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| members    | no        | List(String &#124; Tuple(String, String) &#124; Tuple(String, Number))     | An optional list of Node Templates names or Requirement Assignment Names/ Index of a Node Template.                |
| conditions | no        | VariabilityConditionDefinition &#124; List(VariabilityConditionDefinition) | An optional Variability Condition. If a list is given, then the conditions are combined using the _and_ operation. |

The following non-normative and incomplete example contains the group `example_group` which is only present if the
conditions are satisfied.

```linenums="1"
conditional_group:
    type: tosca.groups.Root
    members: [prod_database, [application, prod_connects_to]]
    conditions: {get_variability_expression: is_prod}
```

The following non-normative and incomplete example contains the group `example_group` whose elements are the Node
Template `prod_database` and the Requirement Assignment `prod_connects_to` of the Node Template `application`.
In contrast to the previous example this group is not derived from `variability.groups.ConditionalMembers`.

```linenums="1"
variability_group:
    type: variability.groups.ConditionalMembers
    members: [prod_database, [application, prod_connects_to]]
    conditions: {get_variability_expression: is_prod}
```

## Policy Template Definition

A Policy Template can additionally contain Variability Conditions.
These conditions must be satisfied otherwise the respective policy is not present.

| Keyname    | Mandatory | Type                                                                       | Description                                                                                                        |
|------------|-----------|----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| conditions | no        | VariabilityConditionDefinition &#124; List(VariabilityConditionDefinition) | An optional Variability Condition. If a list is given, then the conditions are combined using the _and_ operation. |

The following non-normative and incomplete example contains the Policy Template `anticollocation` that has the
Variability Condition `is_prod` assigned.
If the condition evaluates to true, then the policy is present.
As a result, the Node Templates `wordpress` and `mysql` _must not_ be hosted on the same server.
For more information about this example, take a look in
the [TOSCA Simple Profile in YAML Version 1.3](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#_Toc16506587){target=_blank}.

```linenums="1"
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
          conditions: {get_variability_expression: is_prod}
```

The `conditions` keyword is expected to be removed when the Service Template is transformed
to [TOSCA Simple Profile in YAML Version 1.3](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html){target=_blank}.

## Artifact Definition

An Artifact Definition can additionally contain Variability Conditions.
These conditions must be satisfied otherwise the respective artifact is not present.

| Keyname    | Mandatory | Type                                                                       | Description                                                                                                        |
|------------|-----------|----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| conditions | no        | VariabilityConditionDefinition &#124; List(VariabilityConditionDefinition) | An optional Variability Condition. If a list is given, then the conditions are combined using the _and_ operation. |

The `conditions` keyword is expected to be removed when the Service Template is transformed
to [TOSCA Simple Profile in YAML Version 1.3](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html){target=_blank}.

## Topology Template Input Definition

A Topology Template Input can additionally contain Variability Conditions.
These conditions must be satisfied otherwise the respective input is not present.

| Keyname    | Mandatory | Type                                                                       | Description                                                                                                        |
|------------|-----------|----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| conditions | no        | VariabilityConditionDefinition &#124; List(VariabilityConditionDefinition) | An optional Variability Condition. If a list is given, then the conditions are combined using the _and_ operation. |

The following non-normative and incomplete example contains a Topology Template Input that has a Variability Condition
assigned.

```linenums="1"
ssh_key_file:
    type: string
    conditions: {get_variability_expression: is_dev}
```

The `conditions` keyword is expected to be removed when the Service Template is transformed
to [TOSCA Simple Profile in YAML Version 1.3](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html){target=_blank}.

## Normative Group Types

There are two normative Group Types for informational purposes: `variability.groups.Root`
and `variability.groups.ConditionalMembers`.
The first Group Type is the root group every other variability-related group, such
as `variability.groups.ConditionalMembers` should derive from.

```linenums="1"
variability.groups.Root
    derived_from: tosca.groups.Root
```

The second Group Type should be used when a group has variability definitions assigned.

```linenums="1"
variability.groups.ConditionalMembers
    derived_from: variability.groups.Root
    conditions: VariabilityConditionDefinition | List(VariabilityConditionDefinition)    
```

These groups are expected to be removed when the Service Template is transformed
to [TOSCA Simple Profile in YAML Version 1.3](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html){target=_blank}.

## Normative Interface Types

The following normative interfaces define a management interface for nodes and relationships.
Currently, no management operations are defined.
The definition is intended to be extended in other specifications.

### Variability Management Interface for Nodes

```linenums="1"
tosca.interfaces.node.management.Variability:
    derived_from: tosca.interfaces.Root
```

### Variability Management Interface for Relationships

```linenums="1"
tosca.interfaces.relationship.management.Variability:
    derived_from: tosca.interfaces.Root
```

## Boolean Operators

The following Boolean operators can be used inside a Variability Expression.

| Keyname | Input                                      | Output  | Description                                        |
|---------|--------------------------------------------|---------|----------------------------------------------------|
| and     | List(BooleanExpression)                    | Boolean | Evaluates if all values are `true`.                |
| or      | List(BooleanExpression)                    | Boolean | Evaluates if at least one value is `true`.         |
| not     | BooleanExpression                          | Boolean | Negates the given value.                           |
| xor     | List(BooleanExpression)                    | Boolean | Evaluates if exactly one value is `true`.          |
| implies | Tuple(BooleanExpression, BoolenExpression) | Boolean | Evaluates if first value implies the second value. |

## Arithmetic Operators

The following arithmetic operators can be used inside a Variability Expression.

| Keyname | Input                                       | Output  | Description                               |
|---------|---------------------------------------------|---------|-------------------------------------------|
| add     | List(NumericExpression)                     | Numeric | Sums up given values.                     |
| sub     | List(NumericExpression)                     | Numeric | Subtracts values from the first one.      |
| mul     | List(NumericExpression)                     | Numeric | Multiplies given values.                  |
| div     | List(NumericExpression)                     | Numeric | Divides values from the first one.        |
| mod     | Tuple(NumericExpression, NumericExpression) | Numeric | Divides values and returns the remainder. |

## Intrinsic Functions

The following intrinsic functions can be used inside a Variability Expression.

| Keyname                    | Input                                                            | Output  | Description                                                                                                              |
|----------------------------|------------------------------------------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------|
| get_variability_input      | String                                                           | Any     | Returns the value of a Variability Input.                                                                                |
| get_variability_expression | String                                                           | Any     | Returns the value of the Variability Expression.                                                                         |
| get_variability_condition  | String                                                           | Boolean | Returns the value of the Variability Condition.                                                                          |
| get_element_presence       | String &#124; Tuple(String, String) &#124; Tuple(String, Number) | Boolean | Returns if element is present.                                                                                           |
| get_source_presence        | SELF                                                             | Boolean | Returns if source node of relation is present. Can only be used inside a relation. Otherwise use `get_element_presence`. |
| get_target_presence        | SELF                                                             | Boolean | Returns if target node of relation is present. Can only be used inside a relation. Otherwise use `get_element_presence`. |
| has_present_targets        | String                                                           | Boolean | Returns if any target of the given policy is present.                                                                    
| has_present_members        | String                                                           | Boolean | Returns if any member of the given group is present.                                                                     
| concat                     | List(ValueExpression)                                            | String  | Concatenates the given values.                                                                                           |
| join                       | Tuple(List(ValueExpression), String)                             | String  | Joins the given values using the provided delimiter.                                                                     |
| token                      | Tuple(ValueExpression, String, Number)                           | String  | Splits a given value by the provided delimiter and returns the element specified by the provided index.                  |

## Constraint Operators

The following constraint operators can be used inside a Variability Expression.

| Keyname          | Input                                                                 | Output  | Description                                                           |
|------------------|-----------------------------------------------------------------------|---------|-----------------------------------------------------------------------|
| equal            | List(ValueExpression)                                                 | Boolean | Evaluates if the given values are equal.                              |
| greater_than     | Tuple(NumericExpression, NumericExpression)                           | Boolean | Evaluates if the first value is greate than the second value.         |
| greater_or_equal | Tuple(NumericExpression, NumericExpression)                           | Boolean | Evaluates if the first value is greater or equal to the second value. |
| less_than        | Tuple(NumericExpression, NumericExpression)                           | Boolean | Evaluates if the first value is less than the second value.           |
| less_or_equal    | Tuple(NumericExpression, NumericExpression)                           | Boolean | Evaluates if the first value is less or equal to the second value.    |
| in_range         | Tuple(NumericExpression, Tuple(NumericExpression, NumericExpression)) | Boolean | Evaluates if the value is in a given range.                           |
| length           | Tuple(ValueExpression, NumericExpression)                             | Boolean | Evaluates if the value has a given length.                            |
| min_length       | Tuple(ValueExpression, NumericExpression)                             | Boolean | Evaluates if the value has a minimum length.                          |
| max_length       | Tuple(ValueExpression, NumericExpression)                             | Boolean | Evaluates if the value has a maximum length.                          |

## Processing

In the following, we describe on a high-level the steps to derive a Variability-Resolved Service Template from a
Variable
Service Template.

### Resolve Variability

To resolve the variability in a Variable Service Template, conduct the following steps:

1. Ensure that TOSCA Definitions Version is `tosca_variability_1_0`
1. Remove all Node Templates which are not present.
1. Remove all Properties which are not present.
1. Remove all Artifacts which are not present.
1. Remove all Requirement Assignments which are not present.
1. Remove all Relationship Templates which are not used by any Requirement Assignment.
1. Remove all Topology Template Inputs which are not present.
1. Remove all Group Templates which are not present.
1. Remove all Group Members which are not present from Group Template.
1. Remove all Policy Templates which are not present.
1. Remove all Policy Targets which are not present from Policy Template.
1. Remove all non-standard elements, e.g., Variability Definition, Variability Groups, or `conditions` at Node
   Templates.
1. Set the TOSCA Definitions Version to `tosca_simple_yaml_1_3`.

### Check Element Presence

To check if an element is present, check that all assigned conditions are satisfied:

1. Collect all conditions which are assigned to the element via `conditions`.
1. Collect all conditions which are assigned to groups via `conditions` which the element is member of.
1. The element is present only if all conditions are satisfied.

### Prune Elements

To further support modeling, the following improvements can be taken:

1. Prune Relations: The default condition of a relation checks if the source node is present.
1. Force Prune Relations: Ignore any assigned conditions and check instead if the source node is present.
1. Prune Nodes: The default condition of a node checks if any ingoing relation is present.
1. Force Prune Nodes: Ignore any assigned conditions and check instead if any ingoing relation is present.
1. Prune Policies: The default condition of a policy checks if any targets are present.
1. Force Prune Policies: Ignore any assigned conditions and check instead if any targets are present.
1. Prune Groups: The default condition of a group checks if any members are present.
1. Force Prune Groups: Ignore any assigned conditions and check instead if any members are present.
1. Prune Artifacts: The default condition of an artifact checks if the corresponding node is present.
1. Force Prune Artifacts: Ignore any assigned conditions and check instead if corresponding node is present.

### Check Consistency

To check the consistency, conduct the following steps:

1. Ensure that each relation source exists. Otherwise, throw Missing Relation Source Error.
1. Ensure that each relation target exists. Otherwise, throw Missing Relation Target Error.
1. Ensure that every node has at maximum one hosting relation. Otherwise, throw Ambiguous Hosting Error.
1. Ensure that every node has a hosting relation if the node had at least one conditional relation in the Variable
   Service Template. Otherwise, throw Missing Hosting Error.
1. Ensure that the node of each artifact exists. Otherwise, throw Missing Artifact Parent Error.
1. Ensure that present artifacts have unique names within their node. Otherwise, throw Ambiguous Artifact error.
1. Ensure that the node of each property exists. Otherwise, throw Missing Property Parent error.
1. Ensure that present properties have unique names within their node. Otherwise, throw Ambiguous Property error.

Since the derived Service Template might be further processed, e.g. by
[Topology Completion](https://cs.emis.de/LNI/Proceedings/Proceedings232/247.pdf){target=_blank}[@hirmer2014automatic],
some or all of these consistency steps might be omitted.

### Processing Errors

When variability is resolved, the following errors might be thrown:

| Error                     | Message                                                                            |
|---------------------------|------------------------------------------------------------------------------------|
| Unsupported TOSCA Version | TOSCA definitions version "${template.tosca_definitions_version}" not supported    |
| Missing Relation Source   | Relation source "${relation.source}" of relation "${relation.name}" does not exist |
| Missing Relation Target   | Relation target "${relation.target}" of relation "${relation.name}" does not exist |
| Ambiguous Hosting         | Node "${node.name}" has more than one hosting relations                            |
| Missing Hosting           | Node "${node.name}" requires a hosting relation                                    |
| Missing Policy Target     | Policy target "${target.name}" of policy "${policy.name}" does not exist           |
| Missing Group Member      | Group member "${member.name}" of group "${group.name}" does not exist              | 
| Missing Artifact Parent   | Node "${node.name}" of artifact "${artifact.name}" does not exist                  | 
| Ambiguous Artifact        | Artifact "${artifact.name}@${artifact.index}" of node "${node.name}" is ambiguous  | 
| Missing Property Parent   | Node "${node.name}" of property "${property.name}" does not exist                  | 
| Ambiguous Property        | Property "${property.name}@${property.index}" of node "${node.name}" is ambiguous  | 

## Variability Tests

A CSAR might contain Variability Tests to continuously test that the variability is resolved as expected, e.g., during
continuous integration pipelines.
Therefore, add the directory `/tests` in the root of the CSAR.
Each test is defined inside its own directory of `/tests` and might contain the following files.

| File            | Description                                                |
|-----------------|------------------------------------------------------------|
| `expected.yaml` | The expected service template after resolving variability. |
| `inputs.yaml`   | The Variability Inputs used for resolving variability.     |
| `test.yaml`     | A description of the test including configuration.         |

Here is exemplary structure of a CSAR that has one Variability Test.

```
my-csar/
├─ tests/
│  ├─ my-test-case/
│  │  ├─ expected.yaml
│  │  ├─ inputs.yaml
│  │  ├─ test.yaml
├─ service-template.yaml
```

The `test.yaml` file describes and configures the test and has the following structure.

| Keyname     | Mandatory | Type   | Description                                            |
|-------------|-----------|--------|--------------------------------------------------------|
| name        | false     | String | Display name of the test case.                         | 
| description | false     | String | Description of the test case.                          | 
| preset      | false     | String | Variability Preset to used when resolving variability. | 
| error       | false     | String | The expected error that is thrown.                     | 

## Conformance Tests

There are a variety of conformance tests for Variability4TOSCA implementations.
The tests can be found
in [https://github.com/OpenTOSCA/opentosca-vintner/tree/main/tests/resolver](https://github.com/OpenTOSCA/opentosca-vintner/tree/main/tests/resolver){target=_blank}.