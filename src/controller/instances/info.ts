import {Instance} from '#repository/instances'

export type InstancesInfoOptions = {instance: string}

export default async function (options: InstancesInfoOptions) {
    const instance = new Instance(options.instance)
    if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
    return instance.loadInfo()
}
