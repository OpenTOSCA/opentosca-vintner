import {Instance} from '#repository/instances'
import Plugins from '#plugins'
import {emitter, events} from '#utils/emitter'
import {critical} from '#utils/lock'

export type InstancesUndeployOptions = {instance: string; verbose?: boolean}

export default async function (options: InstancesUndeployOptions) {
    const instance = new Instance(options.instance)

    await critical(instance.getLockKey(), async () => {
        if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
        emitter.emit(events.stop_adaptation, instance)
        await critical(instance.getName(), () =>
            Plugins.getOrchestrator().undeploy(instance, {verbose: options.verbose})
        )
    })
}
