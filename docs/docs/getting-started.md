# Getting Started

{{ asciinema_player('getting-started') }}

In this example, we will deploy a textfile on our local machine which has a different content depending on our input.
This is just a simple example without any dependencies such as a Docker Engine or a cloud.
For a more complex scenario including OpenStack and GCP see [Motivating Scenario]({{ fix_url('variability4tosca/motivation')}}){target=_blank}.
First, install OpenTOSCA Vintner.

In our case, we run on a Linux machine.
For more information see [Installation]({{ fix_url('installation')}}){target=_blank}.

```linenums="1"
wget -q https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-x64
mv vintner-linux-x64 /usr/bin/vintner
chmod +x /usr/bin/vintner
vintner setup init
```

We currently support [xOpera](https://github.com/xlab-si/xopera-opera){target=_blank} and [Unfurl](https://github.com/onecommons/unfurl){target=_blank}. 
Since both can only be installed on Linux, we implemented a [WSL](https://docs.microsoft.com/en-us/windows/wsl){target=_blank} integration for both.
Configure and enable your orchestrator.
For more information see [Installation]({{ fix_url('installation')}}){target=_blank}.

```linenums="1"
vintner orchestrators init opera
vintner orchestrators enable --orchestrator opera
```

Next, we import the `getting-started` template from [`examples/opera-getting-started`]({{ get_repo_url('examples/opera-getting-started') }}){target=_blank} and create an application instance.

```linenums="1"
vintner templates import --template getting-started --path examples/opera-getting-started
vintner instances create --instance getting-started --template getting-started
```


The imported template contains the following conditional node templates.

```linenums="1"
first:
    type: textfile
    conditions: {get_variability_expression: is_first}
    properties:
        content: 'First Textfile has been selected!'
    requirements:
        - host: 
            node: localhost
            conditions: {get_variability_expression: is_first}

second:
    type: textfile
    conditions: {get_variability_expression: is_second}
    properties:
        content: 'Second Textfile has been selected!'
    requirements:
        - host: 
            node: localhost
            conditions: {get_variability_expression: is_second}
```

We decide that the first textfile should be deployed.
Therefore, we resolve the variability and finally deploy the application.

```linenums="1"
vintner instances resolve --instance getting-started --inputs examples/opera-getting-started/inputs.example.yaml
vintner instances deploy --instance getting-started
```

The deployed textfile `/tmp/vintner-getting-started.txt` has the content as expected.
```linenums="1"
First Textfile has been selected!
```

To undeploy, run the following command.

```linenums="1"
vintner instances undeploy --instance getting-started
```
