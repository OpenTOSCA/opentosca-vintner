# consistency-throw-relation-target-missing


## Variable Service Template

The variability of the following variable service template shall be resolved.

```yaml linenums="1"
tosca_definitions_version: tosca_variability_1_0
topology_template:
  node_templates:
    one:
      type: one
      conditions: false
      requirements:
        - two:
            node: two
    two:
      type: two
    three:
      type: three

```








## Expected Error

The following error is expected to be thrown, when resolving variability.

```text linenums="1"
Relation source "one" of relation "one.two" does not exist

```

