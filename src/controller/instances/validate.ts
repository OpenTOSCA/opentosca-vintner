import Plugins from '#plugins'
import {Instance} from '#repository/instances'
import lock from '#utils/lock'

export type InstancesValidateOptions = {instance: string; verbose?: boolean}

export default async function (options: InstancesValidateOptions) {
    const instance = new Instance(options.instance)

    await lock.try(instance.getLockKey(), async () => {
        if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
        await Plugins.getOrchestrator().validate(instance, {verbose: options.verbose})
    })
}
