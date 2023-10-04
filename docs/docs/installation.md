---
tags:
- Vintner
---

# Installation

In this document, we describe ways to install `vintner`.

## NPM 

`vintner` can be installed using `npm`.
Ensure, that `npm bin -g` is in your `$PATH`.

```shell linenums="1"
npm install --global opentosca-vintner
```

## Yarn v1

`vintner` can be installed using `yarn` (classic).
Ensure, that `yarn global bin` is in your `$PATH`.

```shell linenums="1"
yarn global add opentosca-vintner
```

## Yarn v2

`vintner` can be installed using `yarn` (modern).
However, this will not install `vintner` permanently but only temporary.

```shell linenums="1"
yarn dlx opentosca-vintner
```

## Docker 

```shell linenums="1"
mkdir vintner
cd vintner

mkdir data
mkdir shared
```

```shell linenums="1"
docker run --detach --rm --interactive --tty \\
  --env OPENTOSCA_VINTNER_HOME_DIR=/vintner/data \\
  --volume ./data:/vintner/data \\
  --volume ./shared:/vintner/shared  \\
  --name vintner \\
  opentosca/opentosca-vintner:latest
```

```shell linenums="1"
docker exec -it vintner --version
```

```shell linenums="1"
alias vintner="docker exec -it vintner vintner"
```

```shell linenums="1"
docker stop vintner
```

```shell linenums="1"
docker exec -it vintner terraform login
```

```shell linenums="1"
docker exec -it vintner vintner init xopera --no-venv 
docker exec -it vintner vintner enable --orchestrator xopera
```

```shell linenums="1"
docker exec -it vintner vintner init unfurl --no-venv
docker exec -it vintner vintner enable --orchestrator unfurl
```


```shell linenums="1"
docker exec -it vintner /bin/sh
```


## Script

`vintner` can be installed using our installation script. 
The script currently supports only Linux x64 and arm64.
For the remaining supported platforms and architectures, see the manual installation.

```shell linenums="1"
curl -fsSL https://vintner.opentosca.org/install.sh | sudo bash -
vintner setup init
```

To install a specific version, run 

```shell linenums="1"
curl -fsSL https://vintner.opentosca.org/install.sh | sudo VERSION=${VERSION} bash -
```

## Manual

To manually install `vintner`, download the binary for your system.
There are no other dependencies required. 
You might add the binary to your `$PATH`.
The following example shows the installation on Linux.
See [below](#signature) for verifying the signature of the binary.

=== "Linux x64"
    ```shell linenums="1"
    wget https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-x64.xz
    tar -xf vintner-linux-x64.xz
    rm vintner-linux-x64.xz
    mv vintner-linux-x64 /usr/bin/vintner
    chmod +x /usr/bin/vintner
    vintner setup init
    ```

=== "Linux arm64"
    ```shell linenums="1"
    wget https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-arm64.xz
    tar -xf vintner-linux-arm64.xz
    rm vintner-linux-arm64.xz
    mv vintner-linux-arm64 /usr/bin/vintner
    chmod +x /usr/bin/vintner
    vintner setup init
    ```

=== "Alpine x64"
    ```shell linenums="1"
    wget https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-alpine-x64.xz
    tar -xf vintner-alpine-x64.xz
    rm vintner-alpine-x64.xz
    mv vintner-alpine-x64 /usr/bin/vintner
    chmod +x /usr/bin/vintner
    vintner setup init
    ```

The following binaries are available:

| Platform | Architecture | Binary | Archive | Signature | 
| -- | -- | -- | -- | -- |
| Alpine | x64 | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-alpine-x64){target=_blank} | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-alpine-x64.xz){target=_blank} | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-alpine-x64.asc){target=_blank} |
| Linux | arm64 | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-arm64){target=_blank} | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-arm64.xz){target=_blank} | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-arm64.asc){target=_blank} |
| Linux | x64 | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-x64){target=_blank} | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-x64.xz){target=_blank} | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-x64.asc){target=_blank} |
| Windows | x64 | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-win-x64.exe){target=_blank} |  [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-win-x64.exe.xz){target=_blank} |  [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-win-x64.exe.asc){target=_blank} |

To check, that `vintner` can be executed, run

```shell linenums="1"
vintner --version
```

To start the server, run
```shell linenums="1"
vintner server start
```

To uninstall all files including the binary, run the following commands.
_This will not undeploy currently deployed applications_.

```shell linenums="1"
vintner setup clean --force
rm "$(which vintner)"
```

## Configuration

The following environment variables can be used for configuration.

| Environment Variable       | Default            | Description |
|----------------------------|--------------------| ----------- |
| OPENTOSCA_VINTNER_HOME_DIR | ${HOME_DIR}/.opentosca_vintner |             |

## Signature

To verify a signature of a binary, first import our public key and download the respective signature.
The following is a walkthrough for `vintner-linux-x64` using `gpg`.

First, import our public key.

```shell linenums="1"
curl https://vintner.opentosca.org/vintner-release.gpg | gpg --import
```

Then download and verify the respective signature.

```shell linenums="1"
wget https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-x64.asc
gpg --verify vintner-linux-x64.asc
```

The output should be something as follows.

```text linenums="1"
gpg: assuming signed data in 'vintner-linux-x64'
gpg: Signature made Sun Oct 23 19:12:56 2022 UTC
gpg:                using RSA key 4BB862B810B792CC072D59DB964183A1485881AD
gpg: Good signature from "vintner-release" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 4BB8 62B8 10B7 92CC 072D  59DB 9641 83A1 4858 81AD
```

This is the public key that should be used for verification ([download](https://vintner.opentosca.org/vintner-release.gpg){target=_blank}).

```shell linenums="1"
pub   rsa4096/964183A1485881AD 2022-10-23 [SC]
      4BB862B810B792CC072D59DB964183A1485881AD
uid                 [unknown] vintner-release
sub   rsa4096/B230BD6651AA1BB8 2022-10-23 [E]
```

```text linenums="1"
-----BEGIN PGP PUBLIC KEY BLOCK-----

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
q2BZ9kJ+ruFawgv9hjTz2vYO/EGXwZuqcvHB
=MPBe
-----END PGP PUBLIC KEY BLOCK-----
```
