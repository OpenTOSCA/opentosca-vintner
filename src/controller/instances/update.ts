import {Instance} from '../../repository/instances'
import {Orchestrators} from '../../repository/orchestrators'

export type InstancesUpdateArguments = {instance: string; inputs?: string}

export default async function (options: InstancesUpdateArguments) {
    const instance = new Instance(options.instance)
    if (options.inputs) instance.setServiceInputs(options.inputs)
    await Orchestrators.getOrchestrator().update(instance)
}
