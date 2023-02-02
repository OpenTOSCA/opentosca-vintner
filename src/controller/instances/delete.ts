import {Instance} from '#repository/instances'

export type InstancesDeleteOptions = {instance: string}

export default async function (options: InstancesDeleteOptions) {
    new Instance(options.instance).delete()
}
