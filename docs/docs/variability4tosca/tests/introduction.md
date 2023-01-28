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
| 8 | [Operator &#34;and&#34; Evaluates to &#34;True&#34; (Empty)](./test-boolean-operators-and-empty.md) |
| 9 | [Operator &#34;and&#34; Evaluates to &#34;false&#34;](./test-boolean-operators-and-false.md) |
| 10 | [Operator &#34;and&#34; Evaluates to &#34;false&#34; (Nested)](./test-boolean-operators-and-nested-false.md) |
| 11 | [Operator &#34;and&#34; Evaluates to &#34;true&#34;](./test-boolean-operators-and-nested-true.md) |
| 12 | [Operator &#34;and&#34;  Evaluates to &#34;true&#34; (Nested)](./test-boolean-operators-and-true.md) |
| 13 | [Operator &#34;implies&#34;: false false -&gt; true](./test-boolean-operators-implies-false-false-true.md) |
| 14 | [Operator &#34;implies&#34;: false true -&gt; true](./test-boolean-operators-implies-false-true-true.md) |
| 15 | [Operator &#34;implies&#34;: true false -&gt; false](./test-boolean-operators-implies-true-false-false.md) |
| 16 | [Operator &#34;implies&#34;: true true -&gt; true](./test-boolean-operators-implies-true-true-true.md) |
| 17 | [Operator &#34;not&#34; Evaluates to &#34;false&#34;](./test-boolean-operators-not-false.md) |
| 18 | [Operator &#34;not&#34; Evaluates to &#34;true&#34;](./test-boolean-operators-not-true.md) |
| 19 | [Operator &#34;or&#34; Evaluates to &#34;False&#34; (Empty)](./test-boolean-operators-or-empty.md) |
| 20 | [Operator &#34;or&#34; Evaluates to &#34;False&#34;](./test-boolean-operators-or-false.md) |
| 21 | [Operator &#34;or&#34; Evaluates to &#34;true&#34;](./test-boolean-operators-or-true.md) |
| 22 | [Operator &#34;or&#34; Evaluates to &#34;true&#34; (All &#34;true&#34;)](./test-boolean-operators-or-true-all.md) |
| 23 | [Operator &#34;xor&#34;: all false -&gt; false](./test-boolean-operators-xor-false-all.md) |
| 24 | [Operator &#34;xor&#34;: One ture -&gt; true](./test-boolean-operators-xor-true.md) |
| 25 | [Operator &#34;xor&#34;: all true -&gt; false](./test-boolean-operators-xor-true-all.md) |
| 26 | [consistency-throw-hosting-relation-missing](./test-consistency-throw-hosting-relation-missing.md) |
| 27 | [consistency-throw-multiple-hosting-relations](./test-consistency-throw-multiple-hosting-relations.md) |
| 28 | [consistency-throw-relation-source-missing](./test-consistency-throw-relation-source-missing.md) |
| 29 | [consistency-throw-relation-target-missing](./test-consistency-throw-relation-target-missing.md) |
| 30 | [Conditional Group](./test-groups-conditional.md) |
| 31 | [groups-default-condition](./test-groups-default-condition.md) |
| 32 | [groups-default-condition-nothing](./test-groups-default-condition-nothing.md) |
| 33 | [inputs-conditional](./test-inputs-conditional.md) |
| 34 | [inputs-conditional-list](./test-inputs-conditional-list.md) |
| 35 | [nodes-conditional](./test-nodes-conditional.md) |
| 36 | [nodes-get-node-presence-absent](./test-nodes-get-node-presence-absent.md) |
| 37 | [nodes-get-node-presence-present](./test-nodes-get-node-presence-present.md) |
| 38 | [other-benchmark](./test-other-benchmark.md) |
| 39 | [Get Variability Condition](./test-other-get-variability-condition.md) |
| 40 | [Get Variability Expression](./test-other-get-variability-expression.md) |
| 41 | [Get Variability Input](./test-other-get-variability-input.md) |
| 42 | [other-nothing](./test-other-nothing.md) |
| 43 | [other-preset](./test-other-preset.md) |
| 44 | [other-version](./test-other-version.md) |
| 45 | [policies-conditional](./test-policies-conditional.md) |
| 46 | [policies-default-condition](./test-policies-default-condition.md) |
| 47 | [policies-default-condition-nothing](./test-policies-default-condition-nothing.md) |
| 48 | [Policy Targets Absent Members](./test-policies-has-present-targets-absent-members.md) |
| 49 | [Policy Targets Absent Nodes](./test-policies-has-present-targets-absent-nodes.md) |
| 50 | [Policy Has No Targets](./test-policies-has-present-targets-no-targets.md) |
| 51 | [Policy Targets Present Member](./test-policies-has-present-targets-present-member.md) |
| 52 | [Policy Targets One Present Node](./test-policies-has-present-targets-present-node.md) |
| 53 | [Policy Targets Present Nodes](./test-policies-has-present-targets-present-nodes.md) |
| 54 | [properties-conditional](./test-properties-conditional.md) |
| 55 | [properties-default-alternative](./test-properties-default-alternative.md) |
| 56 | [properties-default-alternative-false](./test-properties-default-alternative-false.md) |
| 57 | [properties-default-condition](./test-properties-default-condition.md) |
| 58 | [properties-expression](./test-properties-expression.md) |
| 59 | [properties-list](./test-properties-list.md) |
| 60 | [properties-list-another](./test-properties-list-another.md) |
| 61 | [properties-map](./test-properties-map.md) |
| 62 | [properties-map-another](./test-properties-map-another.md) |
| 63 | [properties-throw-ambiguous-property](./test-properties-throw-ambiguous-property.md) |
| 64 | [properties-throw-missing-property-parent](./test-properties-throw-missing-property-parent.md) |
| 65 | [properties-throw-multiple-default](./test-properties-throw-multiple-default.md) |
| 66 | [relationships-conditional](./test-relationships-conditional.md) |
| 67 | [relationships-throw-multiple](./test-relationships-throw-multiple.md) |
| 68 | [relationships-throw-undefined](./test-relationships-throw-undefined.md) |
| 69 | [relationships-throw-unused](./test-relationships-throw-unused.md) |
| 70 | [requirement-assignment-conditional](./test-requirement-assignment-conditional.md) |
| 71 | [requirement-assignment-default-alternative](./test-requirement-assignment-default-alternative.md) |
| 72 | [requirement-assignment-default-alternative-false](./test-requirement-assignment-default-alternative-false.md) |
| 73 | [requirement-assignment-default-condition](./test-requirement-assignment-default-condition.md) |
| 74 | [requirement-assignment-default-condition-throw](./test-requirement-assignment-default-condition-throw.md) |
| 75 | [requirement-assignment-get-relation-presence-index-absent](./test-requirement-assignment-get-relation-presence-index-absent.md) |
| 76 | [requirement-assignment-get-relation-presence-name-absent](./test-requirement-assignment-get-relation-presence-name-absent.md) |
| 77 | [requirement-assignment-get-source-presence-absent](./test-requirement-assignment-get-source-presence-absent.md) |
| 78 | [requirement-assignment-get-source-presence-present](./test-requirement-assignment-get-source-presence-present.md) |
| 79 | [requirement-assignment-get-target-presence-absent](./test-requirement-assignment-get-target-presence-absent.md) |
| 80 | [requirement-assignment-get-target-presence-present](./test-requirement-assignment-get-target-presence-present.md) |
| 81 | [requirement-assignment-one-hosting-relation](./test-requirement-assignment-one-hosting-relation.md) |
| 82 | [requirement-assignment-throw-multiple-defaults](./test-requirement-assignment-throw-multiple-defaults.md) |

