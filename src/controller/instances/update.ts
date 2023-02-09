import {Instance} from '#repository/instances'
import Plugins from '#plugins'

export type InstancesUpdateOptions = {instance: string; inputs?: string; time?: string}

export default async function (options: InstancesUpdateOptions) {
    const instance = new Instance(options.instance)
    if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
    //TODO: this must be versioned
    // if (options.inputs) instance.setServiceInputs(options.inputs)
    await Plugins.getOrchestrator().update(instance, options.time)
}
