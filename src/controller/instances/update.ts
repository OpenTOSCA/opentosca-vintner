import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'
import * as utils from '#utils'
import lock from '#utils/lock'

export type InstancesUpdateOptions = {
    instance: string
    inputs?: string
    time?: number
    verbose?: boolean
    lock?: boolean
}

export default async function (options: InstancesUpdateOptions) {
    options.lock = options.lock ?? true

    const instance = new Instance(options.instance)
    await lock.try(
        instance.getLockKey(),
        async () => {
            if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
            instance.setServiceInputs(options.time ?? utils.now(), options.inputs)
            await orchestrators.get().update(instance, {time: options.time, verbose: options.verbose})
        },
        options.lock
    )
}
