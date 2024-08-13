import softwareApplicationAnsibleDocker from './software-application/ansible/docker'
import softwareApplicationAnsibleGCPCloudRun from './software-application/ansible/gcp-cloudrun'
import softwareApplicationAnsibleKubernetes from './software-application/ansible/kubernetes'
import softwareApplicationDockerDocker from './software-application/docker/docker'
import softwareApplicationKubernetesKubernetes from './software-application/kubernetes/kubernetes'
import softwareApplicationTerraformDocker from './software-application/terraform/docker'
import softwareApplicationTerraformGCPCloudRun from './software-application/terraform/gcp-cloudrun'
import softwareApplicationTerraformKubernetes from './software-application/terraform/kubernetes'
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
    softwareApplicationAnsibleDocker,
    softwareApplicationAnsibleGCPCloudRun,
    softwareApplicationAnsibleKubernetes,
    softwareApplicationDockerDocker,
    softwareApplicationKubernetesKubernetes,
    softwareApplicationTerraformDocker,
    softwareApplicationTerraformGCPCloudRun,
    softwareApplicationTerraformKubernetes,
])

export default registry
