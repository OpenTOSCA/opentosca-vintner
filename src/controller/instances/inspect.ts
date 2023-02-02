import {Instance} from '#repository/instances'

export type InstancesInspectOptions = {instance: string}

export default async function (options: InstancesInspectOptions) {
    const instance = new Instance(options.instance)
    if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
    return instance.loadServiceTemplate()
}
