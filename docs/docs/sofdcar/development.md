# Development

This document holds conventions and instructions on development the TOSCA SofDCar profile.

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
yarn sofdcar:validate
```

## Plot Images

The following command plots all `.puml` files found in this repository using [PlantUML](http://plantuml.com).
Read [PlantUML Guide](https://plantuml.com/de/guide) for modeling instructions.

```shell linenums="1"
yarn docs:generate:puml
```

To install the plotting requirements on Windows, run the following commands.

```shell linenums="1"
choco install wget -y
choco install openjdk -y
```
