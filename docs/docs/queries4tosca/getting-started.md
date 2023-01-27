# Getting Started

This section will give a quick introduction to Queries4TOSCA. To run the example queries, you need to have a resolved instance of the
"getting started" template. If you don't have one, follow the steps in [Getting Started](../getting-started.md){target=_blank}.


Queries start with a `FROM` statement, followed by either `templates` or `instances` and the template or instance name, or an asterisk to query all.
Inside a `SELECT` statement, you can enter a path to the data that you want to return.

To get the entire contents of the template, run the following command.
```shell linenums="1"
vintner query --query "\
    FROM templates.getting-started \
    SELECT ."
```

You can return specific elements by specifying their path. Note that "topology_template" can be omitted at the start.
The following command returns the contents of the `localhost` node.

```shell linenums="1"
vintner query --query "\
    FROM templates.getting-started \
    SELECT node_templates.localhost"
```

You can use an asterisk as a wildcard operator to get all child elements. The following command returns a list of all nodes.

```shell linenums="1"
vintner query --query "\
    FROM templates.getting-started \
    SELECT node_templates.*"
```

You can also specify a predicate in square brackets after any part of the path expression to filter elements.
The following command will return only nodes of type `textfile`, which may be `first` or `second`, depending on how you resolved the template.

```shell linenums="1"
vintner query --query "\
    FROM templates.getting-started \
    SELECT node_templates.*[type='textfile']"
```

In cases where you are only interested in some elements of a node, you can use a return structure to restrict the output
to certain variables. To do this, put curly braces with key-value pairs behind your path expression. 
The following command will return only the `content` property of the `first` node.
```shell linenums="1" 
vintner query --query "\
    FROM templates.getting-started \
    SELECT node_templates.first{'Type': type, 'Text': properties.content}"
```

This also works on arrays. The following command returns an array that consists of the name and type of each node. 
Note the lack of quotation marks - we are using a value from the template for both key and value of the return object.

```shell linenums="1"
vintner query --query "\
    FROM templates.getting-started \
    SELECT node_templates.*{name: type}"
```

`MATCH` statements are used to match patterns in the topology of a template. You can "draw" the pattern by surrounding nodes 
with parentheses and connect them to other nodes via arrows. The following statement will return all nodes that have a requirement fulfilled by `localhost`.

```shell linenums="1"
vintner query --query "\
    FROM templates.getting-started \
    MATCH ([name='localhost'])<--(node) \
    SELECT node"
```
