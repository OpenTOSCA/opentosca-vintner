--- 
tags:
- Variability4TOSCA
---

# Benchmark

To benchmark our implementation of a Variability4TOSCA processor, we run several tests.
Thereby, a service template is generated and then resolved based on a seed.
A seed of value n results in 2n node templates and 2n relationship templates, thus, 4n templates.
For example, a seed of 10.000 generates 20.0000 node templates and 20.0000 relationship templates.
When variability is resolved, n node templates and n relationship templates are removed.
An concrete example is given below.

## Tests In-Memory

The first test suite runs the tests in-memory.
Thus, generated and resolved service templates are not read or stored to the filesystem.

| Test | Seed   | Templates | Median     | Median per Template |
|------|--------|-----------|------------|---------------------|
| 1    | 10     | 40        | 7.977 ms   | 0.199 ms            |
| 2    | 250    | 1,000     | 66.491 ms  | 0.066 ms            |
| 3    | 500    | 2,000     | 118.496 ms | 0.059 ms            |
| 4    | 1,000  | 4,000     | 221.834 ms | 0.055 ms            |
| 5    | 2,500  | 10,000    | 569.105 ms | 0.057 ms            |
| 6    | 5,000  | 20,000    | 1.161 s    | 0.058 ms            |
| 7    | 10,000 | 40,000    | 2.446 s    | 0.061 ms            |

## Tests with Filesystem

The second test suite runs the tests with filesystem interaction.
Thus, generated and resolved service templates are also read and stored to the filesystem.

| Test | Seed   | Templates | Median     | Median per Template |
|------|--------|-----------|------------|---------------------|
| 1    | 10     | 40        | 19.455 ms  | 0.486 ms            |
| 2    | 250    | 1,000     | 85.688 ms  | 0.086 ms            |
| 3    | 500    | 2,000     | 150.985 ms | 0.075 ms            |
| 4    | 1,000  | 4,000     | 283.774 ms | 0.071 ms            |
| 5    | 2,500  | 10,000    | 698.729 ms | 0.070 ms            |
| 6    | 5,000  | 20,000    | 1.410 s    | 0.070 ms            |
| 7    | 10,000 | 40,000    | 2.880 s    | 0.072 ms            |


## File Measurements

The written variable service templates have the following measurements.

| Test | Seed   | File Size | File Lines |
|------|--------|-----------|------------|
| 1    | 10     | 10 kb     | 322        |
| 2    | 250    | 254 kb    | 7,762      |
| 3    | 500    | 509 kb    | 15,512     |
| 4    | 1,000  | 1.019 mb  | 31,012     |
| 5    | 2,500  | 2.578 mb  | 77,512     |
| 6    | 5,000  | 5.175 mb  | 155,012    |
| 7    | 10,000 | 10.370 mb | 310,012    |


## Computing Resources

The following computing resources have been used for the benchmark.

| Resource          | Value                                       |
|-------------------|---------------------------------------------|
| Date              | 2023-10-08                                  | 
| OpenTOSCA Vintner | 5de5700e5d63240325bc720459e0eb11b3e4c642    |
| Operating System  | Windows 11                                  |
| Processor         | Intel Core i7-12700KF                       |
| Memory            | 2x Crucial RAM 32GB DDR4 3200MHz CL22       |
| Motherboard       | ASRock H670 PG Riptide Intel H670           |
| Graphic Card      | GeForce RTX TM 2060 WINDFORCE OC 6G         | 
| Disk              | Samsung 970 EVO Plus 1 TB PCIe 3.0 NVMe M.2 |

## Running the Benchmark

To run the benchmark on your own, run the following command.
For more information see [Interface](../interface.md#vintner-setup-benchmark){target=_blank}.
Feel free to open a merge request, if your benchmarking results are better.

```shell linenums="1"
vintner setup benchmark --markdown --io
```

## Service Template Under Test

The following is an example of the expected service template that is under test when the seed is 2.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
    variability:
        inputs:
            mode: { type: string }
        expressions:
            condition_0_present: { equal: [ { variability_input: mode }, present ] }
            condition_0_removed: { equal: [ { variability_input: mode }, absent ] }
            condition_1_present: { equal: [ { variability_input: mode }, present ] }
            condition_1_removed: { equal: [ { variability_input: mode }, absent ] }

    node_templates:
        component_0_present:
            type: component_type_0_present
            conditions: { logic_expression: condition_0_present }
            requirements:
                -   relation_present:
                        node: component_1_present
                        conditions: { logic_expression: condition_0_present }
                        relationship: relationship_0_present
                -   relation_removed:
                        node: component_1_removed
                        conditions: { logic_expression: condition_0_removed }
                        relationship: relationship_0_removed
        component_0_removed:
            type: component_type_0_removed
            conditions: { logic_expression: condition_0_removed }
        component_1_present:
            type: component_type_1_present
            conditions: { logic_expression: condition_1_present }
            requirements:
                -   relation_present:
                        node: component_0_present
                        conditions: { logic_expression: condition_1_present }
                        relationship: relationship_1_present
                -   relation_removed:
                        node: component_0_removed
                        conditions: { logic_expression: condition_1_removed }
                        relationship: relationship_1_removed
        component_1_removed:
            type: component_type_1_removed
            conditions: { logic_expression: condition_1_removed }

    relationship_templates:
        relationship_0_present:
            type: relationship_type_0_present
        relationship_0_removed:
            type: relationship_type_0_removed
        relationship_1_present:
            type: relationship_type_1_present
        relationship_1_removed:
            type: relationship_type_1_removed
```