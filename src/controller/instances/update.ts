import {Instance} from '#repository/instances'
import Plugins from '#plugins'

export type InstancesUpdateOptions = {instance: string; inputs?: string; time?: number; verbose?: boolean}

// TODO: lock but consider deadlock during adaptation
export default async function (options: InstancesUpdateOptions) {
    const instance = new Instance(options.instance)
    if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
    await Plugins.getOrchestrator().update(instance, {time: options.time, verbose: options.verbose})
}
