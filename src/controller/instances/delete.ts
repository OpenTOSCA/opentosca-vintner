import {Instance} from '#repositories/instances'
import lock from '#utils/lock'

export type InstancesDeleteOptions = {instance: string; lock?: boolean}

export default async function (options: InstancesDeleteOptions) {
    options.lock = options.lock ?? true

    const instance = new Instance(options.instance)
    await lock.try(
        instance.getLockKey(),
        () => {
            instance.delete()
        },
        options.lock
    )
}
