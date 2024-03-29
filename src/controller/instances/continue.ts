import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'
import lock from '#utils/lock'

export type InstancesContinueOptions = {instance: string; verbose?: boolean}

export default async function (options: InstancesContinueOptions) {
    const instance = new Instance(options.instance)

    await lock.try(instance.getLockKey(), async () => {
        if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
        await orchestrators.get().continue(instance, {verbose: options.verbose})
    })
}
