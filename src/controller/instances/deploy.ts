import {Instance} from '#repository/instances'
import {Orchestrators} from '#repository/orchestrators'

export type InstancesDeployArguments = {instance: string; inputs?: string}

export default async function (options: InstancesDeployArguments) {
    const instance = new Instance(options.instance)
    if (options.inputs) instance.setServiceInputs(options.inputs)
    await Orchestrators.getOrchestrator().deploy(instance)
}
