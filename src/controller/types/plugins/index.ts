import * as assert from '#assert'
import {TypePlugin} from '#controller/types/types'
import softwareApplicationAnsibleDocker from './software-application/ansible/docker'
import softwareApplicationAnsibleGCPCloudRun from './software-application/ansible/gcp-cloudrun'
import softwareApplicationDockerDocker from './software-application/docker/docker'
import softwareApplicationTerraformDocker from './software-application/terraform/docker'
import softwareApplicationTerraformGCPCloudRun from './software-application/terraform/gcp-cloudrun'

class Registry {
    readonly plugins = new Map<string, TypePlugin>()

    constructor(plugins: TypePlugin[]) {
        plugins.forEach(it => this.plugins.set(it.id, it))
    }

    get(id: string): TypePlugin {
        const plugin = this.plugins.get(id)
        assert.isDefined(plugin, `Cannot find a registry for ${id}`)
        return plugin
    }
}

const registry = new Registry([
    softwareApplicationAnsibleDocker,
    softwareApplicationAnsibleGCPCloudRun,
    softwareApplicationDockerDocker,
    softwareApplicationTerraformDocker,
    softwareApplicationTerraformGCPCloudRun,
])

export default registry
