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
| 28 | [expressions---only-has-present-targets-empty](./test-expressions---only-has-present-targets-empty.md) |
| 29 | [expressions---only-has-present-targets-ffff-t](./test-expressions---only-has-present-targets-ffff-t.md) |
| 30 | [expressions---only-has-present-targets-ffft-f](./test-expressions---only-has-present-targets-ffft-f.md) |
| 31 | [expressions---only-has-present-targets-tf-t](./test-expressions---only-has-present-targets-tf-t.md) |
| 32 | [Conditional Group](./test-groups-conditional.md) |
| 33 | [groups-default-condition](./test-groups-default-condition.md) |
| 34 | [groups-default-condition-nothing](./test-groups-default-condition-nothing.md) |
| 35 | [inputs-conditional](./test-inputs-conditional.md) |
| 36 | [inputs-conditional-list](./test-inputs-conditional-list.md) |
| 37 | [nodes-conditional](./test-nodes-conditional.md) |
| 38 | [other-benchmark](./test-other-benchmark.md) |
| 39 | [other-nothing](./test-other-nothing.md) |
| 40 | [other-preset](./test-other-preset.md) |
| 41 | [other-version](./test-other-version.md) |
| 42 | [policies-conditional](./test-policies-conditional.md) |
| 43 | [policies-default-condition](./test-policies-default-condition.md) |
| 44 | [policies-default-condition-nothing](./test-policies-default-condition-nothing.md) |
| 45 | [properties-conditional](./test-properties-conditional.md) |
| 46 | [properties-default-alternative](./test-properties-default-alternative.md) |
| 47 | [properties-default-alternative-false](./test-properties-default-alternative-false.md) |
| 48 | [properties-default-condition](./test-properties-default-condition.md) |
| 49 | [properties-expression](./test-properties-expression.md) |
| 50 | [properties-list](./test-properties-list.md) |
| 51 | [properties-list-another](./test-properties-list-another.md) |
| 52 | [properties-map](./test-properties-map.md) |
| 53 | [properties-map-another](./test-properties-map-another.md) |
| 54 | [properties-throw-ambiguous-property](./test-properties-throw-ambiguous-property.md) |
| 55 | [properties-throw-missing-property-parent](./test-properties-throw-missing-property-parent.md) |
| 56 | [properties-throw-multiple-default](./test-properties-throw-multiple-default.md) |
| 57 | [relationships-conditional](./test-relationships-conditional.md) |
| 58 | [relationships-throw-multiple](./test-relationships-throw-multiple.md) |
| 59 | [relationships-throw-undefined](./test-relationships-throw-undefined.md) |
| 60 | [relationships-throw-unused](./test-relationships-throw-unused.md) |
| 61 | [requirement-assignment-conditional](./test-requirement-assignment-conditional.md) |
| 62 | [requirement-assignment-default-alternative](./test-requirement-assignment-default-alternative.md) |
| 63 | [requirement-assignment-default-alternative-false](./test-requirement-assignment-default-alternative-false.md) |
| 64 | [requirement-assignment-default-condition](./test-requirement-assignment-default-condition.md) |
| 65 | [requirement-assignment-default-condition-throw](./test-requirement-assignment-default-condition-throw.md) |
| 66 | [requirement-assignment-one-hosting-relation](./test-requirement-assignment-one-hosting-relation.md) |
| 67 | [requirement-assignment-throw-multiple-defaults](./test-requirement-assignment-throw-multiple-defaults.md) |

