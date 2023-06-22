# Zonal Architecture

In this document, we discuss an example of a zonal architecture connected to the cloud using the TOSCA SofDCar profile.
There are two zones each containing a zone control unit, an actuator, and a sensor.
Communication inside a zone is based on CAN whereas communication between zones is based on Ethernet.
A vehicle control unit connects both zones and also connects to some service running in the cloud.

<figure markdown>
  ![Distributed Locations](service-template.topology.svg){width="700"}
  <figcaption>Figure 1: Zonal Architecture</figcaption>
</figure>

## Appendix A "Service Template"

This appendix contains the complete service template of this guide.
You can also download the service template [here](service-template.yaml){download=service-template.yaml}.

```yaml linenums="1"
--8<-- "sofdcar/guides/zone/service-template.yaml"
```

## Appendix B "Type Definitions"

This appendix contains the complete type definitions of this guide.
You can also download the type definitions [here](types.yaml){download=types.yaml}

```yaml linenums="1"
--8<-- "sofdcar/guides/zone/types.yaml"
```
