import {Instance} from '#repository/instances'
import Plugins from '#plugins'
import lock from '#utils/lock'
import * as utils from '#utils'

export type InstancesDeployOptions = {instance: string; inputs?: string; verbose?: boolean}

export default async function (options: InstancesDeployOptions) {
    const instance = new Instance(options.instance)

    await lock.try(instance.getLockKey(), async () => {
        if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
        if (options.inputs) instance.setServiceInputs(options.inputs, utils.now())
        await Plugins.getOrchestrator().redeploy(instance, {verbose: options.verbose})
    })
}
