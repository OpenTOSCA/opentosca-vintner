# TOSCA Light Modeling Rules

## Software Applications

1. A `software.application` node template always requires a `source.archive`, `software.package`, or `container.image` deployment artifact.
1. A `software.application` node template with an `source.archive` artifact definition always requires the `management.start` operation and the `management.stop` operation. 
1. A `software.application` node template can have conditional artifact definitions. A node type cannot have conditional artifact definitions. 

1. A `software.application` node template with a `source.archive` deployment artifact implicitly requires an `virtual.machine` or `gcp.appengine` node template as host.
1. A `software.application` node template with a `software.package` deployment artifact implicitly requires an `virtual.machine` node template as host.
1. A `software.application` node template with a `container.image` deployment artifact implicitly requires a `docker.engine`, `gcp.cloudrun`, or `kubernetes` node template as host.

1. A _built-in_ `software.application` node template defines its management operations in its node type, e.g., `node.application`.
1. A _custom_ `software.application` node template defines its management operations in its node template, e.g., `shop.component` derived from `node.application`.


## Service Applications

1. A `service.application` node template on a `virtual.machine` host is started as `systemd service`.
1. A `service.appcliation` always requires a  `source.archive` deployment artifact. 
1. A `service.application` does not require a `management.stop` operation.


## Management Operation 

1. A management operation is an inline `bash` script, which is executed in the root of the application directory.

## Application Directory

1. A `software.application` node template hosted on a `virtual.machine` node template has its own dedicated application directory.
1. `.vintner` is a reserved directory in the application directory.

## Deployment Artifact

1. A `source.archive` deployment artifact is extracted into the application directory.


## Technology Rules

1. Technology rules might collide. The effective rule is selected base don the quality (and count).
