---
tags:
- Vintner
- Docker
---

# Installation

This document holds instructions on installing Vintner.


## Script

Vintner can be installed on Linux x64/ arm64 and Windows x64 using our installation scripts.

=== "Linux x64/ arm64"
    ```shell linenums="1"
    curl -fsSL https://vintner.opentosca.org/install.sh | sudo bash -
    ```

    Install a specific version as follows. 
    
    ```shell linenums="1"
    curl -fsSL https://vintner.opentosca.org/install.sh | sudo VERSION=${VERSION} bash -
    ```

=== "Windows x64"
    ```powershell linenums="1"
    powershell -Command "& {Invoke-WebRequest -Uri 'https://vintner.opentosca.org/install.ps1' -UseBasicParsing | Invoke-Expression}"
    ```

    Install a specific version as follows.
    
    ```powershell linenums="1"
    Invoke-WebRequest -Uri "https://vintner.opentosca.org/install.ps1" -OutFile install.ps1
    $env:VERSION = "DESIRED_VERSION"
    powershell -ExecutionPolicy Bypass -File .\install.ps1
    Remove-Item install.ps1
    ```

## NPM 

Vintner can be installed using `npm`.
Ensure, that `npm bin -g` is in your `$PATH`.

```shell linenums="1"
npm install --global opentosca-vintner
```

## Yarn (Classic)

Vintner can be installed using `yarn` (classic).
Ensure, that `yarn global bin` is in your `$PATH`.

```shell linenums="1"
yarn global add opentosca-vintner
```

## Yarn (Modern)

