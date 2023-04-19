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
| 1    | 10     | 40        | 7.023 ms   | 0.176 ms            |
| 2    | 250    | 1,000     | 56.709 ms  | 0.057 ms            |
| 3    | 500    | 2,000     | 95.085 ms  | 0.048 ms            |
| 4    | 1,000  | 4,000     | 173.351 ms | 0.043 ms            |
| 5    | 2,500  | 10,000    | 404.273 ms | 0.040 ms            |
| 6    | 5,000  | 20,000    | 807.451 ms | 0.040 ms            |
| 7    | 10,000 | 40,000    | 1.663 s    | 0.042 ms            |

## Tests with Filesystem

The second test suite runs the tests with filesystem interaction.
Thus, generated and resolved service templates are also read and stored to the filesystem.

| Test | Seed   | Templates | Median     | Median per Template |
|------|--------|-----------|------------|---------------------|
| 1    | 10     | 40        | 6.403 ms   | 0.160 ms            |
| 2    | 250    | 1,000     | 72.906 ms  | 0.073 ms            |
| 3    | 500    | 2,000     | 131.841 ms | 0.066 ms            |
| 4    | 1,000  | 4,000     | 267.690 ms | 0.067 ms            |
| 5    | 2,500  | 10,000    | 793.815 ms | 0.079 ms            |
| 6    | 5,000  | 20,000    | 2.151 s    | 0.108 ms            |
| 7    | 10,000 | 40,000    | 6.433 s    | 0.161 ms            |

## File Measurements

The written variable service templates have the following measurements.

| Seed   | File Size | File Lines |
|--------|-----------|------------|
| 10     | 10 kb     | 320        |
| 250    | 264 kb    | 7,760      |
| 500    | 531 kb    | 15,510     |
| 1,000  | 1.063 mb  | 31,010     |
| 2,500  | 2.688 mb  | 77,510     |
| 5,000  | 5.395 mb  | 155,010    |
| 10,000 | 10.810 mb | 310,010    |

## Computing Resources

The following computing resources have been used for the benchmark.

| Resource          | Value                                       |
|-------------------|---------------------------------------------|
| Date              | 2023-04-19                                  | 
| OpenTOSCA Vintner | bb58a6134cde8e37d602a0aa24b62082fcc14962    |
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
vintner setup benchmark
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