---
title: Testing
tags: 
- Variability4TOSCA
- Specification
---

--8<-- "enumerate.html"

# Variability4TOSCA Testing 1.0 Release Candidate

This document specifies variability tests for the Variability4TOSCA specification to continuously test that the variability is resolved as expected, e.g., during
continuous integration pipelines or before importing the CSAR.
The specification is under active development and is not backwards compatible with any previous versions.

## Variability Tests

A CSAR might contain variability tests.
Therefore, add the directory `/tests` in the root of the CSAR.
Each test is defined inside its own directory of `/tests` and might contain the following files.

| File            | Description                                    |
|-----------------|------------------------------------------------|
| `expected.yaml` | The expected service template after resolving variability. |
| `inputs.yaml`   | The variability inputs used for resolving variability. |
| `test.yaml`     | The test configuration.                        |

Here is an exemplary structure of a CSAR that has one variability test.

```text linenums="1"
<CSAR Name>/
├─ tests/
│  ├─ <Test Name>/
│  │  ├─ expected.yaml
│  │  ├─ inputs.yaml
│  │  ├─ test.yaml
├─ service-template.yaml
```

The following configurations can be configured in the test configuration file.

| Keyname     | Mandatory | Type                       | Description                                                                                  |
|-------------|-----------|----------------------------|----------------------------------------------------------------------------------------------|
| name        | false     | String                     | Display name of the test case (default is the directory name).                               | 
| description | false     | String                     | Description of the test case.                                                                | 
| presets     | false     | String &#124; List(String) | Variability presets to use when resolving variability.                                       | 
| error       | false     | String                     | The expected error that is thrown.                                                           | 
| expected    | false     | String                     | Path (relative to `test.yaml`) to the expected service template after resolving variability. | 


There are the following special cases considering test directory names.

- **Hidden Directories**: Directories starting with `.` are ignored.
- **Isolating Tests**: Append `---only` to a test directory to run only this specific test.
- **Disabling Tests**: Append `---disabled` to a test directory to disable a specific test.


## Example

The following service template contains two conditional nodes.
A variability inputs decides which node should be present.

```yaml linenums="1" title="/my-testing-csar/service-template.yaml"
tosca_definitions_version: tosca_variability_1_0

topology_template:
    variability:
        inputs:
            mode:
                type: string

        options:
            type_default_condition: true

    node_templates:
        node_one:
            type: tosca.nodes.Root
            conditions: {equal: [{variability_input: mode}, one]}

        node_two:
            type: tosca.nodes.Root
            conditions: {equal: [{variability_input: mode}, two]}
```

We specify the following test in which we expect that only the first node is present after resolving variability.

```yaml linenums="1" title="/my-testing-csar/my-test/test.yaml"
name: My Test
descriptions: | 
    This tests is a simple example.
    We expect the following: 
    - First node is preserved
    - Second node is removed
```

The following inputs are used. 

```yaml linenums="1" title="/my-testing-csar/my-test/inputs.yaml"
mode: one
```

We expect the following service template.

```yaml linenums="1" title="/my-testing-csar/my-test/expected.yaml"
tosca_definitions_version: tosca_simple_yaml_1_3

topology_template:
    node_templates:
        node_one:
            type: tosca.nodes.Root
```

To execute the test using our reference implementation, run the following command.

```shell linenums="1"
vintner template test --path path/to/my-testing-csar/
```

--8<-- "vacd.md"
