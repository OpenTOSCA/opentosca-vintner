import {Instance} from '#repositories/instances'
import lock from '#utils/lock'

export type InstancesDeleteOptions = {instance: string}

export default async function (options: InstancesDeleteOptions) {
    const instance = new Instance(options.instance)
    await lock.try(instance.getLockKey(), () => {
        instance.delete()
    })
}
