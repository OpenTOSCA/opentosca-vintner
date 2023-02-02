import {Instance} from '#repository/instances'
import Plugins from '#plugins'

export type InstancesDeployOptions = {instance: string; inputs?: string}

export default async function (options: InstancesDeployOptions) {
    const instance = new Instance(options.instance)
    if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
    if (options.inputs) instance.setServiceInputs(options.inputs)
    await Plugins.getOrchestrator().deploy(instance)
}
