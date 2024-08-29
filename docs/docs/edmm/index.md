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

1. Must use only features as defined by TOSCA Light and Variability4TOSCA.


## Node Types

> A _built-in_ type must not be compliant with EDMM restrictions since such a type is internally used for our implementation of the EDMM-DTSM mapping.

1. A _built-in_ and _abstract_ node type is a normative type, which cannot be instantiated since it is missing, e.g., its management operations or deployment artifact.
1. A _built-in_ and _concrete_ node type is a normative type, which can be instantiated.
1. A _custom_ and _abstract_ type is a user-defined type, which cannot be instantiated since it is missing, e.g., its management operations or deployment artifact.
1. A _custom_ and _concrete_ type is a user-defined type, which can be instantiated.


## Software Applications

1. A `software.application` node template always requires a `source.archive` or `system.package` deployment artifact.
1. A `software.application` node template with an `source.archive` deployment artifact always requires the `start` operation and the `stop` operation.
1. A `software.application` node template with a `source.archive` deployment artifact implicitly requires an `virtual.machine` or `gcp.appengine` node template as host.
1. A `software.application` node template with a `system.package` deployment artifact implicitly requires an `virtual.machine` node template as host.


## Service Applications

1. A `service.application` node template on a `virtual.machine` host is started as `systemd` service.
1. A `service.appcliation` always requires a  `source.archive` or `container.image` deployment artifact. 
1. A `service.application` does not require a `stop` operation.
1. A `service.application` node template with a `container.image` deployment artifact implicitly requires a `docker.engine`, `gcp.cloudrun`, or `kubernetes` node template as host.

## Virtual Machine 

1. A `virtual.machine` node template always requires a `virtual.machine.image` deployment artifact.

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

1. A `software.application` node template hosted on a `virtual.machine` node template has its own dedicated application directory.
1. The `.vintner` directory is a reserved directory in the application directory.


## Deployment Artifacts

1. A `source.archive` deployment artifact is extracted into the application directory.
1. A node template can have conditional deployment artifacts.
1. A node type cannot have conditional deployment artifacts.
1. A deployment artifact must be named by its artifact type but any `.` replaced with `_`.


## Technology Rules

1. Technology rules might collide. The technology implementation is selected based on the quality (and possibly on the technology count).
1. Qualities are defined based on the following aspects.
    1. _(Critical)_ Custom module vs battle-proven module
    1. _(Critical)_ Imperative vs declarative technology
    1. _(Critical)_ Imperative flow of declarative tasks vs pure declarative tasks (e.g., Ansible Playbook Tasks vs Terraform Module)
    1. Generic vs specialized/ native technology, e.g., Ansible vs Docker to start docker container (up to date modules, bug fixes ...)
    1. Depth of technology toolchain
    1. Number of workarounds
    1. Number of tasks/ resources/ artifacts/ manifests to be defined
    1. Length of the template
    1. Usage of deprecated or not recommended features
    1. More specialized node type, e.g., `software.application` vs `service.application`.
   
--8<-- "acd.md"
