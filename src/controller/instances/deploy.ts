import {Instance} from '#repository/instances'
import Plugins from '#plugins'

export type InstancesDeployArguments = {instance: string; inputs?: string}

export default async function (options: InstancesDeployArguments) {
    const instance = new Instance(options.instance)
    if (options.inputs) instance.setServiceInputs(options.inputs)
    await Plugins.getOrchestrator().deploy(instance)
}
