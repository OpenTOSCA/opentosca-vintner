import containerApplicationAnsibleDocker from './container-application/ansible/docker'
import containerApplicationAnsibleGCPCloudRun from './container-application/ansible/gcp-cloudrun'
import containerApplicationAnsibleKubernetes from './container-application/ansible/kubernetes'
import containerApplicationDockerDocker from './container-application/docker/docker'
import containerApplicationKubernetesKubernetes from './container-application/kubernetes/kubernetes'
import containerApplicationTerraformDocker from './container-application/terraform/docker'
import containerApplicationTerraformGCPCloudRun from './container-application/terraform/gcp-cloudrun'
import containerApplicationTerraformKubernetes from './container-application/terraform/kubernetes'
import dockerEngineAnsibleOpenstackMachine from './docker-engine/ansible/openstack-machine'
import dockerEngineTerraformOpenstackMachine from './docker-engine/terraform/openstack-machine'
import gcpServiceAnsible from './gpc-service/ansible'
import gcpServiceTerraform from './gpc-service/terraform'
import ingressAnsibleKubernetes from './ingress/ansible/kubernetes'
import ingressAnsibleOpenstackMachine from './ingress/ansible/openstack-machine'
import ingressKubernetesKubernetes from './ingress/kubernetes/kubernetes'
import ingressTerraformKubernetes from './ingress/terraform/kubernetes'
import ingressTerraformOpenstackMachine from './ingress/terraform/openstack-machine'
import openstackMachineAnsible from './openstack-machine/ansible'
import openstackMachineTerraform from './openstack-machine/terraform'

import {ImplementationGenerator} from './types'

// TODO: dynamically load generators? are they still part of compiled then?

class Registry {
    readonly generators = new Map<string, ImplementationGenerator>()

    constructor(generators: ImplementationGenerator[]) {
        generators.forEach(it => {
            if (this.generators.has(it.id)) throw new Error(`Generator "${it.id}" already registered`)
            this.generators.set(it.id, it)
        })
    }

    get(id: string) {
        return this.generators.get(id)
    }
}

const GeneratorRegistry = new Registry([
    // Container Application
    containerApplicationAnsibleDocker,
    containerApplicationAnsibleGCPCloudRun,
    containerApplicationAnsibleKubernetes,
    containerApplicationDockerDocker,
    containerApplicationKubernetesKubernetes,
    containerApplicationTerraformDocker,
    containerApplicationTerraformGCPCloudRun,
    containerApplicationTerraformKubernetes,

    // Docker Engine
    dockerEngineAnsibleOpenstackMachine,
    dockerEngineTerraformOpenstackMachine,

    // GCP Service
    gcpServiceAnsible,
    gcpServiceTerraform,

    // Ingress
    ingressAnsibleKubernetes,
    ingressAnsibleOpenstackMachine,
    ingressKubernetesKubernetes,
    ingressTerraformKubernetes,
    ingressTerraformOpenstackMachine,

    // Openstack Machine
    openstackMachineAnsible,
    openstackMachineTerraform,
])

export default GeneratorRegistry
