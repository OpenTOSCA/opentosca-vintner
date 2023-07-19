---
tags:
- Vintner
---

# Orchestrators

We currently support [xOpera](https://github.com/xlab-si/xopera-opera){target=_blank} and [Unfurl](https://github.com/onecommons/unfurl){target=_blank}.
Since both can only be installed on Linux, we implemented a [WSL](https://docs.microsoft.com/en-us/windows/wsl){target=_blank} integration for both.
To find out more about these orchestrators, checkout our [TOSCA Orchestrator Selection Support System (TOSSS)](https://tosss.opentosca.org){target=_blank}.
Configure and enable your orchestrator as follows.
We expect, that the orchestrator is already installed.
For more information see [Interface](interface.md){target=_blank}.

## xOpera

```shell linenums="1"
vintner orchestrators init xopera
vintner orchestrators enable --orchestrator xopera
```

## xOpera WSL

```shell linenums="1"
vintner orchestrators init xopera-wsl
vintner orchestrators enable --orchestrator xopera-wsl
```

## Unfurl
```shell linenums="1"
pip install unfurl
unfurl home --init

vintner orchestrators init unfurl
vintner orchestrators enable --orchestrator unfurl
```

## Unfurl WSL
```shell linenums="1"
pip install unfurl
unfurl home --init

vintner orchestrators init unfurl-wsl
vintner orchestrators enable --orchestrator unfurl-wsl
```

## Integrated Features

The following table describes which feature of the orchestrators are integrated. 
The orchestrators provide more features than we integrated, thus, checkout [TOSSS](https://tosss.opentosca.org){target=_blank}.

| Feature                         | xOpera | Unfurl |
|---------------------------------|-------| --- |
| Deploy a service template       | :material-check: | :material-check: |
| Continue a service template     | :material-check: | :material-close: | 
| Update a service template       | :material-check: | :material-close: | 
| Undeploy a service template     | :material-check: |:material-check: |
| Access Node Instance Attributes | :material-check: | :material-close: |


## Known Limitations 
- xOpera version 0.6.9 should be used instead of 0.7.0 which does not parse the templates as expected, see issues
  [#257](https://github.com/xlab-si/xopera-opera/issues/257){target=_blank},
  [#258](https://github.com/xlab-si/xopera-opera/issues/258){target=_blank}, and
  [#261](https://github.com/xlab-si/xopera-opera/issues/261){target=_blank}.
- xOpera deletes attribute assignments during updates, see [issue #262](https://github.com/xlab-si/xopera-opera/issues/262){target=_blank}.