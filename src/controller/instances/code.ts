import {Instance} from '#repository/instances'
import open from '#utils/open'

export type InstancesOpenOptions = {instance: string}

export default async function (options: InstancesOpenOptions) {
    const instance = new Instance(options.instance)
    if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
    await open.code(instance.getInstanceDirectory())
}
