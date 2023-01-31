import {Instance} from '#repository/instances'
import Plugins from '#plugins'

export type InstancesUpdateArguments = {instance: string; inputs?: string; time?: string}

export default async function (options: InstancesUpdateArguments) {
    const instance = new Instance(options.instance)
    if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
    if (options.inputs) instance.setServiceInputs(options.inputs)
    await Plugins.getOrchestrator().update(instance, options.time)
}
