# Benchmark

To benchmark our implementation of a Variability4TOSCA processor, we run several tests.
Thereby, a service template is generated and then resolved based on a seed.
A seed of value n results in 2n node templates and 2n relationship templates, thus 4n templates.
For example, a seed of 10,000 generated 20,0000 node templates and 20,0000 relationship templates.
When variability is resolved, n node templates and n relationship templates are removed.

## Tests In-Memory

The first test suite runs the tests in-memory.
Thus, generated and resolved service templates are not read or stored to the filesystem.

| Test | Seed   | Templates | Median    | Median per Template |
|------|--------|-----------|-----------|---------------------|
| 1    | 10     | 40        | 0.146 ms  | 0.004 ms            |
| 2    | 250    | 1,000     | 1.724 ms  | 0.002 ms            |
| 3    | 500    | 2,000     | 1.825 ms  | 0.001 ms            |
| 4    | 1,000  | 4,000     | 4.242 ms  | 0.001 ms            |
| 5    | 2,500  | 10,000    | 14.466 ms | 0.001 ms            |
| 6    | 5,000  | 20,000    | 30.502 ms | 0.002 ms            |
| 7    | 10,000 | 40,000    | 69.865 ms | 0.002 ms            |

## Tests with Filesystem

The second test suite runs the tests with filesystem interaction.
Thus, generated and resolved service templates are also read and stored to the filesystem.

| Test | Seed   | Templates | Median     | Median per Template |
|------|--------|-----------|------------|---------------------|
| 8    | 10     | 40        | 1.772 ms   | 0.044 ms            |
| 9    | 250    | 1,000     | 18.962 ms  | 0.019 ms            |
| 10   | 500    | 2,000     | 42.382 ms  | 0.021 ms            |
| 11   | 1,000  | 4,000     | 105.329 ms | 0.026 ms            |
| 12   | 2,500  | 10,000    | 415.814 ms | 0.042 ms            |
| 13   | 5,000  | 20,000    | 1.360 s    | 0.068 ms            |
| 14   | 10,000 | 40,000    | 4.751 s    | 0.119 ms            |

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

| Resource         | Value                                       |
|------------------|---------------------------------------------|
| Operating System | Windows 11                                  |
| Processor        | Intel Core i7-12700KF                       |
| Memory           | 2x Crucial RAM 32GB DDR4 3200MHz CL22       |
| Graphic Card     | GeForce RTX TM 2060 WINDFORCE OC 6G         | 
| Disk             | Samsung 970 EVO Plus 1 TB PCIe 3.0 NVMe M.2 |

## Running the Benchmark

To run the benchmark on your own, run the following command.
For more information see [Interface](../interface.md#setup-benchmark){target=_blank}.
Feel free to open a merge request, if your benchmarking results are better.

```linenums="1"
vintner setup benchmark
```