# Zonal Architecture

In this document, we discuss an example of a zonal architecture using the TOSCA SofDCar profile.
This zonal architecture consists of several zones inside the vehicle in which also cloud services are integrated.

## Scenario

In this example, there are two zones which both contain a zone control unit, an actuator, and a sensor, as shown in Figure 1.
Communication inside those zones is based on CAN.
Furthermore, there is a third zone which contains a vehicle control unit. 
This vehicle control unit connects the other two zones based on Ethernet.
Moreover, this vehicle control unit also connects to some service running in the cloud.

<figure markdown>
  ![Distributed Locations](service-template.topology.svg){width="700"}
  <figcaption>Figure 1: Zonal Architecture</figcaption>
</figure>

## Appendix A "Service Template"

This appendix contains the service template of this guide.
You can also download the service template [here](service-template.yaml){download=service-template.yaml}.

```yaml linenums="1"
--8<-- "sofdcar/guides/zone/service-template.yaml"
```

## Appendix B "Type Definitions"

This appendix contains the type definitions of this guide.
You can also download the type definitions [here](types.yaml){download=types.yaml}

```yaml linenums="1"
--8<-- "sofdcar/guides/zone/types.yaml"
```
