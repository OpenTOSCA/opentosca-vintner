import {Instance} from '#repository/instances'
import Plugins from '#plugins'
import * as validator from '#validator'
import * as utils from '#utils'

export type InstancesUpdateOptions = {instance: string; inputs?: string; time?: number; verbose?: boolean}

// TODO: lock but consider deadlock during adaptation
export default async function (options: InstancesUpdateOptions) {
    const instance = new Instance(options.instance)
    if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
    if (validator.isDefined(options.inputs)) instance.setServiceInputs(options.inputs, options.time ?? utils.now())
    await Plugins.getOrchestrator().update(instance, {time: options.time, verbose: options.verbose})
}
