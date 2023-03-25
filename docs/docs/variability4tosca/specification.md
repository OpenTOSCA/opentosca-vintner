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

## Service Template

A service template must have the TOSCA definitions version `tosca_variability_1_0`.
Such a service template is also called variable service template.

| Keyname                   | Mandatory | Type   | Description                                                              |
|---------------------------|-----------|--------|--------------------------------------------------------------------------|
| tosca_definitions_version | yes       | String | The required TOSCA definitions version. Must be `tosca_variability_1_0`. |


## Topology Template

A topology template additionally contains a variability definition.
Such a topology template is also called variable topology template.

| Keyname     | Mandatory | Type                  | Description                                                                                 |
|-------------|-----------|-----------------------|---------------------------------------------------------------------------------------------|
| variability | yes       | VariabilityDefinition | A required object for variability inputs, variability presets, and variability expressions. |

## Variability Definition

A variability definition defines variability inputs, variability presets, and variability conditions.

| Keyname     | Mandatory | Type                                | Description                                                            |
|-------------|-----------|-------------------------------------|------------------------------------------------------------------------|
| inputs      | yes       | Map(String, VariabilityInput)       | A required map of input parameters used inside variability conditions. |
| presets     | no        | Map(String, VariabilityPreset)      | An optional map of variability preset definitions.                     |
| expressions | no        | Map(String, VariabilityExpression)  | An optional map of variability expression definitions.                 |
| options     | no        | Map(String, Boolean)                | An optional map of variability resolving options.                      |


The following non-normative and incomplete example contains a variability definition which declares the Variability
Input `mode` and two variability conditions `is_dev` and `is_prod` which evaluates if `mode` equals `dev` resp. `prod`.
Furthermore, two variability presets `dev` and `prod` are defined which either assigns `mode` the value `dev` or `prod`.

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
        is_dev: {equal: [{variability_input: mode}, dev]}
        is_prod: {equal: [{variability_input: mode}, prod]}
