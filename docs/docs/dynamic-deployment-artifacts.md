--- 
title: Dynamic Deployment Artifacts
---

# Dynamic Deployment Artifacts 1.0 Release Candidate

This document specifies Dynamic Deployment Artifacts which are supposed to be build on-demand based on information in the topology.
The intention is to build variants of Deployment Artifacts which are specific for the application.
The specification is under active development.

To build Dynamic Deployment Artifacts a `build` management operation is defined for the `tosca.interfaces.node.lifecycle.Variability` interface.
This management operation can be used in several stages.
Artifacts can be build during modeling when packaging the application as CSAR, right before the deployment process or during deployment.
The implementation of the `build` management operation can start, e.g., a build pipeline and set a reference such as a Docker Tag as attribute of the respective Node Template.
This reference can then be used by the `create` management operation of `tosca.interfaces.node.lifecycle.Standard`.

```hl_lines="2 3" linenums="1"
tosca.interfaces.node.lifecycle.Variability
+    build:
+        description: Builds a Deployment Artifact
```

A rough idea has been also mentioned in
[TOSCA Simple Profile in YAML Version 1.3](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#_Toc26969505){target=_blank}.