# Orchestrators

We currently support [xOpera](https://github.com/xlab-si/xopera-opera){target=_blank} and [Unfurl](https://github.com/onecommons/unfurl){target=_blank}.
Since both can only be installed on Linux, we implemented a [WSL](https://docs.microsoft.com/en-us/windows/wsl){target=_blank} integration for both.
Configure and enable your orchestrator as follows.
We expect, that the orchestrator is already installed.
For more information see [Interface]({{ fix_url('interface')}}){target=_blank}.

## Opera
=== "Opera"
    ```linenums="1"
    vintner orchestrators init opera
    vintner orchestrators enable --orchestrator opera
    ```

=== "Opera WSL"
    ```linenums="1"
    vintner orchestrators init opera-wsl
    vintner orchestrators enable --orchestrator opera-wsl
    ```

## Unfurl
=== "Unfurl"
    ```linenums="1"
    vintner orchestrators init unfurl
    vintner orchestrators enable --orchestrator unfurl
    ```

=== "Unfurl WSL"
    ```linenums="1"
    vintner orchestrators init unfurl-wsl
    vintner orchestrators enable --orchestrator unfurl-wsl
    ```

