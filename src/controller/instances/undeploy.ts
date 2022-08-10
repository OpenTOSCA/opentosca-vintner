import {Instance} from '../../repository/instances'
import {Orchestrators} from '../../repository/orchestrators'

export type InstancesUndeployArguments = {instance: string}

export default async function (options: InstancesUndeployArguments) {
    await Orchestrators.getOrchestrator().undeploy(new Instance(options.instance))
}
