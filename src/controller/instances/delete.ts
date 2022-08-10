import {Instance} from '../../repository/instances'

export type InstancesDeleteArguments = {instance: string}

export default async function (options: InstancesDeleteArguments) {
    new Instance(options.instance).delete()
}
