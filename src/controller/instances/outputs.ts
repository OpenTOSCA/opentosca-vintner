import Plugins from '#plugins'
import {Instance} from '#repositories/instances'
import lock from '#utils/lock'

export type InstancesOutputsOptions = {instance: string; inputs?: string; verbose?: boolean}

export default async function (options: InstancesOutputsOptions) {
    const instance = new Instance(options.instance)

    await lock.try(instance.getLockKey(), async () => {
        if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
        await Plugins.getOrchestrator().outputs(instance, {verbose: options.verbose})
    })
}
