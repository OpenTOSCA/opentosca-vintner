# Installation

To install `vintner`, download the binary for your operating system.
There are no other dependencies required. 
You might add the binary to your PATH.

The following example shows the installation on Linux.
```linenums="1"
wget -q https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-x64
mv vintner-linux-x64 /usr/bin/vintner
chmod +x /usr/bin/vintner
vintner setup init
```

The following binaries are available:

| Platform | Architecture | Binary | 
| -- | --- | --- |
| Alpine | x64 | [vintner-alpine-x64](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-alpine-x64){target=_blank} |
| Linux | arm64 | [vintner-linux-arm64](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-arm64){target=_blank} |
| Linux | x64 | [vintner-linux-x64](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-x64){target=_blank} |
| Windows | x64 | [vintner-win-x64.exe](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-win-x64.exe){target=_blank} |


To check, that the `vintner` can be executed, run

```linenums="1"
vintner --version
```

To start the server, run
```linenums="1"
vintner server start
```

To uninstall all files including the binary, run the following commands.
However, this will not undeploy currently deployed applications.

```linenums="1"
vintner setup clean
rm "$(which vintner)"
```

The following environment variables can be used for configuration.

| Environment Variable       | Default            | Description |
|----------------------------|--------------------| ----------- |
| OPENTOSCA_VINTNER_HOME_DIR | ${HOME_DIR}/.opentosca_vintner |             |

