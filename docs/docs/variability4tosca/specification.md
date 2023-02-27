---
title: Specification
---

# Variability4TOSCA Specification 1.0 Release Candidate

This document specifies Variability4TOSCA which extends
[TOSCA Simple Profile in YAML Version 1.3](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html){target=_blank}
with conditional elements.
This includes conditional node templates, relationship templates, properties, artifacts, groups, policies, and inputs.
In the following, we discuss the differences.
The specification is under active development and is not backwards compatible with any previous versions.

## Service Template Definition

A service template must have the TOSCA definitions version `tosca_variability_1_0`.
Such a service template is also called _variable service template_.

| Keyname                   | Mandatory | Type   | Description                                                              |
|---------------------------|-----------|--------|--------------------------------------------------------------------------|
| tosca_definitions_version | yes       | String | The required TOSCA Definitions Version. Must be `tosca_variability_1_0`. |


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
| inputs      | yes       | Map(String, VariabilityInputDefinition)      | A required map of Input Parameter Definitions used inside Variability Conditions. |
| presets     | no        | Map(String, VariabilityPresetDefinition)     | An optional map of Variability Preset Definitions.                                |
| expressions | no        | Map(String, VariabilityExpressionDefinition) | An optional map of Variability Expression Definitions.                            |
| options | no | Map(String, Boolean)                         | An optional map of Variability Resolving options.                                |


The following non-normative and incomplete example contains a Variability Definition which declares the Variability
Input `mode` and two Variability Conditions `is_dev` and `is_prod` which evaluates if `mode` equals `dev` resp. `prod`.
Furthermore, two Variability Presets `dev` and `prod` are defined which either assigns `mode` the value `dev` or `prod`.

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
        is_dev: {equal: [{get_variability_input: mode}, dev]}
        is_prod: {equal: [{get_variability_input: mode}, prod]}
