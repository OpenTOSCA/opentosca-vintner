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
| 1    | 10     | 40        | 6.814 ms   | 0.170 ms            |
| 2    | 250    | 1,000     | 47.356 ms  | 0.047 ms            |
| 3    | 500    | 2,000     | 83.033 ms  | 0.042 ms            |
| 4    | 1,000  | 4,000     | 153.731 ms | 0.038 ms            |
| 5    | 2,500  | 10,000    | 348.550 ms | 0.035 ms            |
| 6    | 5,000  | 20,000    | 676.006 ms | 0.034 ms            |
| 7    | 10,000 | 40,000    | 1.407 s    | 0.035 ms            |

## Tests with Filesystem

The second test suite runs the tests with filesystem interaction.
Thus, generated and resolved service templates are also read and stored to the filesystem.

| Test | Seed   | Templates | Median     | Median per Template |
|------|--------|-----------|------------|---------------------|
| 1    | 10     | 40        | 6.505 ms   | 0.163 ms            |
| 2    | 250    | 1,000     | 60.408 ms  | 0.060 ms            |
| 3    | 500    | 2,000     | 105.211 ms | 0.053 ms            |
| 4    | 1,000  | 4,000     | 199.979 ms | 0.050 ms            |
| 5    | 2,500  | 10,000    | 479.681 ms | 0.048 ms            |
| 6    | 5,000  | 20,000    | 966.606 ms | 0.048 ms            |
| 7    | 10,000 | 40,000    | 1.979 s    | 0.049 ms            |


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

| Resource          | Value                                      |
|-------------------|--------------------------------------------|
| Date              | 2023-11-26                                 | 
| OpenTOSCA Vintner | 2eb5b1670413a0c1b335af414ed53e80b18ddbf2   |
| Operating System  | Windows 11                                 |
| Processor         | Intel Core i7-12700KF                      |
| Memory            | 2x Crucial RAM 32GB DDR4 3200MHz CL22      |
| Motherboard       | ASRock H670 PG Riptide Intel H670          |
| Graphic Card      | GeForce RTX TM 2060 WINDFORCE OC 6G        | 
| Disk              | Samsung 990 Pro NVMe M.2 SSD PCIe 4.0 1TB  |

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