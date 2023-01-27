import open from 'open'
import {Instance} from '#repository/instances'

export type InstancesOpenArguments = {instance: string}

export default async function (options: InstancesOpenArguments) {
    await open(new Instance(options.instance).getInstanceDirectory())
}
