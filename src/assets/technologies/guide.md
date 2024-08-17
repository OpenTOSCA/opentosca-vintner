# TOSCA Light Modeling Rules

## Software Applications

1. A `software.application` node template always requires a `source.archive`, `apt.package`, or `docker.image` deployment artifact.
1. A `software.application` node template with an `source.archive` artifact definition always requires the `management.start` operation. 
1. A `software.application` node template can optionally have the `management.configure` operation.
1. A `software.application` node template can have conditional artifact definitions. A node type cannot have conditional artifact definitions. 

1. A `software.application` node template with a `source.archive` deployment artifact implicitly requires an `openstack.machine` or `gcp.appengine` node template as host.
1. A `software.application` node template with a `apt.package` deployment artifact implicitly requires an `openstack.machine` node template as host.
1. A `software.application` node template with a `docker.image` deployment artifact implicitly requires a `docker.engine`, `gcp.cloudrun`, or `kuberntes` node template as host.

1. A _built-in_ `software.application` node template defines its management operations in its node type, e.g., `node.application`.
1. A _custom_ `software.application` node template defines its management operations in its node template, e.g., `shop.component` derived from `node.application`.
1. A `sofware.application` node template or node type can only define inline `bash` scripts as management operations (they are executed in the context of the deployment artifact).


## Service Applications

1. A `service.application` node template on a `openstack.machine` host is started as `systemd service`.


## Technology Rules

1. Collisions of technology rules of the same technology for the same variant are not permitted. There must not be a _more specific_ rule. For example, there must not be a generic rule for `software.application` node templates in combination with a rule for `software.application` node templates that also has a restriction on `source.archive`.

