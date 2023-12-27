---
tags:
- Vintner
- Guide
---

# Getting Started

{{ asciinema_player('getting-started') }}

In this example, we will deploy a textfile on our local machine which has a different content depending on our input.
This is just a simple example without any dependencies, such as a Docker Engine or a cloud.
For a more complex scenario including OpenStack and GCP see
[Motivating Scenario](./variability4tosca/motivation/index.md){target=_blank}.
First, install OpenTOSCA Vintner.

In our case, we run on a Linux machine.
For more information see [Installation](./installation.md){target=_blank}.

--8<-- "install.md"

We currently support [xOpera](https://github.com/xlab-si/xopera-opera){target=_blank} and [Unfurl](https://github.com/onecommons/unfurl){target=_blank}.
Since both can only be installed on Linux, we implemented a [WSL](https://docs.microsoft.com/en-us/windows/wsl){target=_blank}
integration for both.
Configure and enable your orchestrator.
For more information see [Installation](./installation.md){target=_blank}.

```shell linenums="1"
vintner orchestrators init xopera
vintner orchestrators enable --orchestrator xopera
```

Next, we clone the repository.
--8<-- "clone.md"

Next, we import the template.

```shell linenums="1"
vintner templates import --template getting-started --path examples/xopera-getting-started
```

Next, we initialize an instance.

```shell linenums="1"
vintner instances init --instance getting-started --template getting-started
```

The imported template contains the following conditional node templates.

```yaml linenums="1"
first:
    type: textfile
    conditions: {logic_expression: is_first}
    properties:
        content: 'First Textfile has been selected!'
    requirements:
        - host: 
            node: localhost
            conditions: {logic_expression: is_first}

second:
    type: textfile
    conditions: {logic_expression: is_second}
    properties:
        content: 'Second Textfile has been selected!'
    requirements:
        - host: 
            node: localhost
            conditions: {logic_expression: is_second}
```

We decide that the first textfile should be deployed.
Therefore, we resolve the variability. 

```shell linenums="1"
vintner instances resolve --instance getting-started --inputs examples/xopera-getting-started/variability-inputs.example.yaml
```

Finally, we deploy the application.

```shell linenums="1"
vintner instances deploy --instance getting-started
```

The deployed textfile has the content as expected.

```text linenums="1" title="/tmp/vintner-getting-started.txt"
First Textfile has been selected!
```

To undeploy, run the following command.

```shell linenums="1"
vintner instances undeploy --instance getting-started
```
