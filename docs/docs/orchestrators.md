---
tags:
- Vintner
- xOpera
- Unfurl
---

# Orchestrators

This document holds information considering supported orchestrators. 
We currently support [xOpera](https://github.com/xlab-si/xopera-opera){target=_blank} and [Unfurl](https://github.com/onecommons/unfurl){target=_blank}.
Since both can only be installed on Linux, we implemented a [WSL](https://docs.microsoft.com/en-us/windows/wsl){target=_blank} integration for both.
To find out more about these orchestrators, checkout our [TOSCA Orchestrator Selection Support System (TOSSS)](https://tosss.opentosca.org){target=_blank}.
Install, configure and enable your orchestrator as follows.
For more information see [Interface](interface.md){target=_blank}.

## xOpera

We install xOpera using the following command.
This will install xOpera v0.6.9 in a virtual environment.
For a manual installation see [the documentation](https://xlab-si.github.io/xopera-docs/02-cli.html#installation){target=_blank}.

```shell linenums="1"
vintner install xopera
```

Next, we configure Vintner to use xOpera.

```shell linenums="1"
vintner orchestrators init xopera
vintner orchestrators enable --orchestrator xopera
```

Next, we attest that Vintner can correctly use xOpera.

```shell linenums="1"
vintner orchestrators attest --orchestrator xopera
```

If xOpera is running in WSL and Vintner on Windows, then configure Vintner as follows.

```shell linenums="1"
vintner orchestrators init xopera-wsl
vintner orchestrators enable --orchestrator xopera-wsl
```

Next, we attest that Vintner can correctly use xOpera in WSL.

```shell linenums="1"
vintner orchestrators attest --orchestrator xopera-wsl
```


## Unfurl

We install Unfurl using the following command.
This will install Unfurl v1.0.0 in a virtual environment.
For a manual installation see [the documentation](https://docs.unfurl.run/README.html#installation){target=_blank}.

```shell linenums="1"
vintner install unfurl
```

Next, we configure Vintner to use Unfurl.

```shell linenums="1"
vintner orchestrators init unfurl
vintner orchestrators enable --orchestrator unfurl
```

Next, we attest that Vintner can correctly use Unfurl.

```shell linenums="1"
vintner orchestrators attest --orchestrator unfurl
```

If Unfurl is running in WSL and Vintner on Windows, then configure Vintner as follows.

```shell linenums="1"
vintner orchestrators init unfurl-wsl
vintner orchestrators enable --orchestrator unfurl-wsl
```

To attest that Vintner can correctly use Unfurl, run the following command.

```shell linenums="1"
vintner orchestrators attest --orchestrator unfurl-wsl
```

## Integrated Features

The following table describes which feature of the orchestrators are integrated. 
The orchestrators provide more features, see [TOSSS](https://tosss.opentosca.org){target=_blank}.

| Feature                                       | xOpera           | Unfurl           |
|-----------------------------------------------|------------------|------------------|
| Validate an application topology              | :material-check: | :material-check: |
| Deploy an application                         | :material-check: | :material-check: |
| Access deployment outputs                     | :material-check: | :material-close: |
| Continue the deployment of an application     | :material-check: | :material-close: | 
| Update the service template of an application | :material-check: | :material-close: | 
| Undeploy an application                       | :material-check: | :material-check: |
| Access node instance attributes               | :material-check: | :material-close: |


## Deployment Technologies 

Under the scene, we are using the following deployment technologies.

| Technology                   | Version |
|------------------------------|---------|
| ansible (pip)                | 4.10.0  |
| google-cloud-cli (apt)       | 432.0.0 | 
| kubernetes (pip)             | 24.2.0  |
| openshift (pip)              | 0.13.2  |
| openstacksdk (pip)           | 0.61    |
| python-openstackclient (pip) | 6.0.0   |
| terraform (apt)              | 1.4.6   |


## Known Limitations
- xOpera version 0.6.9 should be used. xOpera version 0.7.0 does not parse the templates as expected, see issues
  [#257](https://github.com/xlab-si/xopera-opera/issues/257){target=_blank},
  [#258](https://github.com/xlab-si/xopera-opera/issues/258){target=_blank}, and
  [#261](https://github.com/xlab-si/xopera-opera/issues/261){target=_blank}.
- xOpera deletes attribute assignments during updates, see [issue #262](https://github.com/xlab-si/xopera-opera/issues/262){target=_blank}.
