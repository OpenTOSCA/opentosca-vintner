# Query Language

The TOSCA query language can be used via the command line with the following options:

| Option | Mandatory | Type | Description |
| --- | --- | --- | --- |
| query |  true  | string | query string (see language description below) |
| source |  false  | string | where to search for the template specified in the query. Valid options are "file", "vintner", "winery" (default: "vintner") |
| output |  false  | string | output file for query result. No file will be written if omitted |

## Introduction

This section will give a quick introduction to TQuery. To run the example queries, import the included 
"opera-getting-started" template if you haven't already.
```shell linenums="1"
vintner templates import --template getting-started --path opera-getting-started
```

Queries start with a `FROM` command, followed by either "template" or "instance" and the template or instance name in parentheses. 
By default, the parameter refers to a directory name from your `vintner` template or instance repository. 
If you specify `--source winery`, your winery repository path will automatically be determined, 
and you can enter the path of a service template from your repository.

Example (Vintner):
```shell linenums="1"
vintner query --query 'FROM template(getting-started) SELECT *' --source vintner --output output.yaml'
```
Example (Winery):
```shell linenums="1"
vintner query --query 'FROM template(radon.blueprints/SockShop) SELECT *' --source winery --output output.yaml'
```

Next, you can use a select clause to narrow down the data that you want to return. The simplest way is to specify
a part of the service template document.
```shell linenums="1"
vintner query --query 'FROM template(getting-started) SELECT topology_template.node_templates.first' --source vintner --output output.yaml'
```

You can use an asterisk as a wildcard operator to get all child elements
```shell linenums="1"
vintner query --query 'FROM template(getting-started) SELECT topology_template.node_templates.*' --source vintner --output output.yaml'
```
You can also write a predicate in square brackets after any part of the path expression to filter elements.
```shell linenums="1"
vintner query --query 'FROM template(getting-started) SELECT topology_template.node_templates.*[type="textfile"]' --source vintner --output output.yaml'
```

## Path Syntax (TPath)

The TPath syntax can be used to browse the underlying YAML file of a service template. It is similar to XPath's syntax,
with paths separated by a dot and filters in square brackets.

| Symbol | Meaning | Description |
| --- | --- | --- |
| name |  Literal  | Used to access an element at the current position by its name |
| . |  Path separator  | Used to map the left hand side to an array |
| * |  Wildcard  | Matches any child element |
| [] |  Filter  | Evaluates the predicate inside the brackets for every current element |
| GROUP(name) |  Group members  | Returns the set of nodes that belong to the group with the specified name |
| POLICY(name) |  Policy targets  | Returns the set of nodes that are targeted by the policy with the specified name |

Examples:
```shell linenums="1"
vintner query --query 'FROM template(getting-started) SELECT topology_template.node_templates.first'
vintner query --query 'FROM template(getting-started) SELECT topology_template.node_templates.*.name'
```

## Filters

At any step of a path expression, a predicate can be used to filter results. The left side of a condition needs to be
a path expression relative to the path preceding the filter, followed by a comparison operator and a value.
Supported operators are `=`, `!=`, `>` `>=`, `<`, `<=`

It is also possible to check for the existence of child elements by specifying a path. Such expression will return true if
the element exists, otherwise they return false.

Examples:
```shell linenums="1"
vintner query --query 'FROM template(getting-started) SELECT topology_template.node_templates.*[type="Compute"]'
vintner query --query 'FROM template(getting-started) SELECT topology_template.node_templates.*[requirements]'
```

## Boolean operators

The boolean operators `AND` and `OR` can be used to chain multiple filters.

Example:
```shell linenums="1"
vintner query --query 'FROM template(getting-started) SELECT topology_template.node_templates.*[type="Compute" AND requirements.host]'
```

## MATCH clauses
To find patterns in node templates, the TQuery language includes a match syntax that is based on graph query languages.
Nodes are represented by parentheses, with an optional variable name and filter
```shell linenums="1"
()                      // anonymous node
(myapp)                 // node with variable "myapp"
(myapp[type='WebApp'])  // node with variable and filter
```

Relationships between nodes are represented by arrows (directed) or dashes (undirected)  
```shell linenums="1"
(myapp)-->(host)        // node with variable "myapp" has requirement fulfilled by "host"
(first)--(second)       // nodes with variables "first" and "second" have any kind of relationship
```

Similar to nodes, we can limit the kind of relationships by introducing filters, and we can give them variables.
Both of these are inserted in the middle of an arrow and surrounded by curly brackets.  
```shell linenums="1"
(myapp)-{r[type='hostedOn']}->(host)  // node with variable "myapp" has requirement "hostedOn" fulfilled by "host"
```

The output of a `MATCH` clause is an object with entries for all specified variable names. Each entry contains a subset 
of node templates that match the described pattern. Use a `SELECT` clause to access them.

Example:
```shell linenums="1"
vintner query --query 'FROM template(getting-started) MATCH (first)-{r[type='host']}->(host) SELECT host.*.name
```
Note that each variable potentially matches multiple node templates, which is why we need to use the wildcard operator 
in the `SELECT` clause to get their individual names.

## Comments

Single-line comments start with `//`, multi-line comments start with `/*` and end with `*/`
