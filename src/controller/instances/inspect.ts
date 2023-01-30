import {Instance} from '#repository/instances'

export type InspectArguments = {instance: string}

export default async function (options: InspectArguments) {
    const instance = new Instance(options.instance)
    if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
    return instance.getServiceTemplate()
}