```


## Variability Input

A variability input is an input parameter which additionally has the following keywords.

| Keyname            | Mandatory | Type                                                                          | Description                                                        |
|--------------------|-----------|-------------------------------------------------------------------------------|--------------------------------------------------------------------|
| default_expression | no        | VariabilityExpression | An variability expressions which is evaluated and used as default. |


## Variability Resolving Options

There are the following variability resolving options. 
More specific options override wider set options. 
For example, if "strict" is enabled and "node_pruning" is enabled, then nodes are pruned.

| Keyname                                   | Mandatory | Type                          | Default | Description                                                     |
|-------------------------------------------|-----------|-------------------------------|---------|-----------------------------------------------------------------|
| strict                                    | false     | boolean                       | true    | disable all default conditions and pruning                      |
| default_condition                         | false     | boolean                       | false   | enable all default conditions                                   |
| node_default_condition                    | false     | boolean                       | false   | enable default condition for nodes                              |
| relation_default_condition                | false     | boolean                       | false   | enable default condition for relations                          |
| policy_default_condition                  | false     | boolean                       | false   | enable default condition for policies                           |
| group_default_condition                   | false     | boolean                       | false   | enable default condition for groups                             |
| artifact_default_condition                | false     | boolean                       | false   | enable default condition for artifacts                          |
| property_default_condition                | false     | boolean                       | false   | enable default condition for properties                         |
| pruning                                   | false     | boolean                       | false   | enable pruning of all elements                                  |
| node_pruning                              | false     | boolean                       | false   | enable pruning of nodes                                         |
| relation_pruning                          | false     | boolean                       | false   | enable pruning of relations                                     |
| policy_pruning                            | false     | boolean                       | false   | enable pruning of policies                                      |
| group_pruning                             | false     | boolean                       | false   | enable pruning of groups                                        |
| artifact_pruning                          | false     | boolean                       | false   | enable pruning of artifacts                                     |
| property_pruning                          | false     | boolean                       | false   | enable pruning of properties                                    |
| consistency_checks                        | false     | boolean                       | true    | enable all consistency checks                                   |
| relation_source_consistency_check         | false     | boolean                       | true    | enable consistency check regarding relation sources             |
| relation_target_consistency_check         | false     | boolean                       | true    | enable consistency check regarding relation targets             |
| ambiguous_hosting_consistency_check       | false     | boolean                       | true    | enable consistency check regarding maximum one hosting relation |
| expected_hosting_consistency_check        | false     | boolean                       | true    | enable consistency check regarding expected hosting relation    |
| missing_artifact_parent_consistency_check | false     | boolean                       | true    | enable consistency check regarding node of artifact             |
| ambiguous_artifact_consistency_check      | false     | boolean                       | true    | enable consistency check regarding ambiguous artifacts          |
| missing_property_parent_consistency_check | false     | boolean                       | true    | enable consistency check regarding node of a property           |
| ambiguous_property_consistency_check      | false     | boolean                       | true    | enable consistency check regarding ambiguous properties         |
| optimization                              | false     | boolean &#124; min &#124; max | min     | configure optimization                                          | 


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

## Variability Preset

A variability preset predefines values for variability inputs that might be used when resolving variability.

| Keyname     | Mandatory | Type                                  | Description                                         |
|-------------|-----------|---------------------------------------|-----------------------------------------------------|
| name        | no        | String                                | An optional name of the variability preset.         |
| description | no        | String                                | An optional description for the variability preset. |
| inputs      | yes       | Map(String, InputParameterAssignment) | A required map of input parameter assignments.      |

## Variability Expression

A variability expression is an expression which consists of operators and functions which are listed below.
For example, the following expression returns the total amount of costs.
This result might be used inside a variability condition to ensure that the deployment costs are within a specific
budget.
There are value expressions which return any kind of value and logic expressions which return Booleans.

```yaml linenums="1"
expression: {add: [{variability_input: costs_offering_a}, {variability_input: costs_offering_b}]}
```

## Variability Condition

A variability condition is a variability expression that returns a boolean.
Allowed operators and functions are listed below.
For example, the following condition evaluates to true if the variability input `mode` equals `prod`.

```yaml linenums="1"
is_prod: {equal: [{variability_input: mode}, prod]}
```

## Node Template

A node template can additionally contain variability conditions.
These conditions must be satisfied otherwise the respective node template is not present.

Furthermore, assigned artifact can be a list of artifact maps which contains only one Artifact
Definition in order to allow artifact names to be used multiple times.

| Keyname           | Mandatory | Type                                                                         | Description                                                                                                        |
|-------------------|-----------|------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| conditions        | no        | VariabilityCondition &#124; List(VariabilityCondition)                       | An optional variability condition. If a list is given, then the conditions are combined using the _and_ operation. |
| artifacts         | no        | Map(String, Artifact) &#124; List(Map(String, Artifact))                     | An optional map of artifact or a list of artifact maps.                                                            | 
| properties        | no        | Map(String, PropertyAssignment) &#124; List(Map(String, PropertyAssignment)) | An optional map of property assignments or a list of property assignments maps.                                    | 
| default_condition | no        | Boolean                                                                      | enable default condition for this element (overrides variability resolving options)                                |
| pruning           | no        | Boolean                                                                      | enable pruning for this element (overrides variability resolving options)                                          |
| weight            | no        | Boolean &#124; (Non-Negative) Number                                         | the weight used during optimization (default is 1)                                                                 |


The following non-normative and incomplete example contains a node template that has a variability condition assigned.

```yaml linenums="1"
prod_database:
    type: gcp.sql.db
    conditions: {logic_expression: is_prod}
```

Furthermore, artifacts must be transformed to an artifact map.

## Requirement Assignment

A requirement assignment can additionally contain variability conditions.
These conditions must be satisfied otherwise the respective relationship is not present.

| Keyname    | Mandatory | Type                                                                       | Description                                                                                                        |
|------------|-----------|----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| conditions | no        | VariabilityCondition &#124; List(VariabilityCondition) | An optional variability condition. If a list is given, then the conditions are combined using the _and_ operation. |
| default_alternative    | no        | Boolean                                                                    | Declare the value as default. Overwrites assigned `conditions`. There must be only one default assignment.         |                                                                                                       |
| default_condition | no        | Boolean                                                                      | enable default condition for this element (overrides variability resolving options)                                |
| pruning           | no        | Boolean                                                                      | enable pruning for this element (overrides variability resolving options)                                          |

The following non-normative and incomplete example contains a requirement assignment that has a variability condition
assigned.

```yaml linenums="1"
requirements:
    - host:
          node: dev_runtime
          conditions: {logic_expression: is_dev}
