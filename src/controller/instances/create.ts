import {Instance} from '#repository/instances'

export type InstancesCreateArguments = {instance: string; template: string}

export default async function (options: InstancesCreateArguments) {
    const instance = new Instance(options.instance)
    if (instance.exists()) throw new Error(`Instance ${options.instance} already exists`)
    instance.create().setTemplate(options.template)
}
