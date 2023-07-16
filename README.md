# OpenTOSCA Vintner

> Check out the [step-by-step guide](https://vintner.opentosca.org/variability4tosca/guides/artifacts) for the publication submitted at _CoopIS 2023_. Additional links are [below](#step-by-step-guides).

[![Release](https://github.com/opentosca/opentosca-vintner/actions/workflows/release.yaml/badge.svg?branch=main)](https://github.com/opentosca/opentosca-vintner/actions/workflows/release.yaml)
[![Night](https://github.com/OpenTOSCA/opentosca-vintner/actions/workflows/night.yaml/badge.svg)](https://github.com/OpenTOSCA/opentosca-vintner/actions/workflows/night.yaml)
[![Codacy Style Badge](https://app.codacy.com/project/badge/Grade/acec5103cf9b4f1bb1fa25bc5a99076d)](https://www.codacy.com/gh/OpenTOSCA/opentosca-vintner/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=OpenTOSCA/opentosca-vintner&amp;utm_campaign=Badge_Grade)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.0-4baaaa.svg)](https://vintner.opentosca.org/code-of-conduct)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Platforms](https://img.shields.io/badge/Platforms-Linux%20%7C%20Windows-606c38.svg)](https://vintner.opentosca.org)
[![TOSCA](https://img.shields.io/badge/TOSCA-1.3-important.svg)](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html)
[![Plugins](https://img.shields.io/badge/Orchestrators-xOpera%20%7C%20Unfurl-blueviolet.svg)](https://vintner.opentosca.org)
[![OpenTOSCA](https://img.shields.io/badge/OpenTOSCA-%E2%9D%A4%EF%B8%8F-ff69b4)](https://opentosca.org)
[![MiniSat](https://img.shields.io/badge/MiniSat-%E2%9D%A4%EF%B8%8F-ff69b4)](https://github.com/meteor/logic-solver)

OpenTOSCA Vintner is a TOSCA preprocessing and management layer which is able to deploy applications based on TOSCA orchestrator plugins.
Preprocessing includes, e.g., the resolving of variability.

- [Documentation](https://vintner.opentosca.org)
- [Getting Started](https://vintner.opentosca.org/getting-started)
- [CLI Documentation](https://vintner.opentosca.org/interface)
- [REST API Documentation](https://vintner.opentosca.org/interface)

This repository holds the following specifications and profiles. 

- [Variability4TOSCA](https://vintner.opentosca.org/variability4tosca/motivation)
- [Queries4TOSCA](https://vintner.opentosca.org/queries4tosca/getting-started)
- [TOSCA SofDCar Profile](https://vintner.opentosca.org/sofdcar/profile)

This repository holds the step-by-step guides of the following publications.

- **Managing the Variability of Component Implementations and Their Deployment Configurations Across Heterogeneous Deployment Technologies**
  - CoopIS 2023
  - _Currently under Review_
  - [Step-by-Step Guide](https://vintner.opentosca.org/variability4tosca/guides/artifacts) 
  - [Model of the Motivating Scenario](examples/unfurl-artifacts)
  - [Models of the Complexity Evaluation](examples/unfurl-artifacts/stats)


- **Modeling Different Deployment Variants of a Composite Application in a Single Declarative Deployment Model**
  - Algorithms 2022
  - https://doi.org/10.3390/a15100382
  - [Step-by-Step Guide](https://vintner.opentosca.org/variability4tosca/motivation)
  - [Model of the Motivating Scenario using Unfurl](examples/unfurl-motivation)
  - [Model of the Motivating Scenario using xOpera](examples/xopera-motivation)

# Haftungsausschluss

Dies ist ein Forschungsprototyp. Die Haftung für entgangenen Gewinn, Produktionsausfall, Betriebsunterbrechung,
entgangene Nutzungen, Verlust von Daten und Informationen, Finanzierungsaufwendungen sowie sonstige Vermögens- und
Folgeschäden ist, außer in Fällen von grober Fahrlässigkeit, Vorsatz und Personenschäden ausgeschlossen.

# Disclaimer of Warranty

Unless required by applicable law or agreed to in writing, Licensor provides the Work (and each Contributor provides its
Contributions) on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied, including,
without limitation, any warranties or conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
PARTICULAR PURPOSE. You are solely responsible for determining the appropriateness of using or redistributing the Work
and assume any risks associated with Your exercise of permissions under this License.

# Acknowledgements

This project is developed for the purpose of research by the [Institute of Software Engineering (ISTE)](https://www.iste.uni-stuttgart.de) and the [Institute of Architecture of Application Systems (IAAS)](https://www.iaas.uni-stuttgart.de) of the [University of Stuttgart, Germany](https://www.uni-stuttgart.de).
The development is partially funded by the [German Federal Ministry for Economic Affairs and Climate Action (BMWK)](https://www.bmwk.de/Navigation/EN/Home/home.html) as part of the [Software-Defined Car (SofDCar)](https://sofdcar.de) project (19S21002).
