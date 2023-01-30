# Orchestrators

We currently support [xOpera](https://github.com/xlab-si/xopera-opera){target=_blank} and [Unfurl](https://github.com/onecommons/unfurl){target=_blank}.
Since both can only be installed on Linux, we implemented a [WSL](https://docs.microsoft.com/en-us/windows/wsl){target=_blank} integration for both.
To find out more about these orchestrators, checkout our [TOSCA Orchestrator Selection Support System (TOSSS)](https://tosss.opentosca.org){target=_blank}.
Configure and enable your orchestrator as follows.
We expect, that the orchestrator is already installed.
For more information see [Interface](interface.md){target=_blank}.

## xOpera
```shell linenums="1"
vintner orchestrators init opera
vintner orchestrators enable --orchestrator opera
```

## xOpera WSL
```shell linenums="1"
vintner orchestrators init opera-wsl
vintner orchestrators enable --orchestrator opera-wsl
```

## Unfurl
```shell linenums="1"
vintner orchestrators init unfurl
vintner orchestrators enable --orchestrator unfurl
```

## Unfurl WSL
```shell linenums="1"
vintner orchestrators init unfurl-wsl
vintner orchestrators enable --orchestrator unfurl-wsl
```

## Integrated Features

The following table describes which feature of the orchestrators are integrated. 
The orchestrators provide more features than we integrated, thus, checkout [TOSSS](https://tosss.opentosca.org){target=_blank}.

| Feature | xOpera | Unfurl |
| -- |-------| --- |
| Deploy a Service Template | :material-check: | :material-check: |
| Update a Service Template | :material-check: | :material-close: | 
| Undeploy a Service Template | :material-check: |:material-check: |
| Access Node Template Attributes | :material-check: | :material-close: |