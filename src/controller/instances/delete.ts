import {Instance} from '#repository/instances'
import {critical} from '#utils/lock'

export type InstancesDeleteOptions = {instance: string}

export default async function (options: InstancesDeleteOptions) {
    const instance = new Instance(options.instance)
    await critical(instance.getLockKey(), () => {
        instance.delete()
    })
}
