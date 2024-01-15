---
tags:
- Vintner
- Docker
---

# Uninstallation

!!! Warning
    Undeploy all applications first.

This document holds instructions on uninstalling Vintner.

Depending on the installation method, uninstall Vintner as follows.

=== "Script/ Manual"
    ```shell linenums="1"
    vintner setup clean --force
    rm "$(which vintner)"
    ```

=== "NPM"
    ```shell linenums="1"
    vintner setup clean --force
    npm uninstall --global opentosca-vintner
    ```

=== "Yarn (Classic)"
    ```shell linenums="1"
    vintner setup clean --force
    yarn global remove opentosca-vintner
    ```

=== "Docker"
    ```shell linenums="1"
    docker stop vintner
    docker remove vintner
    ```
    
    Next, remove the directories used to persists container data on the docker host.
