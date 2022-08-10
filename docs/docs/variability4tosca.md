# Variability4TOSCA Specification 1.0

This document specifies the TOSCA extension _Variability4TOSCA_.
The extension is based on [TOSCA Simple Profile in YAML Version 1.3](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html){target=_blank}.
In the following, we discuss the differences.

## Service Template Definition

A _Service Template_ must have the _TOSCA Definitions Version_ `tosca_variability_1_0`.
Such a _Service Template_ is also called _Variable Service Template_.

| Keyname                   | Mandatory | Type   | Description                                                              |
| ------------------------- | --------- | ------ |--------------------------------------------------------------------------|
| tosca_definitions_version | yes       | String | The required TOSCA Definitions Version. Must be `tosca_variability_1_0`. |


## Topology Template Definition

A _Topology Template_ additionally contains a _Variability Definition_.
Such a _Topology Template_ is also called _Variable Topology Template_.

| Keyname     | Mandatory | Type                  | Description                                                                                 |
| ----------- | --------- | --------------------- |---------------------------------------------------------------------------------------------|
| variability | yes       | VariabilityDefinition | A required object for Variability Inputs, Variability Presets, and Variability Expressions. |


## Variability Definition

A _Variability Definition_ defines _Variability Inputs_, _Variability Presets_, and _Variability Conditions_.

| Keyname     | Mandatory | Type                                         | Description                                                                       |
|-------------| --------- |----------------------------------------------|-----------------------------------------------------------------------------------|
| inputs      | yes       | Map(String, InputParameterDefinition)        | A required map of Input Parameter Definitions used inside Variability Conditions. |
| presets     | no        | Map(String, VariabilityPresetDefinition)     | An optional map of Variability Preset Definitions.                                |
| expressions | no        | Map(String, VariabilityExpressionDefinition) | An optional map of Variability Expression Definitions.                            |

The following example contains a _Variability Definition_ which declares the _Variability Input_ `mode` and two _Variability Conditions_ `is_dev` and `is_prod` which evaluates if `mode` equals `dev` resp. `prod`.
Furthermore, two _Variability Presets_ `dev` and `prod` are defined which either assigns `mode` the value `dev` or `prod`.

```
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

## Variability Preset Definition

A _Variability Preset_ predefines values for _Variability Inputs_ that might be used when resolving variability.

| Keyname     | Mandatory | Type                                  | Description                                         |
| ----------- | --------- | ------------------------------------- |-----------------------------------------------------|
| name        | no        | String                                | An optional name of the Variability Preset.         |
| description | no        | String                                | An optional description for the Variability Preset. |
| inputs      | yes       | Map(String, InputParameterAssignment) | A required map of Input Parameter Assignments.      |


## Variability Expression Definition

A _Variability Expression_ is an expression which consists of operators and functions which are listed below.
For example, the following expression returns the total amount of costs. 
This result might be used inside a _Variability Condition_ to ensure that the deployment costs are within a specific budget.

```
expression: {add: [{get_variability_input: costs_offering_a}, {get_variability_input: costs_offering_b}]}
```


## Variability Condition Definition

A _Variability Condition_ is a _Variability Expression_ that returns a boolean. 
Allowed operators and functions are listed below.
For example, the following condition evaluates to true if the _Variability Input_ `mode` equals `prod`.

```
is_prod: {equal: [{get_variability_input: mode}, prod]}
```


## Node Template Definition

A _Node Template_ can additionally contain a _Variability Condition_.
This condition must evaluate to true otherwise the respective _Node Template_ is not present.

| Keyname    | Mandatory | Type                           | Description                        |
|------------| --------- | ------------------------------ |------------------------------------|
| conditions | no        | VariabilityConditionDefinition &#124; List(VariabilityConditionDefinition) | An optional Variability Condition. If a list is given, then the conditions are combined using the _and_ operation. |

The following example contains a _Node Template_ that has a _Variability Condition_ assigned.

```
prod_database:
    type: gcp.sql.db
    conditions: {get_variability_expression: is_prod}
```

## Requirement Assignment Definition

A _Requirement Assignment_ can additionally contain a _Variability Condition_.
This condition must evaluate to true otherwise the respective relationship is not present.

| Keyname   | Mandatory | Type                           | Description                        |
| --------- | --------- | ------------------------------ |------------------------------------|
| conditions | no        | VariabilityConditionDefinition &#124; List(VariabilityConditionDefinition) | An optional Variability Condition. If a list is given, then the conditions are combined using the _and_ operation. |


The following example contains a _Requirement Assignment_ that has a _Variability Condition_ assigned.

```
requirements:
    - host:
          node: dev_runtime
          conditions: {get_variability_expression: is_dev}
