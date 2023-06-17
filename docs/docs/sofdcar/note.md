# Note

- [SofDCar Normative Types](sofdcar)
- [SofDCar Non-Normative Types](sofdcar-non-normative)
- [SofDCar Example "Zone Architecture"](guides/zone)
- [SofDCar Example "Distributed Locations"](guides/location)
- [TOSCA Simple Profile in YAML 1.3 Normative Types](tosca)

## Naming Convention

Types should be named according to the following pattern.

```text linenums="1"
type     = [domain]+.entity[.Name]+
entity   = "nodes" | "relationships" | "capabilities" | "artifacts" | "datatypes" | "groups
         | "policies" | "interfaces"
word     = ("a" ... "z" | "A" ... "Z")[word]
*        = word
```

## Validate Service Template

To validate a service template, run the following command.
This will install [puccini](https://github.com/tliron/puccini) in the background and execute its parser.
This only works on Linux or if WSL is installed.

```shell linenums="1"
make validate T=relative/path/to/service/template
```

## Plot Images

The following command plots all `.puml` files found in this repository using [PlantUML](http://plantuml.com).
Read [PlantUML Guide](https://plantuml.com/de/guide) for modeling instructions.

```shell linenums="1"
make plot
```

To install the plotting requirements on Windows, run the following commands.

```shell linenums="1"
choco install make -y
choco install wget -y
choco install openjdk -y
```

## Open Repository

The following command opens the repository in your default browser.

```shell linenums="1"
make open
```

## Notes

- [TOSCA Version 2.0](https://docs.oasis-open.org/tosca/TOSCA/v2.0/TOSCA-v2.0.html) is still a draft
- [TOSCA Simple Profile for Network Functions Virtualization (NFV) Version 1.0](https://docs.oasis-open.org/tosca/tosca-nfv/v1.0/tosca-nfv-v1.0.html)
  is still a draft in an early stage
- networking, such as CAN busses, might be modeled in a separate network template as discussed
  in [TOSCA Networking](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#_Toc26969482)
- management operations might represent manual or robotic tasks
- [Model-based resource analysis and synthesis of service-oriented automotive software architectures](https://doi.org/10.1007/s10270-021-00896-9)
- [Making the Case for Centralized Automotive E/E Architectures](https://doi.org/10.1109/TVT.2021.3054934)
