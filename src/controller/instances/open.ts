import open from 'open'
import {Instance} from '#repository/instances'

export type InstancesOpenArguments = {instance: string}

export default async function (options: InstancesOpenArguments) {
    const instance = new Instance(options.instance)
    if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
    await open(instance.getInstanceDirectory())
}
