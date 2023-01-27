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
| 8 | [consistency-throw-hosting-relation-missing](./test-consistency-throw-hosting-relation-missing.md) |
| 9 | [consistency-throw-multiple-hosting-relations](./test-consistency-throw-multiple-hosting-relations.md) |
| 10 | [consistency-throw-relation-source-missing](./test-consistency-throw-relation-source-missing.md) |
| 11 | [consistency-throw-relation-target-missing](./test-consistency-throw-relation-target-missing.md) |
| 12 | [expressions---only-and-and-tf-t-f](./test-expressions---only-and-and-tf-t-f.md) |
| 13 | [expressions---only-and-and-tt-t-t](./test-expressions---only-and-and-tt-t-t.md) |
| 14 | [expressions---only-and-empty-true](./test-expressions---only-and-empty-true.md) |
| 15 | [expressions---only-and-tftt-f](./test-expressions---only-and-tftt-f.md) |
| 16 | [expressions---only-and-tttt-t](./test-expressions---only-and-tttt-t.md) |
| 17 | [expressions---only-get-node-presence-absent](./test-expressions---only-get-node-presence-absent.md) |
| 18 | [expressions---only-get-node-presence-present](./test-expressions---only-get-node-presence-present.md) |
| 19 | [expressions---only-get-relation-presence-index-absent](./test-expressions---only-get-relation-presence-index-absent.md) |
| 20 | [expressions---only-get-relation-presence-name-absent](./test-expressions---only-get-relation-presence-name-absent.md) |
| 21 | [expressions---only-get-source-presence-absent](./test-expressions---only-get-source-presence-absent.md) |
| 22 | [expressions---only-get-source-presence-present](./test-expressions---only-get-source-presence-present.md) |
| 23 | [expressions---only-get-target-presence-absent](./test-expressions---only-get-target-presence-absent.md) |
| 24 | [expressions---only-get-target-presence-present](./test-expressions---only-get-target-presence-present.md) |
| 25 | [expressions---only-get-variability-condition](./test-expressions---only-get-variability-condition.md) |
| 26 | [expressions---only-get-variability-expression](./test-expressions---only-get-variability-expression.md) |
| 27 | [expressions---only-get-variability-input](./test-expressions---only-get-variability-input.md) |
| 28 | [Policy Targets Absent Members](./test-expressions---only-has-present-targets-absent-members.md) |
| 29 | [Policy Targets Absent Nodes](./test-expressions---only-has-present-targets-absent-nodes.md) |
| 30 | [Policy Has No Targets](./test-expressions---only-has-present-targets-no-targets.md) |
| 31 | [Policy Targets Present Member](./test-expressions---only-has-present-targets-present-member.md) |
| 32 | [Policy Targets One Present Node](./test-expressions---only-has-present-targets-present-node.md) |
| 33 | [Policy Targets Present Nodes](./test-expressions---only-has-present-targets-present-nodes.md) |
| 34 | [Conditional Group](./test-groups-conditional.md) |
| 35 | [groups-default-condition](./test-groups-default-condition.md) |
| 36 | [groups-default-condition-nothing](./test-groups-default-condition-nothing.md) |
| 37 | [inputs-conditional](./test-inputs-conditional.md) |
| 38 | [inputs-conditional-list](./test-inputs-conditional-list.md) |
| 39 | [nodes-conditional](./test-nodes-conditional.md) |
| 40 | [other-benchmark](./test-other-benchmark.md) |
| 41 | [other-nothing](./test-other-nothing.md) |
| 42 | [other-preset](./test-other-preset.md) |
| 43 | [other-version](./test-other-version.md) |
| 44 | [policies-conditional](./test-policies-conditional.md) |
| 45 | [policies-default-condition](./test-policies-default-condition.md) |
| 46 | [policies-default-condition-nothing](./test-policies-default-condition-nothing.md) |
| 47 | [properties-conditional](./test-properties-conditional.md) |
| 48 | [properties-default-alternative](./test-properties-default-alternative.md) |
| 49 | [properties-default-alternative-false](./test-properties-default-alternative-false.md) |
| 50 | [properties-default-condition](./test-properties-default-condition.md) |
| 51 | [properties-expression](./test-properties-expression.md) |
| 52 | [properties-list](./test-properties-list.md) |
| 53 | [properties-list-another](./test-properties-list-another.md) |
| 54 | [properties-map](./test-properties-map.md) |
| 55 | [properties-map-another](./test-properties-map-another.md) |
| 56 | [properties-throw-ambiguous-property](./test-properties-throw-ambiguous-property.md) |
| 57 | [properties-throw-missing-property-parent](./test-properties-throw-missing-property-parent.md) |
| 58 | [properties-throw-multiple-default](./test-properties-throw-multiple-default.md) |
| 59 | [relationships-conditional](./test-relationships-conditional.md) |
| 60 | [relationships-throw-multiple](./test-relationships-throw-multiple.md) |
| 61 | [relationships-throw-undefined](./test-relationships-throw-undefined.md) |
| 62 | [relationships-throw-unused](./test-relationships-throw-unused.md) |
| 63 | [requirement-assignment-conditional](./test-requirement-assignment-conditional.md) |
| 64 | [requirement-assignment-default-alternative](./test-requirement-assignment-default-alternative.md) |
| 65 | [requirement-assignment-default-alternative-false](./test-requirement-assignment-default-alternative-false.md) |
| 66 | [requirement-assignment-default-condition](./test-requirement-assignment-default-condition.md) |
| 67 | [requirement-assignment-default-condition-throw](./test-requirement-assignment-default-condition-throw.md) |
| 68 | [requirement-assignment-one-hosting-relation](./test-requirement-assignment-one-hosting-relation.md) |
| 69 | [requirement-assignment-throw-multiple-defaults](./test-requirement-assignment-throw-multiple-defaults.md) |

