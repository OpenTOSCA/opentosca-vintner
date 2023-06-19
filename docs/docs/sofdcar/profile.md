---
title: Profile
---

# TOSCA Software-Defined Car (SofDCar) Profile 1.0 Release Candidate

This document specifies the TOSCA Software-Defined Car (SofDCar) profile.
This profile includes normative TOSCA types for the domain of software-defined cars. 
Standardizing such normative TOSCA types improves interoperability.
For example, an ECU supplier can model and distribute the deployment and management of his ECUs using these types. 
Various OEMs can then import provided models and integrate them into their cars.
The specification is under active development and is not backwards compatible with any previous versions.

## Downloads 

- [TOSCA SofDCar Profile](tosca-sofdcar-profile.yaml)
- [TOSCA SofDCar Profile Non-Normative](tosca-sofdcar-profile-non-normative.yaml)


## Normative TOSCA Type Definitions for Software-Defined Cars

```yaml linenums="1"
--8<-- "sofdcar/tosca-sofdcar-profile.yaml"
```

## Non-Normative TOSCA Type Definitions for Software-Defined Cars

```yaml linenums="1"
--8<-- "sofdcar/tosca-sofdcar-profile-non-normative.yaml"
```

--8<-- "acd.md"