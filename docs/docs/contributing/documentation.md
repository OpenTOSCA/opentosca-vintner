---
tags:
- Contributing
---

# Documentation

This document gives an introduction on writing the documentation.

## MkDocs

{{ linux_only_notice() }}

The documentation is powered by [Material for MkDocs](https://squidfunk.github.io/mkdocs-material){target=_blank}.
Corresponding files are located in the `docs` directory.
Custom macros are implemented in `docs/macros.py` using [mkdocs-macros](https://mkdocs-macros-plugin.readthedocs.io){target=_blank}.

We expect that Python and [pandoc](https://pandoc.org){target=_blank} is already installed.
To install [pandoc](https://pandoc.org){target=_blank} on Ubuntu you might run

```shell linenums="1"
sudo apt-get install pandoc
```

With the following command you can install `mkdocs-material` along with its requirements globally on your system.

```shell linenums="1"
yarn docs:install
```

To start a local development server on [http://localhost:8000](http://localhost:8000){target=_blank}, run the following command.
Note that the performance is suffering due to the heavy use of plugins.

```shell linenums="1"
yarn docs:serve
```

Once the server is running, run the following command to open the docs in your browser.

```shell linenums="1"
yarn docs:open
```

## Autogenerated Markdown

Some Markdown files are autogenerated, e.g., [Dependencies](../dependencies.md){target=_blank} or [Interface](../interface.md){target=_blank}.
Changes must be made in the respective template files. 
Furthermore, respective files are generated during the `release` workflow and, therefore, overwrite respective files.
To warn the developer, include the following custom marco at the top of the template.

```text linenums="1"
{% raw %}
{{ autogenerated_notice('yarn docs:generate:dependencies') }}
{% endraw %}
```

This will render the following warning, if the docs are served using `yarn docs:serve` but not when built.

{{ autogenerated_notice('yarn docs:generate:dependencies', True) }}


## Casts

{{ linux_only_notice() }}

The docs contain recorded demos. Thereby, we use the following tools

- [asciinema](https://asciinema.org/){target=_blank} to record a terminal session
- [demo-magic](https://github.com/paxtonhare/demo-magic){target=_blank} to automate the terminal session
- [asciinema-player](https://github.com/asciinema/asciinema-player){target=_blank} embed casts in a standalone manner

Casts are not recorded during any workflow.
The following command can be used to record the `home` cast for the landing page

```shell linenums="1"
yarn docs:record:home
```

A cast can be embedded using the custom macro `asciinema_player` as follows inside a Markdown file.

```text linenums="1"
{% raw %}
{{ asciinema_player('getting-started') }}
{% endraw %}
```

This will embed the cast `docs/docs/assets/casts/getting-started.cast` inside the page as follows.

{{ asciinema_player('getting-started') }}


## Export 

{{ linux_only_notice() }}

To export registered pages as PDF, run the following command. 
This will output the results in `dist-docs`.

```shell linenums="1"
yarn docs:export
```

The above command is using [https://vintner.opentosca.org](https://vintner.opentosca.org){target=_blank}.
To export pages of [http://localhost:8000](http://localhost:8000){target=_blank}, run the following command. 

```shell linenums="1"
yarn docs:export:local
```


## Interface

To generate the documentation for the CLI and REST API, run the following command.
This command is also executed during the `release` workflow and, therefore, overwrites respective files.

```shell linenums="1"
yarn docs:generate:interface
```

## Dependencies

To generate a list of licenses for all (transitive) dependencies, run the following command
This command is also executed during the `release` workflow and, therefore, overwrites respective files.

```shell linenums="1"
yarn docs:generate:dependencies
```

The list includes information such as package name, version, license, etc. and is written to a CSV file.
At the same time, the [Dependencies](../dependencies.md){target=_blank} page is generated.

## Puccini

{{ linux_only_notice() }}

We use [puccini](https://github.com/tliron/puccini) to validate a service template.
Therefore, run the following command.

```shell linenums="1"
yarn puccini:check:single path/to/service-template.yaml
```

To validate all registered service templates, run the following command.

```shell linenums="1"
yarn puccini:check
```

## PlantUML

We use [PlantUML](http://plantuml.com) for visualizing UML diagrams.
Read [PlantUML Guide](https://plantuml.com/de/guide) for modeling instructions.

The following command generates PlantUML files for registered service templates.
This command is also executed during the `release` workflow and, therefore, overwrites respective files.
Furthermore, [mkdocs_build_plantuml](https://github.com/quantorconsulting/mkdocs_build_plantuml){target=_blank} is used to plot PlantUML to SVGs when building the documentation.

```shell linenums="1"
yarn docs:generate:puml
```

Note, we use the public PlantUML server [https://www.plantuml.com/plantuml](https://www.plantuml.com/plantuml){target=_blank} for plotting SVGs.
It is also possible to start a local PlantUML server using Docker.
Therefore, run the following command.

```shell linenums="1"
yarn puml:up 
```

However, you also need to configure the following environment variables in `docs/.env`.

```yaml linenums="1"
MKDOCS_PUML_SERVER=http://localhost:8080
MKDOCS_PUML_SERVER_SSL=true
```

To stop the local PlantUML server, run the following command.

```shell linenums="1"
yarn puml:down
```

There is also a deprecated way to plot PlantUML to SVG.
Therefore, run the following command.
This considers all `.puml` files.

```shell linenums="1"
yarn docs:plot:puml
```

## Queries4TOSCA

To generate the conformance tests for Queries4TOSCA, run the following command.
This command is also executed during the `release` workflow and, therefore, overwrites respective files.

```shell linenums="1"
yarn docs:generate:tests:query
```

## TOSCA SofDCar Profile

To generate the TOSCA SofDCar Profile, run the following command.
This command is also executed during the `release` workflow and, therefore, overwrites respective files.

```shell linenums="1"
yarn docs:generate:tests:query
```


## Variability4TOSCA

To generate the conformance tests for Variability4TOSCA, run the following command.
This command is also executed during the `release` workflow and, therefore, overwrites respective files.

```shell linenums="1"
yarn docs:generate:tests:query
```

## Limitations

- Performance is suffering due to the heavy use of plugins.
- It is not possible to configure which release should be shown in the navigation bar. The latest release is always use which is in general correct.