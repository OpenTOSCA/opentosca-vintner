import {Instance} from '#repository/instances'
import Plugins from '#plugins'

export type InstancesUndeployArguments = {instance: string}

export default async function (options: InstancesUndeployArguments) {
    await Plugins.getOrchestrator().undeploy(new Instance(options.instance))
}
