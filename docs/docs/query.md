# Query Language

The TOSCA query language can be used via the command line. Queries start with a `FROM` command where you specify the template or instance
that you want to query. By default, the parameter refers to a directory name from your `vintner` template or instance directory repository.

Example:
```
vintner query --query 'FROM getting-started SELECT *'
```

## Path Syntax (TPath)

The TPath syntax can be used to browse the underlying YAML file of a service template. It is similar to XPath's syntax,
with paths separated by a dot and filters in square brackets.

| Symbol | Meaning | Description |
| --- | --- | --- |
| name |  Literal  | Used to access an element at the current position by its name |
| . |  Path separator  | Used to map the left hand side to an array |
| * |  Wildcard  | Matches any child element |
| [...] |  Filter  | Evaluates the predicate inside the brackets for every current element |
| GROUP(name) |  Group members  | Returns the set of nodes that belong to the group with the specified name |
| POLICY(name) |  Policy targets  | Returns the set of nodes that are targeted by the policy with the specified name |

Examples:
```
vintner query --query 'FROM getting-started SELECT topology_template.node_templates.my_app
vintner query --query 'FROM getting-started SELECT topology_template.node_templates.*
```

## Filters

At any step of a path expression, a predicate can be used to filter results. The left side of a condition needs to be
a path expression relative to the path preceding the filter, followed by a comparison operator and a value.
Supported operators are `=`, `!=`, `>` `>=`, `<`, `<=`

It is also possible to check for the existence of child elements by specifying a path. Such expression will return true if
the element exists, otherwise they return false.

Examples:
```
vintner query --query 'FROM getting-started SELECT topology_template.node_templates.*[type="Compute"]
vintner query --query 'FROM getting-started SELECT topology_template.node_templates.*[requirements]
```

## Boolean operators

The boolean operators `AND` and `OR` can be used to chain multiple filters.

Example:
```
vintner query --query 'FROM getting-started SELECT topology_template.node_templates.*[type="Compute" AND requirements.host]
```

## Comments

Single-line comments start with `//`, multi-line comments start with `/*` and end with `*/`