```


## Variability Input Definition

A variability input definition is an input parameter definition which additionally has the following keywords.

| Keyname            | Mandatory | Type                                                                          | Description                                                        |
|--------------------|-----------|-------------------------------------------------------------------------------|--------------------------------------------------------------------|
| default_expression | no        | VariabilityExpressionDefinition | An variability expressions which is evaluated and used as default. |


## Variability Resolving Options

There are the following variability resolving options. 

| Keyname                                           | Mandatory | Type                                  | Description                                                      |
|---------------------------------------------------|-----------|---------------------------------------|------------------------------------------------------------------|
| enable_node_default_condition                     |  false  | boolean | enable default condition for nodes                               |
| enable_relation_default_condition                 |  false  | boolean | enable default condition for relations                           |
| enable_policy_default_condition                   |  false  | boolean | enable default condition for policies                            |
| enable_group_default_condition                    |  false  | boolean | enable default condition for groups                              |
| enable_artifact_default_condition                 |  false  | boolean | enable default condition for artifacts                           |
| enable_property_default_condition                 |  false  | boolean | enable default condition for properties                          |
| enable_node_pruning                               |  false  | boolean | enable pruning of nodes                                          |
| enable_relation_pruning                           |  false  | boolean | enable pruning of relations                                      |
| enable_policy_pruning                             |  false  | boolean | enable pruning of policies                                       |
| enable_group_pruning                              |  false  | boolean | enable pruning of groups                                         |
| enable_artifact_pruning                           |  false  | boolean | enable pruning of artifacts                                      |
| enable_property_pruning                           |  false  | boolean | enable pruning of properties                                     |
| disable_consistency_checks                        |  false  | boolean | disable all consistency checks                                   |
| disable_relation_source_consistency_check         |  false  | boolean | disable consistency check regarding relation sources             |
| disable_relation_target_consistency_check         |  false  | boolean | disable consistency check regarding relation targets             |
| disable_ambiguous_hosting_consistency_check       |  false  | boolean | disable consistency check regarding maximum one hosting relation |
| disable_expected_hosting_consistency_check        |  false  | boolean | disable consistency check regarding expected hosting relation    |
| disable_missing_artifact_parent_consistency_check |  false  | boolean | disable consistency check regarding node of artifact             |
| disable_ambiguous_artifact_consistency_check      |  false  | boolean | disable consistency check regarding ambiguous artifacts          |
| disable_missing_property_parent_consistency_check |  false  | boolean | disable consistency check regarding node of a property           |
| disable_ambiguous_property_consistency_check      |  false  | boolean | disable consistency check regarding ambiguous properties         |


## Variability Default Conditions

To further support modeling, the following default conditions can be assigned:


| Element                | Default Conditions                                                                                                                                      |
|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| Node Template          | Check if the node template is target of at least one present relation or if the node template is not target of at least one present or absent relation. |
| Property               | Check if the container, i.e., node template, relationship template, artifact, or policy, of the property is present.                                    |
| Requirement Assignment | Check if the source and target of the requirement assignment is present.                                                                                |
| Policy                 | Check if the policy has any targets which are present.                                                                                                  |
| Group                  | Check if the group has any members which are present.                                                                                                   |
| Artifact               | Check if the node template of the artifact is present.                                                                                                  |


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

```yaml linenums="1"
expression: {add: [{get_variability_input: costs_offering_a}, {get_variability_input: costs_offering_b}]}
```

## Variability Condition Definition

A Variability Condition is a Variability Expression that returns a boolean.
Allowed operators and functions are listed below.
For example, the following condition evaluates to true if the Variability Input `mode` equals `prod`.

```yaml linenums="1"
is_prod: {equal: [{get_variability_input: mode}, prod]}
```

## Node Template Definition

A Node Template can additionally contain Variability Conditions.
These conditions must be satisfied otherwise the respective Node Template is not present.

Furthermore, assigned Artifact Definitions can be a list of Artifact Definitions Maps which contains only one Artifact
Definition in order to allow Artifact Definition names to be used multiple times.

| Keyname    | Mandatory | Type                                                                         | Description                                                                                                        |
|------------|-----------|------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| conditions | no        | VariabilityConditionDefinition &#124; List(VariabilityConditionDefinition)   | An optional Variability Condition. If a list is given, then the conditions are combined using the _and_ operation. |
| artifacts  | no        | Map(String, ArtifactDefinition) &#124; List(Map(String, ArtifactDefinition)) | An optional map of Artifact Definitions or a list of Artifact Definitions Maps.                                    | 
| properties | no        | Map(String, PropertyAssignment) &#124; List(Map(String, PropertyAssignment)) | An optional map of Property Assignments or a list of Property Assignments Maps.                                    | 


The following non-normative and incomplete example contains a Node Template that has a Variability Condition assigned.

```yaml linenums="1"
prod_database:
    type: gcp.sql.db
    conditions: {get_variability_expression: is_prod}
```

Furthermore, artifacts must be transformed to an Artifact Definitions Map.

## Requirement Assignment Definition

A Requirement Assignment can additionally contain Variability Conditions.
These conditions must be satisfied otherwise the respective relationship is not present.

| Keyname    | Mandatory | Type                                                                       | Description                                                                                                        |
|------------|-----------|----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| conditions | no        | VariabilityConditionDefinition &#124; List(VariabilityConditionDefinition) | An optional Variability Condition. If a list is given, then the conditions are combined using the _and_ operation. |
| default_alternative    | no        | Boolean                                                                    | Declare the value as default. Overwrites assigned `conditions`. There must be only one default assignment.         |                                                                                                       |

The following non-normative and incomplete example contains a Requirement Assignment that has a Variability Condition
assigned.

```yaml linenums="1"
requirements:
    - host:
          node: dev_runtime
          conditions: {get_variability_expression: is_dev}
```

## Relationship Templates 

A Relationship Template can contain conditional Property Assignments.

| Keyname    | Mandatory | Type                                                                       | Description                                                                                                        |
|------------|-----------|----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| properties | no        | Map(String, PropertyAssignment) &#124; List(Map(String, PropertyAssignment)) | An optional map of Property Assignments or a list of Property Assignments Maps.                                    |


## Property Assignment

A Property Assignment at Node Templates and Relationship Templates can additionally contain Variability Conditions if wrapped as the following object and if they are used in a list.

| Keyname            | Mandatory | Type                                                                          | Description                                                                                                        |
|--------------------|-----------|-------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| value              | no        | Property Assignment                                                           | The value of the Property.                                                                                         |
| expression         | no        | VariabilityExpressionDefinition | An variability expressions which is evaluated and used as value.                                                   |
| conditions         | no        | VariabilityConditionDefinition &#124; List(VariabilityConditionDefinition)    | An optional Variability Condition. If a list is given, then the conditions are combined using the _and_ operation. |
| default_alternative | no        | Boolean                                                                       | Declare the value as default. Overwrites assigned `conditions`. There must be only one default assignment.         |                                                                                                       |


Note, if the value is not wrapped and assigned to a property being part of a property assignment list, then the keyname `value` is a keyword, that is used to detect if the value is wrapped or not.
Thus, if `value` must be used, then use it wrapped as follows.
Same applies to `expression`.

```yaml linenums="1"
properties:
- key_one:
      value: {value: the_value}
    
