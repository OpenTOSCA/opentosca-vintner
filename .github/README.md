# OpenTOSCA Vintner

[![Release](https://github.com/opentosca/opentosca-vintner/actions/workflows/release.yaml/badge.svg?branch=main)](https://github.com/opentosca/opentosca-vintner/actions/workflows/release.yaml)
[![Night](https://github.com/OpenTOSCA/opentosca-vintner/actions/workflows/night.yaml/badge.svg)](https://github.com/OpenTOSCA/opentosca-vintner/actions/workflows/night.yaml)
[![Codacy Quality Badge](https://app.codacy.com/project/badge/Grade/acec5103cf9b4f1bb1fa25bc5a99076d)](https://app.codacy.com/gh/OpenTOSCA/opentosca-vintner/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Codacy Coverage Badge](https://app.codacy.com/project/badge/Coverage/acec5103cf9b4f1bb1fa25bc5a99076d)](https://app.codacy.com/gh/OpenTOSCA/opentosca-vintner/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.0-blue.svg)](https://vintner.opentosca.org/code-of-conduct)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Platforms](https://img.shields.io/badge/Platforms-Linux%20%7C%20Windows-blue.svg)](https://vintner.opentosca.org)
[![TOSCA](https://img.shields.io/badge/TOSCA-1.3-blue.svg)](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html)
[![Plugins](https://img.shields.io/badge/Orchestrators-xOpera%20%7C%20Unfurl-blue.svg)](https://vintner.opentosca.org)
[![OpenTOSCA](https://img.shields.io/badge/OpenTOSCA-%E2%9D%A4%EF%B8%8F-blue)](https://opentosca.org)
[![MiniSat](https://img.shields.io/badge/MiniSat-%E2%9D%A4%EF%B8%8F-blue)](https://github.com/meteor/logic-solver)
[![Discord](https://img.shields.io/badge/Discord-online-blue)](https://discord.gg/Uz6348Ctmg)
[![npm](https://img.shields.io/badge/npm-opentosca--vintner-blue)](https://www.npmjs.com/package/opentosca-vintner)
[![docker](https://img.shields.io/badge/docker-ghcr.io-blue)](https://github.com/OpenTOSCA/opentosca-vintner/pkgs/container/opentosca-vintner)
[![Zenodo](https://zenodo.org/badge/DOI/10.5281/zenodo.10155277.svg)](https://zenodo.org/doi/10.5281/zenodo.10155277)
[![BMWK](https://img.shields.io/badge/BMWK-SofDCar%20(19S21002)-blue.svg)](https://sofdcar.de)

OpenTOSCA Vintner is a TOSCA preprocessing and management layer which is able to deploy applications based on TOSCA orchestrator plugins.
Preprocessing includes, e.g., the resolving of deployment variability.

- [Documentation](https://vintner.opentosca.org)
- [Getting Started](https://vintner.opentosca.org/getting-started)
- [CLI Documentation](https://vintner.opentosca.org/interface)
- [REST API Documentation](https://vintner.opentosca.org/interface)

This repository holds the following specifications and profiles. 

- [Variability4TOSCA](https://vintner.opentosca.org/variability4tosca/motivation)
- [Queries4TOSCA](https://vintner.opentosca.org/queries4tosca/getting-started)
- [TOSCA SofDCar Profile](https://vintner.opentosca.org/sofdcar/profile)

This repository holds the step-by-step guides of the following publications.

<a id="publication-stoetzner-2023-pruning"></a>
- **Enhancing Deployment Variability Management by Pruning Elements in Deployment Models**
  - UCC 2023
  - _Accepted_
  - [Step-by-Step Guide](https://vintner.opentosca.org/variability4tosca/guides/pruning)
  - [Model of the Motivating Scenario](../examples/xopera-pruning)
  - [Models of the Complexity Evaluation](../examples/xopera-pruning/stats)
  - [GitHub Actions Job Run](https://github.com/OpenTOSCA/opentosca-vintner/actions/runs/6677267360/job/18147105860) (Relevant steps start with "XOPERA-PRUNING")
  - [GitHub Actions Raw Logs](https://vintner.opentosca.org/variability4tosca/guides/pruning/logs.txt) (Relevant steps start with "XOPERA-PRUNING")
  - [Assets on Zenodo](https://doi.org/10.5281/zenodo.10050261)
  - [@publication-stoetzner-2023-pruning](https://github.com/OpenTOSCA/opentosca-vintner/releases/tag/publication-stoetzner-2023-pruning)

<a id="publication-stoetzner-2023-vdmm-v2-demo"></a>
- **Using Variability4TOSCA and OpenTOSCA Vintner for Holistically Managing Deployment Variability**
  - CoopIS 2023 Demo
  - _Accepted_
  - [Step-by-Step Guide](https://vintner.opentosca.org/variability4tosca/guides/artifacts)
  - [Demo Video](https://youtu.be/6szIGJPuCsU)
  - [Model of the Motivating Scenario](../examples/unfurl-artifacts)
  - [GitHub Actions Job Run](https://github.com/OpenTOSCA/opentosca-vintner/actions/runs/6100939642/job/16556255878) (Relevant steps start with "UNFURL-ARTIFACTS")
  - [GitHub Actions Raw Logs](https://vintner.opentosca.org/variability4tosca/guides/artifacts/logs.txt) (Relevant Steps start with "UNFURL-ARTIFACTS")
  - [@publication-stoetzner-2023-vdmm-v2-demo](https://github.com/OpenTOSCA/opentosca-vintner/releases/tag/publication-stoetzner-2023-vdmm-v2-demo)

<a id="publication-stoetzner-2023-vdmm-v2"></a>
- **Managing the Variability of Component Implementations and Their Deployment Configurations Across Heterogeneous Deployment Technologies**
  - CoopIS 2023
  - https://doi.org/10.1007/978-3-031-46846-9_4
  - [Step-by-Step Guide](https://vintner.opentosca.org/variability4tosca/guides/artifacts) 
  - [Model of the Motivating Scenario](../examples/unfurl-artifacts)
  - [Models of the Complexity Evaluation](../examples/unfurl-artifacts/stats)
  - [@publication-stoetzner-2023-vdmm-v2](https://github.com/OpenTOSCA/opentosca-vintner/releases/tag/publication-stoetzner-2023-vdmm-v2)

<a id="publication-stoetzner-2022-vdmm"/></a>
- **Modeling Different Deployment Variants of a Composite Application in a Single Declarative Deployment Model**
  - Algorithms 2022
  - https://doi.org/10.3390/a15100382
  - [Step-by-Step Guide](https://vintner.opentosca.org/variability4tosca/motivation)
  - [Model of the Motivating Scenario using Unfurl](../examples/unfurl-motivation)
  - [Model of the Motivating Scenario using xOpera](../examples/xopera-motivation)
  - [@publication-stoetzner-2022-vdmm](https://github.com/OpenTOSCA/opentosca-vintner/releases/tag/publication-stoetzner-2022-vdmm)

## Haftungsausschluss

Dies ist ein Forschungsprototyp. Die Haftung für entgangenen Gewinn, Produktionsausfall, Betriebsunterbrechung,
entgangene Nutzungen, Verlust von Daten und Informationen, Finanzierungsaufwendungen sowie sonstige Vermögens- und
Folgeschäden ist, außer in Fällen von grober Fahrlässigkeit, Vorsatz und Personenschäden ausgeschlossen.

## Disclaimer of Warranty

Unless required by applicable law or agreed to in writing, Licensor provides the Work (and each Contributor provides its
Contributions) on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied, including,
without limitation, any warranties or conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
PARTICULAR PURPOSE. You are solely responsible for determining the appropriateness of using or redistributing the Work
and assume any risks associated with Your exercise of permissions under this License.

## Keywords 

OpenTOSCA, Vintner, TOSCA, Variability4TOSCA, variability, deployment, orchestration, management

## Acknowledgements

This project is developed for the purpose of research by the [Institute of Software Engineering (ISTE)](https://www.iste.uni-stuttgart.de) and the [Institute of Architecture of Application Systems (IAAS)](https://www.iaas.uni-stuttgart.de) of the [University of Stuttgart, Germany](https://www.uni-stuttgart.de).
The development is partially funded by the [German Federal Ministry for Economic Affairs and Climate Action (BMWK)](https://www.bmwk.de/Navigation/EN/Home/home.html) as part of the [Software-Defined Car (SofDCar)](https://sofdcar.de) project (19S21002).
