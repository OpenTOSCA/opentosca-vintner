import {Instance} from '#repository/instances'
import Plugins from '#plugins'
import {critical} from '#utils/lock'

export type InstancesDeployOptions = {instance: string; inputs?: string; verbose?: boolean}

export default async function (options: InstancesDeployOptions) {
    const instance = new Instance(options.instance)

    await critical(instance.getLockKey(), async () => {
        if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
        if (options.inputs) instance.setServiceInputs(options.inputs)
        await Plugins.getOrchestrator().redeploy(instance, {verbose: options.verbose})
    })
}
