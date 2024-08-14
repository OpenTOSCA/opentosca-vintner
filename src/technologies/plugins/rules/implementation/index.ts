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
import openstackMachineAnsible from './openstack-machine/ansible'
import openstackMachineTerraform from './openstack-machine/terraform'

import {ImplementationGenerator} from './types'

class Registry {
    readonly plugins = new Map<string, ImplementationGenerator>()

    constructor(plugins: ImplementationGenerator[]) {
        plugins.forEach(it => this.plugins.set(it.id, it))
    }

    get(id: string) {
        return this.plugins.get(id)
    }
}

const registry = new Registry([
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

    // Openstack Machine
    openstackMachineAnsible,
    openstackMachineTerraform,
])

export default registry
