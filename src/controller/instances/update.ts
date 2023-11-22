import Plugins from '#plugins'
import {Instance} from '#repositories/instances'
import * as utils from '#utils'

export type InstancesUpdateOptions = {instance: string; inputs?: string; time?: number; verbose?: boolean}

// TODO: lock but consider deadlock during adaptation
export default async function (options: InstancesUpdateOptions) {
    const instance = new Instance(options.instance)
    if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
    instance.setServiceInputs(options.time ?? utils.now(), options.inputs)
    await Plugins.getOrchestrator().update(instance, {time: options.time, verbose: options.verbose})
}