```

## Group Template Definition

A _Group Template_ can additionally contain a _Variability Condition_.
This condition must evaluate to true otherwise the respective group elements are not present.

Furthermore, group elements can be _Node Templates_ and _Requirement Assignments_.

| Keyname    | Mandatory | Type                                                                       | Description                                                                                                         |
|------------| --------- |----------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| members    | no        | List(String &#124; Tuple(String, String))                                  | An optional list of Node Templates names or Requirement Assignment Names of a Node Template (which must be unique). |
| conditions | no        | VariabilityConditionDefinition &#124; List(VariabilityConditionDefinition) | An optional Variability Condition. If a list is given, then the conditions are combined using the _and_ operation.  |

The following example contains the group `example_group` whose elements are the _Node Template_ `prod_database` and the _Requirement Assignment_ `prod_connects_to` of the _Node Template_ `application`.

```
example_group:
    type: tosca.groups.Root
    members: [prod_database, [application, prod_connects_to]]
    conditions: {get_variability_expression: is_prod}
```

## Boolean Operators

The following _Boolean Operators_ can be used inside a _Variability Expression_.

| Keyname | Input                   | Output  | Description |
| ------- | ----------------------- | ------- |--|
| and     | List(BooleanExpression) | Boolean | Evaluates if all values are `true`. |
| or      | List(BooleanExpression) | Boolean | Evaluates if at least one value is `true`. |
| not     | BooleanExpression       | Boolean | Negates the given value.  |
| xor     | List(BooleanExpression) | Boolean | Evaluates if exactly one value is `true`.  |

## Arithmetic Operators

The following _Arithmetic Operators_ can be used inside a _Variability Expression_.

| Keyname | Input                                       | Output  | Description                               |
| ------- | ------------------------------------------- | ------- |-------------------------------------------|
| add     | List(NumericExpression)                     | Numeric | Sums up given values.                     |
| sub     | List(NumericExpression)                     | Numeric | Subtracts values from the first one.      |
| mul     | List(NumericExpression)                     | Numeric | Multiplies given values.                  |
| div     | List(NumericExpression)                     | Numeric | Divides values from the first one.        |
| mod     | Tuple(NumericExpression, NumericExpression) | Numeric | Divides values and returns the remainder. |

## Intrinsic Functions

The following _Intrinsic Functions_ can be used inside a _Variability Expression_.

| Keyname                    | Input                                       | Output  | Description                                                                                             |
|----------------------------| ------------------------------------------- |---------|---------------------------------------------------------------------------------------------------------|
| get_variability_input      | String                                      | Any     | Returns the value of a Variability Input.                                                               |
| get_variability_expression | String                                      | Any     | Returns the value of the Variability Expression.                                                        |
| get_variability_condition  | String                                      | Boolean | Returns the value of the Variability Condition.                                                         |
| concat                     | List(ValueExpression)                       | String  | Concatenates the given values.                                                                          |
| join                       | Tuple(List(ValueExpression), String)        | String  | Joins the given values using the provided delimiter.                                                    |
| token                      | Tuple(ValueExpression, String, Number) | String  | Splits a given value by the provided delimiter and returns the element specified by the provided index. |

## Constraint Operators

The following _Constraint Operators_ can be used inside a _Variability Expression_.

| Keyname          | Input                                                                 | Output  | Description                                                           |
| ---------------- | --------------------------------------------------------------------- | ------- |-----------------------------------------------------------------------|
| equal            | List(ValueExpression)                                                 | Boolean | Evaluates if the given values are equal.                              |
| greater_than     | Tuple(NumericExpression, NumericExpression)                           | Boolean | Evaluates if the first value is greate than the second value.         |
| greater_or_equal | Tuple(NumericExpression, NumericExpression)                           | Boolean | Evaluates if the first value is greater or equal to the second value. |
| less_than        | Tuple(NumericExpression, NumericExpression)                           | Boolean | Evaluates if the first value is less than the second value.           |
| less_or_equal    | Tuple(NumericExpression, NumericExpression)                           | Boolean | Evaluates if the first value is less or equal to the second value.    |
| in_range         | Tuple(NumericExpression, Tuple(NumericExpression, NumericExpression)) | Boolean | Evaluates if the value is in a given range.                           |
| length           | Tuple(ValueExpression, NumericExpression)                             | Boolean | Evaluates if the value has a given length.                            |
| min_length       | Tuple(ValueExpression, NumericExpression)                             | Boolean | Evaluates if the value has a minimum length.                          |
| max_length       | Tuple(ValueExpression, NumericExpression)                             | Boolean | Evaluates if the value has a maximum length.                          |
