---
title: Testing
---

# Variability4TOSCA Testing 1.0 Release Candidate

This document specifies variability tests for the Variability4TOSCA specification.
The specification is under active development and is not backwards compatible with any previous versions.

A CSAR might contain variability tests to continuously test that the variability is resolved as expected, e.g., during
continuous integration pipelines.
Therefore, add the directory `/tests` in the root of the CSAR.
Each test is defined inside its own directory of `/tests` and might contain the following files.

| File            | Description                                                |
|-----------------|------------------------------------------------------------|
| `expected.yaml` | The expected service template after resolving variability. |
| `inputs.yaml`   | The variability inputs used for resolving variability.     |
| `test.yaml`     | A description of the test including configuration.         |

Here is exemplary structure of a CSAR that has one variability test.

```text linenums="1"
my-csar/
├─ tests/
│  ├─ my-test-case/
│  │  ├─ expected.yaml
│  │  ├─ inputs.yaml
│  │  ├─ test.yaml
├─ service-template.yaml
```

The `test.yaml` file describes and configures the test and has the following structure.

| Keyname     | Mandatory | Type                       | Description                                                                                 |
|-------------|-----------|----------------------------|---------------------------------------------------------------------------------------------|
| name        | false     | String                     | Display name of the test case.                                                              | 
| description | false     | String                     | Description of the test case.                                                               | 
| presets     | false     | String &#124; List(String) | Variability presets to use when resolving variability.                                      | 
| error       | false     | String                     | The expected error that is thrown.                                                          | 
| expected    | false     | String                     | Path (relative to `test.yaml`) to the expected service template after resolving variability. | 
