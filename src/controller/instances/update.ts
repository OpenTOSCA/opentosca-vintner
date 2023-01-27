import {Instance} from '#repository/instances'
import Plugins from '#plugins'

export type InstancesUpdateArguments = {instance: string; inputs?: string}

export default async function (options: InstancesUpdateArguments) {
    const instance = new Instance(options.instance)
    if (options.inputs) instance.setServiceInputs(options.inputs)
    await Plugins.getOrchestrator().update(instance)
}
