import {Instance} from '#repository/instances'
import Plugins from '#plugins'

export type InstancesUndeployArguments = {instance: string}

export default async function (options: InstancesUndeployArguments) {
    const instance = new Instance(options.instance)
    if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
    await Plugins.getOrchestrator().undeploy(instance)
}