```

## Relationship Templates 

A relationship template can contain conditional property assignments.

| Keyname    | Mandatory | Type                                                                       | Description                                                                                                        |
|------------|-----------|----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| properties | no        | Map(String, PropertyAssignment) &#124; List(Map(String, PropertyAssignment)) | An optional map of property assignments or a list of property assignments maps.                                    |


## Property Assignment

A property assignment at node templates and relationship templates can additionally contain variability conditions if wrapped as the following object and if they are used in a list.

| Keyname            | Mandatory | Type                                                                          | Description                                                                                                        |
|--------------------|-----------|-------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| value              | no        | Property Assignment                                                           | The value of the property.                                                                                         |
| expression         | no        | VariabilityExpression | An variability expressions which is evaluated and used as value.                                                   |
| conditions         | no        | VariabilityCondition &#124; List(VariabilityCondition)    | An optional variability condition. If a list is given, then the conditions are combined using the _and_ operation. |
| default_alternative | no        | Boolean                                                                       | Declare the value as default. Overwrites assigned `conditions`. There must be only one default assignment.         |                                                                                                       |
| default_condition | no        | Boolean                                                                      | enable default condition for this element (overrides variability resolving options)                                |
| pruning           | no        | Boolean                                                                      | enable pruning for this element (overrides variability resolving options)                                          |


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

## Group Template

A group template can additionally contain variability conditions.
Depending on the group type the conditions are either assigned to the group itself or to the group members.
In general, the conditions are assigned to the group itself.
These conditions must be satisfied otherwise the respective group is not present.
Such a group is also called Conditional Group.

However, if the group is derived from `variability.groups.ConditionalMembers` then the conditions are assigned to the
group members.
These conditions must be satisfied otherwise the respective group members are not present.
Furthermore, group elements can be node templates and requirement assignments.
Such a group is also called variability group.

| Keyname    | Mandatory | Type                                                                       | Description                                                                                                        |
|------------|-----------|----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| members    | no        | List(String &#124; Tuple(String, String) &#124; Tuple(String, Number))     | An optional list of node templates names or requirement assignment names/ index of a node template.                |
| conditions | no        | VariabilityCondition &#124; List(VariabilityCondition) | An optional variability condition. If a list is given, then the conditions are combined using the _and_ operation. |
| properties | no        | Map(String, PropertyAssignment) &#124; List(Map(String, PropertyAssignment)) | An optional map of property assignments or a list of property assignments maps.                                    | 
| default_condition | no        | Boolean                                                                      | enable default condition for this element (overrides variability resolving options)                                |
| pruning           | no        | Boolean                                                                      | enable pruning for this element (overrides variability resolving options)                                          |

The following non-normative and incomplete example contains the group `example_group` which is only present if the
conditions are satisfied.

```yaml linenums="1"
conditional_group:
    type: tosca.groups.Root
    members: [prod_database, [application, prod_connects_to]]
    conditions: {logic_expression: is_prod}
```

The following non-normative and incomplete example contains the group `example_group` whose elements are the Node
Template `prod_database` and the requirement assignment `prod_connects_to` of the node template `application`.
In contrast to the previous example this group is not derived from `variability.groups.ConditionalMembers`.

```yaml linenums="1"
variability_group:
    type: variability.groups.ConditionalMembers
    members: [prod_database, [application, prod_connects_to]]
    conditions: {logic_expression: is_prod}
