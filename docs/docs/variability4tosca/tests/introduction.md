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
| 1 | [artifacts-conditional](./test-artifacts-conditional.md) |
| 2 | [artifacts-default-alternative](./test-artifacts-default-alternative.md) |
| 3 | [artifacts-default-alternative-false](./test-artifacts-default-alternative-false.md) |
| 4 | [artifacts-default-condition](./test-artifacts-default-condition.md) |
| 5 | [artifacts-throw-ambiguous-artifact](./test-artifacts-throw-ambiguous-artifact.md) |
| 6 | [artifacts-throw-ambiguous-default](./test-artifacts-throw-ambiguous-default.md) |
| 7 | [artifacts-throw-missing-artifact-parent](./test-artifacts-throw-missing-artifact-parent.md) |
| 8 | [Operator &#34;and&#34; Evaluates to &#34;True&#34; (Empty)](./test-boolean-operators---only-and-empty.md) |
| 9 | [Operator &#34;and&#34; Evaluates to &#34;false&#34;](./test-boolean-operators---only-and-false.md) |
| 10 | [Operator &#34;and&#34; Evaluates to &#34;false&#34; (Nested)](./test-boolean-operators---only-and-nested-false.md) |
| 11 | [Operator &#34;and&#34; Evaluates to &#34;true&#34;](./test-boolean-operators---only-and-nested-true.md) |
| 12 | [Operator &#34;and&#34;  Evaluates to &#34;true&#34; (Nested)](./test-boolean-operators---only-and-true.md) |
| 13 | [consistency-throw-hosting-relation-missing](./test-consistency-throw-hosting-relation-missing.md) |
| 14 | [consistency-throw-multiple-hosting-relations](./test-consistency-throw-multiple-hosting-relations.md) |
| 15 | [consistency-throw-relation-source-missing](./test-consistency-throw-relation-source-missing.md) |
| 16 | [consistency-throw-relation-target-missing](./test-consistency-throw-relation-target-missing.md) |
| 17 | [Conditional Group](./test-groups-conditional.md) |
| 18 | [groups-default-condition](./test-groups-default-condition.md) |
| 19 | [groups-default-condition-nothing](./test-groups-default-condition-nothing.md) |
| 20 | [inputs-conditional](./test-inputs-conditional.md) |
| 21 | [inputs-conditional-list](./test-inputs-conditional-list.md) |
| 22 | [nodes-conditional](./test-nodes-conditional.md) |
| 23 | [nodes-get-node-presence-absent](./test-nodes-get-node-presence-absent.md) |
| 24 | [nodes-get-node-presence-present](./test-nodes-get-node-presence-present.md) |
| 25 | [other-benchmark](./test-other-benchmark.md) |
| 26 | [Get Variability Condition](./test-other-get-variability-condition.md) |
| 27 | [Get Variability Expression](./test-other-get-variability-expression.md) |
| 28 | [Get Variability Input](./test-other-get-variability-input.md) |
| 29 | [other-nothing](./test-other-nothing.md) |
| 30 | [other-preset](./test-other-preset.md) |
| 31 | [other-version](./test-other-version.md) |
| 32 | [policies-conditional](./test-policies-conditional.md) |
| 33 | [policies-default-condition](./test-policies-default-condition.md) |
| 34 | [policies-default-condition-nothing](./test-policies-default-condition-nothing.md) |
| 35 | [Policy Targets Absent Members](./test-policies-has-present-targets-absent-members.md) |
| 36 | [Policy Targets Absent Nodes](./test-policies-has-present-targets-absent-nodes.md) |
| 37 | [Policy Has No Targets](./test-policies-has-present-targets-no-targets.md) |
| 38 | [Policy Targets Present Member](./test-policies-has-present-targets-present-member.md) |
| 39 | [Policy Targets One Present Node](./test-policies-has-present-targets-present-node.md) |
| 40 | [Policy Targets Present Nodes](./test-policies-has-present-targets-present-nodes.md) |
| 41 | [properties-conditional](./test-properties-conditional.md) |
| 42 | [properties-default-alternative](./test-properties-default-alternative.md) |
| 43 | [properties-default-alternative-false](./test-properties-default-alternative-false.md) |
| 44 | [properties-default-condition](./test-properties-default-condition.md) |
| 45 | [properties-expression](./test-properties-expression.md) |
| 46 | [properties-list](./test-properties-list.md) |
| 47 | [properties-list-another](./test-properties-list-another.md) |
| 48 | [properties-map](./test-properties-map.md) |
| 49 | [properties-map-another](./test-properties-map-another.md) |
| 50 | [properties-throw-ambiguous-property](./test-properties-throw-ambiguous-property.md) |
| 51 | [properties-throw-missing-property-parent](./test-properties-throw-missing-property-parent.md) |
| 52 | [properties-throw-multiple-default](./test-properties-throw-multiple-default.md) |
| 53 | [relationships-conditional](./test-relationships-conditional.md) |
| 54 | [relationships-throw-multiple](./test-relationships-throw-multiple.md) |
| 55 | [relationships-throw-undefined](./test-relationships-throw-undefined.md) |
| 56 | [relationships-throw-unused](./test-relationships-throw-unused.md) |
| 57 | [requirement-assignment-conditional](./test-requirement-assignment-conditional.md) |
| 58 | [requirement-assignment-default-alternative](./test-requirement-assignment-default-alternative.md) |
| 59 | [requirement-assignment-default-alternative-false](./test-requirement-assignment-default-alternative-false.md) |
| 60 | [requirement-assignment-default-condition](./test-requirement-assignment-default-condition.md) |
| 61 | [requirement-assignment-default-condition-throw](./test-requirement-assignment-default-condition-throw.md) |
| 62 | [requirement-assignment-get-relation-presence-index-absent](./test-requirement-assignment-get-relation-presence-index-absent.md) |
| 63 | [requirement-assignment-get-relation-presence-name-absent](./test-requirement-assignment-get-relation-presence-name-absent.md) |
| 64 | [requirement-assignment-get-source-presence-absent](./test-requirement-assignment-get-source-presence-absent.md) |
| 65 | [requirement-assignment-get-source-presence-present](./test-requirement-assignment-get-source-presence-present.md) |
| 66 | [requirement-assignment-get-target-presence-absent](./test-requirement-assignment-get-target-presence-absent.md) |
| 67 | [requirement-assignment-get-target-presence-present](./test-requirement-assignment-get-target-presence-present.md) |
| 68 | [requirement-assignment-one-hosting-relation](./test-requirement-assignment-one-hosting-relation.md) |
| 69 | [requirement-assignment-throw-multiple-defaults](./test-requirement-assignment-throw-multiple-defaults.md) |

