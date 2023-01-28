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
| 1 | [Operator &#34;add&#34;](./test-arithmetic-operators-add.md) |
| 2 | [Operator &#34;div&#34;](./test-arithmetic-operators-div.md) |
| 3 | [Operator &#34;mod&#34; (Even)](./test-arithmetic-operators-mod-even.md) |
| 4 | [Operator &#34;add&#34; (Odd)](./test-arithmetic-operators-mod-odd.md) |
| 5 | [Operator &#34;mul&#34;](./test-arithmetic-operators-mul.md) |
| 6 | [Operator &#34;sub&#34;](./test-arithmetic-operators-sub.md) |
| 7 | [artifacts-conditional](./test-artifacts-conditional.md) |
| 8 | [artifacts-default-alternative](./test-artifacts-default-alternative.md) |
| 9 | [artifacts-default-alternative-false](./test-artifacts-default-alternative-false.md) |
| 10 | [artifacts-default-condition](./test-artifacts-default-condition.md) |
| 11 | [artifacts-throw-ambiguous-artifact](./test-artifacts-throw-ambiguous-artifact.md) |
| 12 | [artifacts-throw-ambiguous-default](./test-artifacts-throw-ambiguous-default.md) |
| 13 | [artifacts-throw-missing-artifact-parent](./test-artifacts-throw-missing-artifact-parent.md) |
| 14 | [Operator &#34;and&#34; Evaluates to &#34;True&#34; (Empty)](./test-boolean-operators-and-empty.md) |
| 15 | [Operator &#34;and&#34; Evaluates to &#34;false&#34;](./test-boolean-operators-and-false.md) |
| 16 | [Operator &#34;and&#34; Evaluates to &#34;false&#34; (Nested)](./test-boolean-operators-and-nested-false.md) |
| 17 | [Operator &#34;and&#34; Evaluates to &#34;true&#34;](./test-boolean-operators-and-nested-true.md) |
| 18 | [Operator &#34;and&#34;  Evaluates to &#34;true&#34; (Nested)](./test-boolean-operators-and-true.md) |
| 19 | [Operator &#34;implies&#34;: false false -&gt; true](./test-boolean-operators-implies-false-false-true.md) |
| 20 | [Operator &#34;implies&#34;: false true -&gt; true](./test-boolean-operators-implies-false-true-true.md) |
| 21 | [Operator &#34;implies&#34;: true false -&gt; false](./test-boolean-operators-implies-true-false-false.md) |
| 22 | [Operator &#34;implies&#34;: true true -&gt; true](./test-boolean-operators-implies-true-true-true.md) |
| 23 | [Operator &#34;not&#34; Evaluates to &#34;false&#34;](./test-boolean-operators-not-false.md) |
| 24 | [Operator &#34;not&#34; Evaluates to &#34;true&#34;](./test-boolean-operators-not-true.md) |
| 25 | [Operator &#34;or&#34; Evaluates to &#34;False&#34; (Empty)](./test-boolean-operators-or-empty.md) |
| 26 | [Operator &#34;or&#34; Evaluates to &#34;False&#34;](./test-boolean-operators-or-false.md) |
| 27 | [Operator &#34;or&#34; Evaluates to &#34;true&#34;](./test-boolean-operators-or-true.md) |
| 28 | [Operator &#34;or&#34; Evaluates to &#34;true&#34; (All &#34;true&#34;)](./test-boolean-operators-or-true-all.md) |
| 29 | [Operator &#34;xor&#34;: all false -&gt; false](./test-boolean-operators-xor-false-all.md) |
| 30 | [Operator &#34;xor&#34;: One ture -&gt; true](./test-boolean-operators-xor-true.md) |
| 31 | [Operator &#34;xor&#34;: all true -&gt; false](./test-boolean-operators-xor-true-all.md) |
| 32 | [consistency-throw-hosting-relation-missing](./test-consistency-throw-hosting-relation-missing.md) |
| 33 | [consistency-throw-multiple-hosting-relations](./test-consistency-throw-multiple-hosting-relations.md) |
| 34 | [consistency-throw-relation-source-missing](./test-consistency-throw-relation-source-missing.md) |
| 35 | [consistency-throw-relation-target-missing](./test-consistency-throw-relation-target-missing.md) |
| 36 | [Conditional Group](./test-groups-conditional.md) |
| 37 | [groups-default-condition](./test-groups-default-condition.md) |
| 38 | [groups-default-condition-nothing](./test-groups-default-condition-nothing.md) |
| 39 | [inputs-conditional](./test-inputs-conditional.md) |
| 40 | [inputs-conditional-list](./test-inputs-conditional-list.md) |
| 41 | [nodes-conditional](./test-nodes-conditional.md) |
| 42 | [nodes-get-node-presence-absent](./test-nodes-get-node-presence-absent.md) |
| 43 | [nodes-get-node-presence-present](./test-nodes-get-node-presence-present.md) |
| 44 | [other-benchmark](./test-other-benchmark.md) |
| 45 | [Operator &#34;concat&#34;](./test-other-concat.md) |
| 46 | [Get Variability Condition](./test-other-get-variability-condition.md) |
| 47 | [Get Variability Expression](./test-other-get-variability-expression.md) |
| 48 | [Get Variability Input](./test-other-get-variability-input.md) |
| 49 | [Operator &#34;concat&#34;](./test-other-join.md) |
| 50 | [other-nothing](./test-other-nothing.md) |
| 51 | [other-preset](./test-other-preset.md) |
| 52 | [Operator &#34;concat&#34;](./test-other-token.md) |
| 53 | [other-version](./test-other-version.md) |
| 54 | [policies-conditional](./test-policies-conditional.md) |
| 55 | [policies-default-condition](./test-policies-default-condition.md) |
| 56 | [policies-default-condition-nothing](./test-policies-default-condition-nothing.md) |
| 57 | [Policy Targets Absent Members](./test-policies-has-present-targets-absent-members.md) |
| 58 | [Policy Targets Absent Nodes](./test-policies-has-present-targets-absent-nodes.md) |
| 59 | [Policy Has No Targets](./test-policies-has-present-targets-no-targets.md) |
| 60 | [Policy Targets Present Member](./test-policies-has-present-targets-present-member.md) |
| 61 | [Policy Targets One Present Node](./test-policies-has-present-targets-present-node.md) |
| 62 | [Policy Targets Present Nodes](./test-policies-has-present-targets-present-nodes.md) |
| 63 | [properties-conditional](./test-properties-conditional.md) |
| 64 | [properties-default-alternative](./test-properties-default-alternative.md) |
| 65 | [properties-default-alternative-false](./test-properties-default-alternative-false.md) |
| 66 | [properties-default-condition](./test-properties-default-condition.md) |
| 67 | [properties-expression](./test-properties-expression.md) |
| 68 | [properties-list](./test-properties-list.md) |
| 69 | [properties-list-another](./test-properties-list-another.md) |
| 70 | [properties-map](./test-properties-map.md) |
| 71 | [properties-map-another](./test-properties-map-another.md) |
| 72 | [properties-throw-ambiguous-property](./test-properties-throw-ambiguous-property.md) |
| 73 | [properties-throw-missing-property-parent](./test-properties-throw-missing-property-parent.md) |
| 74 | [properties-throw-multiple-default](./test-properties-throw-multiple-default.md) |
| 75 | [relationships-conditional](./test-relationships-conditional.md) |
| 76 | [relationships-throw-multiple](./test-relationships-throw-multiple.md) |
| 77 | [relationships-throw-undefined](./test-relationships-throw-undefined.md) |
| 78 | [relationships-throw-unused](./test-relationships-throw-unused.md) |
| 79 | [requirement-assignment-conditional](./test-requirement-assignment-conditional.md) |
| 80 | [requirement-assignment-default-alternative](./test-requirement-assignment-default-alternative.md) |
| 81 | [requirement-assignment-default-alternative-false](./test-requirement-assignment-default-alternative-false.md) |
| 82 | [requirement-assignment-default-condition](./test-requirement-assignment-default-condition.md) |
| 83 | [requirement-assignment-default-condition-throw](./test-requirement-assignment-default-condition-throw.md) |
| 84 | [requirement-assignment-get-relation-presence-index-absent](./test-requirement-assignment-get-relation-presence-index-absent.md) |
| 85 | [requirement-assignment-get-relation-presence-name-absent](./test-requirement-assignment-get-relation-presence-name-absent.md) |
| 86 | [requirement-assignment-get-source-presence-absent](./test-requirement-assignment-get-source-presence-absent.md) |
| 87 | [requirement-assignment-get-source-presence-present](./test-requirement-assignment-get-source-presence-present.md) |
| 88 | [requirement-assignment-get-target-presence-absent](./test-requirement-assignment-get-target-presence-absent.md) |
| 89 | [requirement-assignment-get-target-presence-present](./test-requirement-assignment-get-target-presence-present.md) |
| 90 | [requirement-assignment-one-hosting-relation](./test-requirement-assignment-one-hosting-relation.md) |
| 91 | [requirement-assignment-throw-multiple-defaults](./test-requirement-assignment-throw-multiple-defaults.md) |