# This is not allowed!  
# - key_one: { value: the_value }
```

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
| properties | no        | Map(String, PropertyAssignment) &#124; List(Map(String, PropertyAssignment)) | An optional map of Property Assignments or a list of Property Assignments Maps.                                    | 

The following non-normative and incomplete example contains the group `example_group` which is only present if the
conditions are satisfied.

```yaml linenums="1"
conditional_group:
    type: tosca.groups.Root
    members: [prod_database, [application, prod_connects_to]]
    conditions: {get_variability_expression: is_prod}
```

The following non-normative and incomplete example contains the group `example_group` whose elements are the Node
Template `prod_database` and the Requirement Assignment `prod_connects_to` of the Node Template `application`.
In contrast to the previous example this group is not derived from `variability.groups.ConditionalMembers`.

```yaml linenums="1"
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
| properties | no        | Map(String, PropertyAssignment) &#124; List(Map(String, PropertyAssignment)) | An optional map of Property Assignments or a list of Property Assignments Maps.                                    | 

The following non-normative and incomplete example contains the Policy Template `anticollocation` that has the
Variability Condition `is_prod` assigned.
If the condition evaluates to true, then the policy is present.
As a result, the Node Templates `wordpress` and `mysql` _must not_ be hosted on the same server.
For more information about this example, take a look in
the [TOSCA Simple Profile in YAML Version 1.3](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#_Toc16506587){target=_blank}.

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
          conditions: {get_variability_expression: is_prod}
```


## Artifact Definition

An Artifact Definition, that is used in Node Templates, can additionally contain Variability Conditions.
These conditions must be satisfied otherwise the respective artifact is not present.

| Keyname    | Mandatory | Type                                                                       | Description                                                                                                        |
|------------|-----------|----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| conditions | no        | VariabilityConditionDefinition &#124; List(VariabilityConditionDefinition) | An optional Variability Condition. If a list is given, then the conditions are combined using the _and_ operation. |
| default_alternative    | no        | Boolean                                                                    | Declare the value as default. Overwrites assigned `conditions`. There must be only one default artifact.           |                                                                                                       |
| properties | no        | Map(String, PropertyAssignment) &#124; List(Map(String, PropertyAssignment)) | An optional map of Property Assignments or a list of Property Assignments Maps.                                    | 


## Topology Template Input Definition

A Topology Template Input can additionally contain Variability Conditions.
These conditions must be satisfied otherwise the respective input is not present.

| Keyname    | Mandatory | Type                                                                       | Description                                                                                                        |
|------------|-----------|----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| conditions | no        | VariabilityConditionDefinition &#124; List(VariabilityConditionDefinition) | An optional Variability Condition. If a list is given, then the conditions are combined using the _and_ operation. |

The following non-normative and incomplete example contains a Topology Template Input that has a Variability Condition
assigned.

```yaml linenums="1"
ssh_key_file:
    type: string
    conditions: {get_variability_expression: is_dev}
```


## Normative Group Types

There are two normative Group Types for informational purposes: `variability.groups.Root`
and `variability.groups.ConditionalMembers`.
The first Group Type is the root group every other variability-related group, such
as `variability.groups.ConditionalMembers` should derive from.

```yaml linenums="1"
variability.groups.Root:
    derived_from: tosca.groups.Root
```

The second Group Type should be used when a group has variability definitions assigned.

```yaml linenums="1"
variability.groups.ConditionalMembers:
    derived_from: variability.groups.Root
    conditions: VariabilityConditionDefinition | List(VariabilityConditionDefinition)    
```

These groups are always expected to be removed when variability is resolved.

## Normative Interface Types

The following normative interfaces define a management interface for nodes and relationships.
Currently, no management operations are defined.
The definition is intended to be extended in other specifications.

### Variability Management Interface for Nodes

```yaml linenums="1"
tosca.interfaces.node.management.Variability:
    derived_from: tosca.interfaces.Root
```

### Variability Management Interface for Relationships

```yaml linenums="1"
tosca.interfaces.relationship.management.Variability:
    derived_from: tosca.interfaces.Root
```

## Logical Operators

The following logical operators can be used inside a Variability Expression.

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

| Keyname                    | Input                                                      | Output  | Description                                                                                                              |
|----------------------------|------------------------------------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------|
| get_variability_input      | String                                                     | Any     | Returns the value of a Variability Input.                                                                                |
| get_variability_expression | String                                                     | Any     | Returns the value of the Variability Expression.                                                                         |
| get_variability_condition  | String                                                     | Boolean | Returns the value of the Variability Condition.                                                                          |
| get_node_presence          | String                                                     | Boolean | Returns if node is present.                                                                                              |
| get_relation_presence      | Tuple(String, String) &#124; Tuple(String, Number)         | Boolean | Returns if relation is present.                                                                                          |
| get_source_presence        | SELF                                                       | Boolean | Returns if source node of relation is present. Can only be used inside a relation. Otherwise use `get_element_presence`. |
| get_target_presence        | SELF                                                       | Boolean | Returns if target node of relation is present. Can only be used inside a relation. Otherwise use `get_element_presence`. |
| has_present_targets        | String                                                     | Boolean | Returns if any target of the given policy is present.                                                                    |
| has_present_members        | String                                                     | Boolean | Returns if any member of the given group is present.                                                                     |
| is_target                  | String                                                     | Boolean | Returns if the node template is target of at least one present incoming relationship.                                    |
| was_target                 | String                                                     | Boolean | Returns if the node template is target of at least one present or absent incoming relationship.                          |
| concat                     | List(ValueExpression)                                      | String  | Concatenates the given values.                                                                                           |
| join                       | Tuple(List(ValueExpression), String)                       | String  | Joins the given values using the provided delimiter.                                                                     |
| token                      | Tuple(ValueExpression, String, Number)                     | String  | Splits a given value by the provided delimiter and returns the element specified by the provided index.                  |



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
| valid_values     | Tuple(ValueExpression, List(ValueExpression))                         | Boolean | Evaluates if the value is element of the list.                        |
| length           | Tuple(ValueExpression, NumericExpression)                             | Boolean | Evaluates if the value has a given length.                            |
| min_length       | Tuple(ValueExpression, NumericExpression)                             | Boolean | Evaluates if the value has a minimum length.                          |
| max_length       | Tuple(ValueExpression, NumericExpression)                             | Boolean | Evaluates if the value has a maximum length.                          |

## Analytical Operators

The following analytical operators can be used inside a Variability Expression.

| Keyname                | Input                                             | Output  | Description                                          |
|------------------------|---------------------------------------------------|---------|------------------------------------------------------|
| sum                    | List(Number)                                      | Number  | Returns the sum of the given values.                 |
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


## Date Operators

The following date operators can be used inside a Variability Expression.

| Keyname             | Input              | Output | Description                                     |
|---------------------|--------------------|--------|-------------------------------------------------|
| get_current_weekday | Empty List | String | Returns the current weekday. |

## Processing

In the following, we describe on a high-level the steps to derive a Variability-Resolved Service Template from a
Variable
Service Template.

### Resolve Variability

To resolve the variability in a Variable Service Template, conduct the following steps:

1. Retrieve Variability Inputs Assignments.
1. Ensure that TOSCA Definitions Version is `tosca_variability_1_0`
1. Remove all Node Templates which are not present.
1. Remove all Node Template Properties which are not present.
1. Remove all Artifacts which are not present.
1. Remove all Requirement Assignments which are not present.
1. Remove all Relationship Templates which are not used by any Requirement Assignment.
1. Remove all Relationship Template Properties which are not present.
1. Remove all Topology Template Inputs which are not present.
1. Remove all Group Templates which are not present.
1. Remove all Group Members which are not present from Group Template.
1. Remove all Policy Templates which are not present.
1. Remove all Policy Targets which are not present from Policy Template.
1. Remove all non-standard elements, e.g., Variability Definition, Variability Groups, or `conditions` at Node Templates.
1. Set the TOSCA Definitions Version to `tosca_simple_yaml_1_3`.

### Retrieve Variability Inputs Assignments

Variability Inputs can be assigned either directly or indirectly using possibly multiple variability presets.
Thereby, first the variability presets are applied in the order they are specified, and then directly assigned inputs.
Thus, directly assigned variability inputs have the highest priority.

### Check Element Presence

To check if an element is present, check that all assigned conditions are satisfied:

1. Collect all conditions which are assigned to the element via `conditions`.
1. Collect all conditions which are assigned to groups via `conditions` which the element is member of.
1. (Optional) Assign default conditions if no conditions have been collected yet.
1. (Optional) Assign pruning conditions.
1. The element is present only if all conditions are satisfied.

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

### Pruning Elements

To further support modeling, elements can be pruned by additionally evaluating the respective default condition before evaluating assigned conditions.
For example, when evaluating if a property of a node template is present, then evaluate first if respective node template is present and then assigned conditions.
This basically enables to disable consistency checks since consistency checks evaluate, e.g., that a property can not exist without its parent.
Such pruning propagates through the whole topology.
For example, the properties of a relationship template used in a requirement assignment of a node template which is not present are also not present.


### Processing Errors

When variability is resolved, the following errors might be thrown:

| Error                      | Message                                                                                     |
|----------------------------|---------------------------------------------------------------------------------------------|
| Unsupported TOSCA Version  | TOSCA definitions version "${template.tosca_definitions_version}" not supported             |
| Missing Relation Source    | Relation source "${relation.source}" of relation "${relation.name}" does not exist          |
| Missing Relation Target    | Relation target "${relation.target}" of relation "${relation.name}" does not exist          |
| Ambiguous Hosting          | Node "${node.name}" has more than one hosting relations                                     |
| Missing Hosting            | Node "${node.name}" requires a hosting relation                                             |
| Missing Policy Target      | Policy target "${target.name}" of policy "${policy.name}" does not exist                    |
| Missing Group Member       | Group member "${member.name}" of group "${group.name}" does not exist                       | 
| Missing Artifact Parent    | Node "${node.name}" of artifact "${artifact.name}" does not exist                           | 
| Ambiguous Artifact         | Artifact "${artifact.name}@${artifact.index}" of node "${node.name}" is ambiguous           | 
| Missing Property Parent    | Node/ Relation "${node.name}" of property "${property.name}" does not exist                 | 
| Ambiguous Property         | Property "${property.name}@${property.index}" of node/ relation "${node.name}" is ambiguous | 
| Ambiguous Default Property | Property "${property.name}" of ${parent.type} "${parent.name}" has multiple defaults        | 
| Ambiguous Default Artifact | Artifact "${artifact.name}" of node "${node.display}" has multiple defaults                 | 
| Ambiguous Default Relation | Relation "${relation.name}" of node "${node.display}" has multiple defaults                 | 


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

```text linenums="1"
my-csar/
├─ tests/
│  ├─ my-test-case/
│  │  ├─ expected.yaml
│  │  ├─ inputs.yaml
│  │  ├─ test.yaml
├─ service-template.yaml
```

The `test.yaml` file describes and configures the test and has the following structure.

| Keyname     | Mandatory | Type                       | Description                                                                                 |
|-------------|-----------|----------------------------|---------------------------------------------------------------------------------------------|
| name        | false     | String                     | Display name of the test case.                                                              | 
| description | false     | String                     | Description of the test case.                                                               | 
| presets     | false     | String &#124; List(String) | Variability presets to use when resolving variability.                                      | 
| error       | false     | String                     | The expected error that is thrown.                                                          | 
| expected    | false     | String                     | Path (relative to `test.yaml`) to the expected service template after resolving variability. | 

## Conformance Test Suite

Part of this specification is conformance test suite to evaluate Variability4TOSCA implementations.
The test suite can be found [here](tests/introduction.md).

## Limitations

We have the following limitations

1. We expect that each Relationship Templates is used exactly once
1. We expect that `relationships` at requirement assignments is a string