```

## Policy Template

A policy template can additionally contain variability conditions.
These conditions must be satisfied otherwise the respective policy is not present.

| Keyname           | Mandatory | Type                                                                         | Description                                                                                                        |
|-------------------|-----------|------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| conditions        | no        | VariabilityCondition &#124; List(VariabilityCondition)                       | An optional variability condition. If a list is given, then the conditions are combined using the _and_ operation. |
| properties        | no        | Map(String, PropertyAssignment) &#124; List(Map(String, PropertyAssignment)) | An optional map of property assignments or a list of property assignments maps.                                    | 
| default_condition | no        | Boolean                                                                      | enable default condition for this element (overrides variability resolving options)                                |
| pruning           | no        | Boolean                                                                      | enable pruning for this element (overrides variability resolving options)                                          |

The following non-normative and incomplete example contains the policy template `anticollocation` that has the
variability condition `is_prod` assigned.
If the condition evaluates to true, then the policy is present.
As a result, the node templates `wordpress` and `mysql` _must not_ be hosted on the same server.
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
          conditions: {logic_expression: is_prod}
```


## Artifact

An artifact, that is used in node templates, can additionally contain variability conditions.
These conditions must be satisfied otherwise the respective artifact is not present.

| Keyname             | Mandatory | Type                                                                         | Description                                                                                                        |
|---------------------|-----------|------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| conditions          | no        | VariabilityCondition &#124; List(VariabilityCondition)                       | An optional variability condition. If a list is given, then the conditions are combined using the _and_ operation. |
| default_alternative | no        | Boolean                                                                      | Declare the value as default. Overwrites assigned `conditions`. There must be only one default artifact.           |                                                                                                       |
| properties          | no        | Map(String, PropertyAssignment) &#124; List(Map(String, PropertyAssignment)) | An optional map of property assignments or a list of property assignments maps.                                    | 
| default_condition   | no        | Boolean                                                                      | enable default condition for this element (overrides variability resolving options)                                |
| pruning             | no        | Boolean                                                                      | enable pruning for this element (overrides variability resolving options)                                          |


## Topology Template Input

A topology template input can additionally contain variability conditions.
These conditions must be satisfied otherwise the respective input is not present.

| Keyname    | Mandatory | Type                                                                       | Description                                                                                                        |
|------------|-----------|----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| conditions | no        | VariabilityCondition &#124; List(VariabilityCondition) | An optional variability condition. If a list is given, then the conditions are combined using the _and_ operation. |
| default_condition | no        | Boolean                                                                      | enable default condition for this element (overrides variability resolving options)                                |
| pruning           | no        | Boolean                                                                      | enable pruning for this element (overrides variability resolving options)                                          |

The following non-normative and incomplete example contains a topology template input that has a variability condition
assigned.

```yaml linenums="1"
ssh_key_file:
    type: string
    conditions: {logic_expression: is_dev}
```


## Normative Group Types

There are two normative group types for informational purposes: `variability.groups.Root`
and `variability.groups.ConditionalMembers`.
The first group type is the root group every other variability-related group, such
as `variability.groups.ConditionalMembers` should derive from.

```yaml linenums="1"
variability.groups.Root:
    derived_from: tosca.groups.Root
```

The second group type should be used when a group has variability definitions assigned.

