---
title: EDMM Compliance
tags:
- EDMM
- Specification
---

# EDMM Compliance Specification 1.0 Release Candidate

{{ experimental_notice() }}

This document specifies how to achieve EDMM compliance when modeling and gives additional insights.
This document does not specify how to achieve EDMM compatibility on a technical level.
The specification is under active development and is not backwards compatible with any previous versions.

## General

1. Must use only features as defined by TOSCA Light extended by Variability4TOSCA.


## Node Types

> A _built-in_ type must not be compliant with EDMM restrictions since such a type is internally used for our implementation of the EDMM-DTSM mapping.

1. A _built-in_ and _abstract_ node type is a normative type, which cannot be instantiated since it is missing, e.g., its management operations or deployment artifact.
1. A _built-in_ and _concrete_ node type is a normative type, which can be instantiated.
1. A _custom_ and _abstract_ type is a user-defined type, which cannot be instantiated since it is missing, e.g., its management operations or deployment artifact.
1. A _custom_ and _concrete_ type is a user-defined type, which can be instantiated.


## Management Operations

1. A node type might define the `create`, `configure`, `create`, `stop`, and `delete` operation of the `Management` interface using `management` as interface name.
1. A `management` operation is an inline `bash` script, which is executed in the root of the application directory.
1. A _built-in_ node type defines its management operations in its node type, e.g., `node.service.application`.
1. A _custom_ and _abstract_ node type defines its management operations in its node type.
1. A _custom_ and _concrete_ node type defines its management operations in its node template, e.g., `shop.component` derived from `node.application`.


## Implementations

1. A node type `t` might have node type implementations which are node types that (i) are derived from `t` and (ii) implement the `tosca.interfaces.node.lifecycle.Standard` interface.
1. A node type implementation is generated and not manually defined.
1. A node type implementation might call operations of the `Management` interface.
1. A node type implementation represent the EDMM-DTSM mapping.


## Property Assignments

1. A _built-in_ node type can define property assignments.
1. A _custom_ and _abstract_ node type can define property assignments.
1. A _custom_ and _concrete_ node type must not define property assignments.


## Application Directory

1. A `software.application` node template hosted on a `remote.machine` node template has its own dedicated application directory.
1. The `.vintner` directory is a reserved directory in the application directory.


## Deployment Artifacts

1. A node template can have conditional deployment artifacts.
1. A node type cannot have conditional deployment artifacts.
1. A deployment artifact must be named by its artifact type but any `.` replaced with `_`.

   
--8<-- "acd.md"
