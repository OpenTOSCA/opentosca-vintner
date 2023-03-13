# Benchmark

To benchmark our implementation of a Variability4TOSCA processor, we run several tests.
Thereby, a service template is generated and then resolved based on a seed.
A seed of value n results in 2n node templates and 2n relationship templates, thus, 4n templates.
For example, a seed of 10,000 generates 20,0000 node templates and 20,0000 relationship templates.
When variability is resolved, n node templates and n relationship templates are removed.

## Tests In-Memory

The first test suite runs the tests in-memory.
Thus, generated and resolved service templates are not read or stored to the filesystem.

| Test | Seed |  Templates | Median | Median per Template |
| --- | --- | --- | --- | --- |
| 1 | 10 | 40 | 6.204 ms | 0.155 ms |
| 2 | 250 | 1,000 | 50.665 ms | 0.051 ms |
| 3 | 500 | 2,000 | 84.782 ms | 0.042 ms |
| 4 | 1,000 | 4,000 | 155.105 ms | 0.039 ms |
| 5 | 2,500 | 10,000 | 363.789 ms | 0.036 ms |
| 6 | 5,000 | 20,000 | 714.899 ms | 0.036 ms |
| 7 | 10,000 | 40,000 | 1.478 s | 0.037 ms |


## Tests with Filesystem

The second test suite runs the tests with filesystem interaction.
Thus, generated and resolved service templates are also read and stored to the filesystem.

| Test | Seed |  Templates | Median | Median per Template |
| --- | --- | --- | --- | --- |
| 1 | 10 | 40 | 7.531 ms | 0.188 ms |
| 2 | 250 | 1,000 | 66.812 ms | 0.067 ms |
| 3 | 500 | 2,000 | 122.216 ms | 0.061 ms |
| 4 | 1,000 | 4,000 | 250.058 ms | 0.063 ms |
| 5 | 2,500 | 10,000 | 748.248 ms | 0.075 ms |
| 6 | 5,000 | 20,000 | 2.058 s | 0.103 ms |
| 7 | 10,000 | 40,000 | 6.481 s | 0.162 ms |


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
| OpenTOSCA Vintner | fa9bdbbbc6255ff8329ece49ea19295622aff938    |
| Operating System  | Windows 11                                  |
| Processor         | Intel Core i7-12700KF                       |
| Memory            | 2x Crucial RAM 32GB DDR4 3200MHz CL22       |
| Graphic Card      | GeForce RTX TM 2060 WINDFORCE OC 6G         | 
| Disk              | Samsung 970 EVO Plus 1 TB PCIe 3.0 NVMe M.2 |

## Running the Benchmark

To run the benchmark on your own, run the following command.
For more information see [Interface](../interface.md#vintner-setup-benchmark){target=_blank}.
Feel free to open a merge request, if your benchmarking results are better.

```shell linenums="1"
vintner setup benchmark
```