```yaml linenums="1"
variability.groups.ConditionalMembers:
    derived_from: variability.groups.Root
    conditions: VariabilityCondition | List(VariabilityCondition)    
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

The following logical operators can be used inside a variability expression.

| Keyname | Input                                       | Output  | Description                                        |
|---------|---------------------------------------------|---------|----------------------------------------------------|
| and     | List(BooleanExpression)                     | Boolean | Evaluates if all values are `true`.                |
| or      | List(BooleanExpression)                     | Boolean | Evaluates if at least one value is `true`.         |
| not     | BooleanExpression                           | Boolean | Negates the given value.                           |
| xor     | List(BooleanExpression)                     | Boolean | Evaluates if exactly one value is `true`.          |
| implies | Tuple(BooleanExpression, BooleanExpression) | Boolean | Evaluates if first value implies the second value. |

## Arithmetic Operators

The following arithmetic operators can be used inside a variability expression.

| Keyname | Input                                       | Output  | Description                               |
|---------|---------------------------------------------|---------|-------------------------------------------|
| add     | List(NumericExpression)                     | Numeric | Sums up given values.                     |
| sub     | List(NumericExpression)                     | Numeric | Subtracts values from the first one.      |
| mul     | List(NumericExpression)                     | Numeric | Multiplies given values.                  |
| div     | List(NumericExpression)                     | Numeric | Divides values from the first one.        |
| mod     | Tuple(NumericExpression, NumericExpression) | Numeric | Divides values and returns the remainder. |

## Intrinsic Functions

The following intrinsic functions can be used inside a variability expression.

| Keyname               | Input                                              | Output  | Description                                                                                                              |
|-----------------------|----------------------------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------|
| variability_input | String                                             | Any     | Returns the value of a variability input.                                                                                |
| logic_expression  | String                                             | Boolean | Returns the value of the Logic Expression.                                                                               |
| value_expression  | String                                             | Any     | Returns the value of the Value Expression.                                                                               |
| node_presence     | String                                             | Boolean | Returns if node is present.                                                                                              |
| is_present_target          | String                                                     | Boolean | Returns if the node template is target of at least one present incoming relationship.                                    |
| is_target                  | String                                                     | Boolean | Returns if the node template is target of at least one present or absent incoming relationship.                          |
| relation_presence | Tuple(String, String) &#124; Tuple(String, Number) | Boolean | Returns if relation is present.                                                                                          |
| property_presence | Tuple(String, String) &#124; Tuple(String, Number) | Boolean | Returns if property is present.                                                                                          |
| artifact_presence | Tuple(String, String) &#124; Tuple(String, Number) | Boolean | Returns if artifact is present.                                                                                          |
| policy_presence   | String &#124; Number                               | Boolean | Returns if policy is present.                                                                                            |
| group_presence    | String                                             | Boolean | Returns if group is present.                                                                                             |
| input_presence    | String                                             | Boolean | Returns if input is present.                                                                                             |
| source_presence   | SELF                                               | Boolean | Returns if source node of relation is present. Can only be used inside a relation. Otherwise use `get_element_presence`. |
| target_presence   | SELF                                               | Boolean | Returns if target node of relation is present. Can only be used inside a relation. Otherwise use `get_element_presence`. |
| has_present_target   | String &#124; Number                               | Boolean | Returns if any target of the given policy is present.                                                                    |
| has_present_member   | String                                             | Boolean | Returns if any member of the given group is present.                                                                     |
| concat                | List(ValueExpression)                              | String  | Concatenates the given values.                                                                                           |
| join                  | Tuple(List(ValueExpression), String)               | String  | Joins the given values using the provided delimiter.                                                                     |
| token                 | Tuple(ValueExpression, String, Number)             | String  | Splits a given value by the provided delimiter and returns the element specified by the provided index.                  |

## Constraint Operators

The following constraint operators can be used inside a variability expression.

| Keyname          | Input                                                                 | Output  | Description                                                           |
|------------------|-----------------------------------------------------------------------|---------|-----------------------------------------------------------------------|
| equal            | List(ValueExpression)                                                 | Boolean | Evaluates if the given values are equal.                              |
| greater     | Tuple(NumericExpression, NumericExpression)                           | Boolean | Evaluates if the first value is greater than the second value.        |
| greater_or_equal | Tuple(NumericExpression, NumericExpression)                           | Boolean | Evaluates if the first value is greater or equal to the second value. |
| less        | Tuple(NumericExpression, NumericExpression)                           | Boolean | Evaluates if the first value is less than the second value.           |
| less_or_equal    | Tuple(NumericExpression, NumericExpression)                           | Boolean | Evaluates if the first value is less or equal to the second value.    |
| in_range         | Tuple(NumericExpression, Tuple(NumericExpression, NumericExpression)) | Boolean | Evaluates if the value is in a given range.                           |
| valid_values     | Tuple(ValueExpression, List(ValueExpression))                         | Boolean | Evaluates if the value is element of the list.                        |
| length           | Tuple(ValueExpression, NumericExpression)                             | Boolean | Evaluates if the value has a given length.                            |
| min_length       | Tuple(ValueExpression, NumericExpression)                             | Boolean | Evaluates if the value has a minimum length.                          |
| max_length       | Tuple(ValueExpression, NumericExpression)                             | Boolean | Evaluates if the value has a maximum length.                          |

## Analytical Operators

The following analytical operators can be used inside a variability expression.

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

The following date operators can be used inside a variability expression.

| Keyname        | Input                                                                          | Output  | Description                                                                      |
|----------------|--------------------------------------------------------------------------------|---------|----------------------------------------------------------------------------------|
| weekday        | Empty List                                                                     | String  | Returns the current weekday.                                                     |
| same           | Tuple(String &#124; Number, String &#124; Number)                              | Boolean | Returns if first date is the same date as the second.                            |
| before         | Tuple(String &#124; Number, String &#124; Number)                              | Boolean | Returns if first date is before the second date.                                 |
| before_or_same | Tuple(String &#124; Number, String &#124; Number)                              | Boolean | Returns if first date is before or same as the second date.                      |
| after          | Tuple(String &#124; Number, String &#124; Number)                              | Boolean | Returns if first date is after the second date.                                  |
| after_or_same  | Tuple(String &#124; Number, String &#124; Number)                              | Boolean | Returns if first date is after or same as the second date.                       |
| within         | Tuple(String &#124; Number, Tuple(String &#124; Number, String &#124; Number)) | Boolean | Returns if given date is within the given dates. |

## Processing

In the following, we describe on a high-level the steps to derive a variability-resolved service template from a variable service template.

### Resolve Variability

To resolve the variability in a variable service template, conduct the following steps:

1. Retrieve variability inputs assignments.
1. Ensure that TOSCA definitions version is `tosca_variability_1_0`
1. Remove all node templates which are not present.
1. Remove all node template Properties which are not present.
1. Remove all artifacts which are not present.
1. Remove all requirement assignments which are not present.
1. Remove all relationship templates which are not used by any requirement assignment.
1. Remove all relationship template Properties which are not present.
1. Remove all topology template inputs which are not present.
1. Remove all group templates which are not present.
1. Remove all group members which are not present from group template.
1. Remove all policy templates which are not present.
1. Remove all policy targets which are not present from policy template.
1. Remove all non-standard elements, e.g., variability definition, variability groups, or `conditions` at node templates.
1. Set the TOSCA definitions version to `tosca_simple_yaml_1_3`.


### Retrieve Variability Inputs Assignments

Variability inputs can be assigned either directly or indirectly using possibly multiple variability presets.
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
1. Ensure that every node has a hosting relation if the node had at least one conditional relation in the variable
   service template. Otherwise, throw Missing Hosting Error.
1. Ensure that the node of each artifact exists. Otherwise, throw Missing Artifact Parent Error.
1. Ensure that present artifacts have unique names within their node. Otherwise, throw Ambiguous Artifact error.
1. Ensure that the node of each property exists. Otherwise, throw Missing Property Parent error.
1. Ensure that present properties have unique names within their node. Otherwise, throw Ambiguous Property error.

Since the derived service template might be further processed, e.g. by
[Topology Completion](https://cs.emis.de/LNI/Proceedings/Proceedings232/247.pdf){target=_blank}[@hirmer2014automatic],
some or all of these consistency steps might be omitted.

### Pruning Elements

To further support modeling, elements can be pruned by additionally evaluating the respective default condition before evaluating assigned conditions.
For example, when evaluating if a property of a node template is present, then evaluate first if respective node template is present and then assigned conditions.
This basically enables to disable consistency checks since consistency checks evaluate, e.g., that a property can not exist without its parent.
Such pruning propagates through the whole topology.
For example, the properties of a relationship template used in a requirement assignment of a node template which is not present are also not present.

### Optimization

The variability-resolved service template shall be optimized regarding minimal weight of node templates. 
The default weight of a node template is 1.
Thus, per default, the service template is optimized regarding minimal number of node templates.
The primary intention is to minimize the deployment complexity, but optimization could be also used, e.g., to minimize overall costs.
The weight of a node template can be configured in its definition.

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

A CSAR might contain variability tests to continuously test that the variability is resolved as expected, e.g., during
continuous integration pipelines.
Therefore, add the directory `/tests` in the root of the CSAR.
Each test is defined inside its own directory of `/tests` and might contain the following files.

| File            | Description                                                |
|-----------------|------------------------------------------------------------|
| `expected.yaml` | The expected service template after resolving variability. |
| `inputs.yaml`   | The variability inputs used for resolving variability.     |
| `test.yaml`     | A description of the test including configuration.         |

Here is exemplary structure of a CSAR that has one variability test.

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
