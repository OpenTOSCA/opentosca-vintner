---
title: Profile
---

# TOSCA Software-Defined Car (SofDCar) Profile 1.0 Release Candidate

This document specifies normative TOSCA types 
contains [TOSCA Simple Profile in YAML Version 1.3](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html)
definitions for the [SofDCar project](https://sofdcar.de/language/en).

The specification is under active development and is not backwards compatible with any previous versions.

## Normative Types 

Normative TOSCA Type Definitions for Software-Defined Cars.


### Examples (Deprecated)

#### ECU Software and Hardware

<p align="center">
<img src="../assets/ecu.svg" alt="ecu"/>
</p>

#### Physical CAN

<p align="center">
<img src="../assets/can-p-p.svg" alt="ecu"/>
</p>

#### Physical OTA CAN

<p align="center">
<img src="../assets/can-p-p-ota.svg" alt="ecu"/>
</p>

#### Virtual CAN

<p align="center">
<img src="../assets/can-v-v.svg" alt="ecu"/>
</p>

#### Virtual OTA CAN

<p align="center">
<img src="../assets/can-v-v-ota.svg" alt="ecu"/>
</p>

## Complete

- [download](tosca-sofdcar-profile.yaml)

```yaml linenums="1"
--8<-- "../docs/sofdcar/sofdcar/tosca-sofdcar-profile.yaml"
```


## Non-Normative Types

Non-Normative TOSCA Type Definitions for Software-Defined Cars.

- [download](tosca-sofdcar-profile-non-normative.yaml)

```yaml linenums="1"
--8<-- "../docs/sofdcar/sofdcar/tosca-sofdcar-profile-non-normative.yaml"
```

--8<-- "vacd.md"