Vintner can be installed using `yarn` (modern).
However, this will not install Vintner permanently but only [temporary](https://yarnpkg.com/migration/guide#use-yarn-dlx-instead-of-yarn-global){target=_blank}.

```shell linenums="1"
yarn dlx opentosca-vintner
```

## Choco

Vintner can be installed using `choco`.

```shell linenums="1"
choco install opentosca-vintner -y
```

## Docker 

Vintner can be installed using Docker. 
The Image is about 3GB large and contains tools, such as xOpera, Unfurl, Ansible, Terraform, and all of our examples.

### GitHub Container Registry 

Pull the latest image from the {{ link('https://github.com/OpenTOSCA/opentosca-vintner/pkgs/container/opentosca-vintner', 'GitHub Container Registry') }}.

```shell linenums="1"
docker pull ghcr.io/opentosca/opentosca-vintner:latest
```

### Starting the Container

First, we create directories for persisting data.

```shell linenums="1"
mkdir vintner
cd vintner

mkdir data
mkdir shared
```

Next, we start the container.

```shell linenums="1"
docker run \
  --detach \
  --volume ${PWD}/data:/vintner/data \
  --volume ${PWD}/shared:/vintner/shared  \
  --network host \
  --name vintner \
  ghcr.io/opentosca/opentosca-vintner:latest
```

The command consists of the following aspects.

- `--detach` starts the container in the background.
- `--volume ${PWD}/data:/vintner/data` persists all data written by Vintner.
- `--volume ${PWD}/shared:/vintner/shared` should be used to share data between the host and the container, e.g., CSARs or GCP credentials.
- `--network host` uses the host network, e.g., for ipv6 support.
- `--name vintner` is the container name. 
- `ghcr.io/opentosca/opentosca-vintner:latest` pulls the latest Docker Image

Inside the container, the following directories are of interest.

- `/vintner/data` holds all data written by Vintner.
- `/vintner/shared` should be used to share data between the host and the container, e.g., CSARs or GCP credentials.
- `/vintner/examples` holds the examples directory of the repository.


### Executing a Command

The container runs in the background. 
Vintner is executed as follows.

```shell linenums="1"
docker exec -it vintner vintner --version
```

On Linux, we set an alias to directly use Vintner as command in the terminal on the docker host.
To persist the alias, add the alias, e.g., to `~/.bashrc` (requires reloading the session).

```shell linenums="1"
alias vintner="docker exec -it vintner vintner"
```

Now, Vintner is available as follows.

```shell linenums="1"
vintner --version
```


### xOpera

xOpera is already installed inside the container and Vintner is already correctly configured to connect to xOpera.
By default, xOpera is already enabled.
Enable xOpera as follows.

```shell linenums="1"
docker exec -it vintner vintner orchestrators enable --orchestrator xopera
```

### Unfurl

Unfurl is already installed inside the container and Vintner is already correctly configured to connect to Unfurl.
Enable Unfurl as follows.

```shell linenums="1"
docker exec -it vintner vintner orchestrators enable --orchestrator unfurl
```

### Stopping the Container

Ensure to only stop Vintner, once Vintner is idle. 
Otherwise, data and deployments will be corrupted.
Stop the container as follows.

```shell linenums="1"
docker stop vintner
```

### Watching the Logs of the Container

Watch the logs of the container as follows.

```shell linenums="1"
docker logs -f vintner
```


### Debugging the Container

In case we need to debug something inside the container or perform any administrative ./tasks, we can exec into the container as follows. 
This starts a shell inside the container.

```shell linenums="1"
docker exec -it vintner /bin/bash
```


## Manual

Install Vintner manually by downloading the binary for your system and adding it to `$PATH`.
There are no other dependencies required. 
The following example shows the installation on selected platforms and architectures.

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

=== "Windows x64"
    First, create the directory `$env:USERPROFILE\bin` and add it to your PATH.
    We recommend to do this manually.

    ```powershell linenums="1"
    $userBin = "$env:USERPROFILE\bin"
    if (-not (Test-Path -Path $userBin)) {
        New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\bin"
        $userPath = [System.Environment]::GetEnvironmentVariable("PATH", [System.EnvironmentVariableTarget]::User)
        $newPath = "$userPath$userBin;"
        [System.Environment]::SetEnvironmentVariable("PATH", $newPath, [System.EnvironmentVariableTarget]::User)
    }
    ```

    Next, install vintner.

    ```powershell linenums="1"
    $userBin = "$env:USERPROFILE\bin"
    Invoke-WebRequest -URI https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-win-x64.exe.xz -OutFile vintner-win-x64.exe.xz
    tar -xf vintner-win-x64.exe.xz
    Remove-Item vintner-win-x64.exe.xz
    Move-Item vintner-win-x64.exe $userBin\vintner.exe
    vintner setup init
    ```

The following binaries are available:

| Platform | Architecture | Binary | Archive | Signature | Checksum                                                                                                                  
| -- | -- | -- | -- | -- |---------------------------------------------------------------------------------------------------------------------------|
| Alpine | x64 | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-alpine-x64){target=_blank} | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-alpine-x64.xz){target=_blank} | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-alpine-x64.asc){target=_blank} | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-alpine-x64.sha256){target=_blank}     |
| Linux | arm64 | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-arm64){target=_blank} | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-arm64.xz){target=_blank} | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-arm64.asc){target=_blank} | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-arm64.sha256){target=_blank}    |
| Linux | x64 | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-x64){target=_blank} | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-x64.xz){target=_blank} | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-x64.asc){target=_blank} | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-x64.sha256){target=_blank}      |
| Windows | x64 | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-win-x64.exe){target=_blank} |  [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-win-x64.exe.xz){target=_blank} |  [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-win-x64.exe.asc){target=_blank} | [link](https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-win-x64.exe.sha256){target=_blank} |


## Checksum 

To verify the integrity of a binary, proceed as follows.
The following is a walkthrough for `vintner-linux-x64`.
We assume that `vintner-linux-x64` is present in the current working directory.

```shell linenums="1"
wget https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-x64.sha256
sha256sum --check vintner-linux-x64.sha256
```


## Signature

Every binary is cryptographically signed.

### Verification

To verify a signature of a binary, first import our public key and download the respective signature.
The following is a walkthrough for `vintner-linux-x64` using `gpg`.
We assume that `vintner-linux-x64` is present in the current working directory.

First, we import the public key.

```shell linenums="1"
curl https://vintner.opentosca.org/vintner-release.gpg | gpg --import
```

Next, we download the signature.

```shell linenums="1"
wget https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-x64.asc
```

Next, we verify the signature.

```shell linenums="1"
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

### Public Key

The following public key shall be used for verifying signatures. 
The public key is also available as [download](https://vintner.opentosca.org/vintner-release.gpg){target=_blank}.

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
