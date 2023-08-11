import Plugins from '#plugins'
import {Instance} from '#repository/instances'
import lock from '#utils/lock'

export type InstancesContinueOptions = {instance: string; verbose?: boolean}

export default async function (options: InstancesContinueOptions) {
    const instance = new Instance(options.instance)

    await lock.try(instance.getLockKey(), async () => {
        if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
        await Plugins.getOrchestrator().continue(instance, {verbose: options.verbose})
    })
}
