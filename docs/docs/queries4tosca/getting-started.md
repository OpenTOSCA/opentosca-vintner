# Getting Started

There is no standardized way to query TOSCA repositories or instance data. 
Therefore, we introduce Queries4TOSCA which defined a query language for TOSCA. 
This language provides a graph-based query language which includes path expressions, filters, and pattern matching. 
This section will give a quick introduction to Queries4TOSCA.

## Preparation

To run the example queries, you need to install OpenTOSCA Vintner and have a resolved instance of the ["Getting Started" template](../getting-started.md){target=_blank}.
First, clone the repository. 
--8<-- "clone.md"

Then import the template, create an instance, and resolve the variability.

```shell linenums="1"
# Import (and resolve) the template
vintner templates import --template getting-started --path examples/xopera-getting-started
vintner instances create --instance getting-started --template getting-started
vintner instances resolve --instance getting-started --inputs examples/xopera-getting-started/variability-inputs.example.yaml
```

## Example Queries

Queries start with a `FROM` statement, followed by either `templates` or `instances` and the name of the template or the name of the instance, respectively.
Inside a `SELECT` statement, you can enter a path to the data that you want to return.

To get the entire contents of the template, run the following command.

=== "Query"
    ```shell linenums="1"
    vintner query --query "\
        FROM templates.getting-started \
        SELECT ."
    ```

=== "Result"
    ```yaml linenums="1"
    tosca_definitions_version: tosca_simple_yaml_1_3
    node_types:
      textfile:
        derived_from: tosca.nodes.SoftwareComponent
        properties:
          content:
            type: string
        interfaces:
          Standard:
            inputs:
              content:
                value:
                  get_property:
                    - SELF
                    - content
                type: string
            operations:
              create: create.yaml
              delete: delete.yaml
    topology_template:
      node_templates:
        localhost:
          type: tosca.nodes.Compute
          attributes:
            private_address: localhost
            public_address: localhost
        first:
          type: textfile
          properties:
            content: First Textfile has been selected!
          requirements:
            - host:
                node: localhost
    ```

You can return specific elements by specifying their path. Note, that `topology_template` can be omitted at the start.
The following command returns the contents of the `localhost` node.

=== "Query"
    ```shell linenums="1"
    vintner query --query "\
        FROM templates.getting-started \
        SELECT node_templates.localhost"
    ```

=== "Result"
    ```yaml linenums="1"
    type: tosca.nodes.Compute
    attributes:
        private_address: localhost
        public_address: localhost
    ```

You can use an asterisk as a wildcard operator to get all child elements. The following command returns a list of all nodes.

=== "Query"
    ```shell linenums="1"
    vintner query --query "\
        FROM templates.getting-started \
        SELECT node_templates.*"
    ```

=== "Result"
    ```yaml linenums="1"
    - type: tosca.nodes.Compute
      attributes:
        private_address: localhost
        public_address: localhost
    - type: textfile
      properties:
        content: First Textfile has been selected!
      requirements:
        - host:
            node: localhost
    ```


You can also specify a predicate in square brackets after any part of the path expression to filter elements.
The following command will return only nodes of type `textfile`.

=== "Query"
    ```shell linenums="1"
    vintner query --query "\
        FROM templates.getting-started \
        SELECT node_templates.*[type='textfile']"
    ```

=== "Result"
    ```yaml linenums="1"
    type: textfile
    properties:
      content: First Textfile has been selected!
    requirements:
      - host:
          node: localhost
    ```

In cases where you are only interested in some elements of a node, you can use a return structure to restrict the output
to certain variables. To do this, put curly braces with key-value pairs behind your path expression. 
The following command will return only the `content` property of the `first` node.

=== "Query"
    ```shell linenums="1" 
    vintner query --query "\
        FROM templates.getting-started \
        SELECT node_templates.first{'Type': type, 'Text': properties.content}"
    ```

=== "Result"
    ```yaml linenums="1"
    Type: textfile
    Text: First Textfile has been selected!
    ```

This also works on arrays. The following command returns an array that consists of the name and type of each node. 
Note the lack of quotation marks - we are using a value from the template for both key and value of the return object.

=== "Query"
    ```shell linenums="1"
    vintner query --query "\
        FROM templates.getting-started \
        SELECT node_templates.*{name: type}"
    ```

=== "Result"
    ```yaml linenums="1"
    - localhost: tosca.nodes.Compute
    - first: textfile
    ```

`MATCH` statements are used to match patterns in the topology of a template. You can "draw" the pattern by surrounding nodes with parentheses and connect them to other nodes via arrows.
The following statement will return all nodes that have a requirement fulfilled by `localhost`.

=== "Query"
    ```shell linenums="1"
    vintner query --query "\
        FROM templates.getting-started \
        MATCH ([name='localhost'])<--(node) \
        SELECT node"
    ```

=== "Result"
    ```yaml linenums="1"
    first:
      type: textfile
      properties:
        content: First Textfile has been selected!
      requirements:
        - host:
            node: localhost
    ```

This is just a simple example.
In a more complex scenario, it would be possible, e.g., to dynamically access the public address of a virtual machine which hosts a database to which a specific component connects.