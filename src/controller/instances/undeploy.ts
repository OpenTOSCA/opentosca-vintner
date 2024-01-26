import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'
import {emitter, events} from '#utils/emitter'
import lock from '#utils/lock'

export type InstancesUndeployOptions = {instance: string; verbose?: boolean}

export default async function (options: InstancesUndeployOptions) {
    const instance = new Instance(options.instance)

    await lock.try(instance.getLockKey(), async () => {
        if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
        emitter.emit(events.stop_adaptation, instance)
        await lock.try(instance.getName(), () => orchestrators.get().undeploy(instance, {verbose: options.verbose}))
    })
}
