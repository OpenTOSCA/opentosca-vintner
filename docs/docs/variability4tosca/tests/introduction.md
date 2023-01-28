---
title: Introduction
---

# Variability4TOSCA Conformance Test Suite 1.0 Release Candidate

This is a conformance test suite for the Variability4TOSCA Specification 1.0 Release Candidate.
These tests can be used to evaluate Variability4TOSCA implementations.
Each test is described on a separate page.
The description includes a variable service template, variability inputs,
expected errors, expected variability-resolved service template and so on along with an explanation about the expected
processing.

| ID | Test |
| --- | --- |
| 1 | [Operator "add"](./test-arithmetic-operators-add.md) |
| 2 | [Operator "div"](./test-arithmetic-operators-div.md) |
| 3 | [Operator "mod" (Even)](./test-arithmetic-operators-mod-even.md) |
| 4 | [Operator "add" (Odd)](./test-arithmetic-operators-mod-odd.md) |
| 5 | [Operator "mul"](./test-arithmetic-operators-mul.md) |
| 6 | [Operator "sub"](./test-arithmetic-operators-sub.md) |
| 7 | [artifacts-conditional](./test-artifacts-conditional.md) |
| 8 | [artifacts-default-alternative](./test-artifacts-default-alternative.md) |
| 9 | [artifacts-default-alternative-false](./test-artifacts-default-alternative-false.md) |
| 10 | [artifacts-default-condition](./test-artifacts-default-condition.md) |
| 11 | [artifacts-throw-ambiguous-artifact](./test-artifacts-throw-ambiguous-artifact.md) |
| 12 | [artifacts-throw-ambiguous-default](./test-artifacts-throw-ambiguous-default.md) |
| 13 | [artifacts-throw-missing-artifact-parent](./test-artifacts-throw-missing-artifact-parent.md) |
| 14 | [Operator "and" Evaluates to "True" (Empty)](./test-boolean-operators-and-empty.md) |
| 15 | [Operator "and" Evaluates to "false"](./test-boolean-operators-and-false.md) |
| 16 | [Operator "and" Evaluates to "false" (Nested)](./test-boolean-operators-and-nested-false.md) |
| 17 | [Operator "and" Evaluates to "true"](./test-boolean-operators-and-nested-true.md) |
| 18 | [Operator "and"  Evaluates to "true" (Nested)](./test-boolean-operators-and-true.md) |
| 19 | [Operator "implies": false false -> true](./test-boolean-operators-implies-false-false-true.md) |
| 20 | [Operator "implies": false true -> true](./test-boolean-operators-implies-false-true-true.md) |
| 21 | [Operator "implies": true false -> false](./test-boolean-operators-implies-true-false-false.md) |
| 22 | [Operator "implies": true true -> true](./test-boolean-operators-implies-true-true-true.md) |
| 23 | [Operator "not" Evaluates to "false"](./test-boolean-operators-not-false.md) |
| 24 | [Operator "not" Evaluates to "true"](./test-boolean-operators-not-true.md) |
| 25 | [Operator "or" Evaluates to "False" (Empty)](./test-boolean-operators-or-empty.md) |
| 26 | [Operator "or" Evaluates to "False"](./test-boolean-operators-or-false.md) |
| 27 | [Operator "or" Evaluates to "true"](./test-boolean-operators-or-true.md) |
| 28 | [Operator "or" Evaluates to "true" (All "true")](./test-boolean-operators-or-true-all.md) |
| 29 | [Operator "xor": all false -> false](./test-boolean-operators-xor-false-all.md) |
| 30 | [Operator "xor": One ture -> true](./test-boolean-operators-xor-true.md) |
| 31 | [Operator "xor": all true -> false](./test-boolean-operators-xor-true-all.md) |
| 32 | [consistency-throw-hosting-relation-missing](./test-consistency-throw-hosting-relation-missing.md) |
| 33 | [consistency-throw-multiple-hosting-relations](./test-consistency-throw-multiple-hosting-relations.md) |
| 34 | [consistency-throw-relation-source-missing](./test-consistency-throw-relation-source-missing.md) |
| 35 | [consistency-throw-relation-target-missing](./test-consistency-throw-relation-target-missing.md) |
| 36 | [Operator "equal" Evaluates to "false"](./test-constraint-operators-equal-false.md) |
| 37 | [Operator "equal" Evaluates to "true"](./test-constraint-operators-equal-true.md) |
| 38 | [Operator "greater_or_equal" Evaluates to "true" (Greater)](./test-constraint-operators-greater-or-equal-equal.md) |
| 39 | [Operator "greater_or_equal" Evaluates to "true" (Equal)](./test-constraint-operators-greater-or-equal-greater.md) |
| 40 | [Operator "greater_or_equal" Evaluates to "false" (Less)](./test-constraint-operators-greater-or-equal-less.md) |
| 41 | [Operator "greater_than" Evaluates to "false" (Equal)](./test-constraint-operators-greater-than-equal.md) |
| 42 | [Operator "greater_than" Evaluates to "true" (Greater)](./test-constraint-operators-greater-than-greater.md) |
| 43 | [Operator "greater_than" Evaluates to "false" (Less)](./test-constraint-operators-greater-than-less.md) |
| 44 | [Operator "in_range" Evaluates to "false"](./test-constraint-operators-in_range_false.md) |
| 45 | [Operator "in_range" Evaluates to "true"](./test-constraint-operators-in_range_true.md) |
| 46 | [Operator "length" Evaluates to "false"](./test-constraint-operators-length_false.md) |
| 47 | [Operator "length" Evaluates to "true"](./test-constraint-operators-length_true.md) |
| 48 | [Operator "less_or_equal" Evaluates to "true" (Equal)](./test-constraint-operators-less_or_equal_equal.md) |
| 49 | [Operator "less_or_equal" Evaluates to "false" (Greater)](./test-constraint-operators-less_or_equal_greater.md) |
| 50 | [Operator "less_or_equal" Evaluates to "true" (Less)](./test-constraint-operators-less_or_equal_less.md) |
| 51 | [Operator "less_than" Evaluates to "false" (Equal)](./test-constraint-operators-less_than_equal.md) |
| 52 | [Operator "less_than" Evaluates to "false" (Greater)](./test-constraint-operators-less_than_greater.md) |
| 53 | [Operator "less_than" Evaluates to "true" (Less)](./test-constraint-operators-less_than_less.md) |
| 54 | [Operator "max_length" Evaluates to "true" (Equal)](./test-constraint-operators-max_length_equal.md) |
| 55 | [Operator "max_length" Evaluates to "false" (Greater)](./test-constraint-operators-max_length_greater.md) |
| 56 | [Operator "max_length" Evaluates to "true" (Less)](./test-constraint-operators-max_length_less.md) |
| 57 | [Operator "min_length" Evaluates to "true" (Equal)](./test-constraint-operators-min_length_equal.md) |
| 58 | [Operator "min_length" Evaluates to "true" (Greater)](./test-constraint-operators-min_length_greater.md) |
| 59 | [Operator "min_length" Evaluates to "false" (Less)](./test-constraint-operators-min_length_less.md) |
| 60 | [Operator "valid_values" Evaluates to "false"](./test-constraint-operators-valid_values_false.md) |
| 61 | [Operator "valid_values" Evaluates to "true"](./test-constraint-operators-valid_values_true.md) |
| 62 | [Conditional Group](./test-groups-conditional.md) |
| 63 | [groups-default-condition](./test-groups-default-condition.md) |
| 64 | [groups-default-condition-nothing](./test-groups-default-condition-nothing.md) |
| 65 | [inputs-conditional](./test-inputs-conditional.md) |
| 66 | [inputs-conditional-list](./test-inputs-conditional-list.md) |
| 67 | [nodes-conditional](./test-nodes-conditional.md) |
| 68 | [nodes-get-node-presence-absent](./test-nodes-get-node-presence-absent.md) |
| 69 | [nodes-get-node-presence-present](./test-nodes-get-node-presence-present.md) |
| 70 | [Benchmark](./test-other-benchmark.md) |
| 71 | [Operator "concat"](./test-other-concat.md) |
| 72 | [Get Variability Condition](./test-other-get-variability-condition.md) |
| 73 | [Get Variability Expression](./test-other-get-variability-expression.md) |
| 74 | [Get Variability Input](./test-other-get-variability-input.md) |
| 75 | [Operator "concat"](./test-other-join.md) |
| 76 | [other-nothing](./test-other-nothing.md) |
| 77 | [other-preset](./test-other-preset.md) |
| 78 | [Operator "concat"](./test-other-token.md) |
| 79 | [other-version](./test-other-version.md) |
| 80 | [policies-conditional](./test-policies-conditional.md) |
| 81 | [policies-default-condition](./test-policies-default-condition.md) |
| 82 | [policies-default-condition-nothing](./test-policies-default-condition-nothing.md) |
| 83 | [Policy Targets Absent Members](./test-policies-has-present-targets-absent-members.md) |
| 84 | [Policy Targets Absent Nodes](./test-policies-has-present-targets-absent-nodes.md) |
| 85 | [Policy Has No Targets](./test-policies-has-present-targets-no-targets.md) |
| 86 | [Policy Targets Present Member](./test-policies-has-present-targets-present-member.md) |
| 87 | [Policy Targets One Present Node](./test-policies-has-present-targets-present-node.md) |
| 88 | [Policy Targets Present Nodes](./test-policies-has-present-targets-present-nodes.md) |
| 89 | [properties-conditional](./test-properties-conditional.md) |
| 90 | [properties-default-alternative](./test-properties-default-alternative.md) |
| 91 | [properties-default-alternative-false](./test-properties-default-alternative-false.md) |
| 92 | [properties-default-condition](./test-properties-default-condition.md) |
| 93 | [properties-expression](./test-properties-expression.md) |
| 94 | [properties-list](./test-properties-list.md) |
| 95 | [properties-list-another](./test-properties-list-another.md) |
| 96 | [properties-map](./test-properties-map.md) |
| 97 | [properties-map-another](./test-properties-map-another.md) |
| 98 | [properties-throw-ambiguous-property](./test-properties-throw-ambiguous-property.md) |
| 99 | [properties-throw-missing-property-parent](./test-properties-throw-missing-property-parent.md) |
| 100 | [properties-throw-multiple-default](./test-properties-throw-multiple-default.md) |
| 101 | [relationships-conditional](./test-relationships-conditional.md) |
| 102 | [relationships-throw-multiple](./test-relationships-throw-multiple.md) |
| 103 | [relationships-throw-undefined](./test-relationships-throw-undefined.md) |
| 104 | [relationships-throw-unused](./test-relationships-throw-unused.md) |
| 105 | [requirement-assignment-conditional](./test-requirement-assignment-conditional.md) |
| 106 | [requirement-assignment-default-alternative](./test-requirement-assignment-default-alternative.md) |
| 107 | [requirement-assignment-default-alternative-false](./test-requirement-assignment-default-alternative-false.md) |
| 108 | [requirement-assignment-default-condition](./test-requirement-assignment-default-condition.md) |
| 109 | [requirement-assignment-default-condition-throw](./test-requirement-assignment-default-condition-throw.md) |
| 110 | [requirement-assignment-get-relation-presence-index-absent](./test-requirement-assignment-get-relation-presence-index-absent.md) |
| 111 | [requirement-assignment-get-relation-presence-name-absent](./test-requirement-assignment-get-relation-presence-name-absent.md) |
| 112 | [requirement-assignment-get-source-presence-absent](./test-requirement-assignment-get-source-presence-absent.md) |
| 113 | [requirement-assignment-get-source-presence-present](./test-requirement-assignment-get-source-presence-present.md) |
| 114 | [requirement-assignment-get-target-presence-absent](./test-requirement-assignment-get-target-presence-absent.md) |
| 115 | [requirement-assignment-get-target-presence-present](./test-requirement-assignment-get-target-presence-present.md) |
| 116 | [requirement-assignment-one-hosting-relation](./test-requirement-assignment-one-hosting-relation.md) |
| 117 | [requirement-assignment-throw-multiple-defaults](./test-requirement-assignment-throw-multiple-defaults.md) |

