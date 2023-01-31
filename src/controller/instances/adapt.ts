import {Instance} from '#repository/instances'
import update from '#controller/instances/update'
import resolve from '#controller/instances/resolve'
import * as utils from '#utils'

type AdaptationArguments = {instance: string; key: string; value: string}

export default async function (options: AdaptationArguments) {
    const instance = new Instance(options.instance)
    if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)

    // Run in background
    const _ignored = _adapt(instance, options)
}

// TODO: during adaptation its unclear which template is actually deployed
// TODO: make this fully async including locking?!
async function _adapt(instance: Instance, options: AdaptationArguments) {
    // Current time used as run id
    // TODO: is it required that the adaptation is bound to a run id?
    const time = utils.getTime()

    /**
     * Monitor: Collect sensor data
     */
    // TODO: lock? https://www.npmjs.com/package/async-lock
    const inputs = instance.loadVariabilityInputs()
    inputs[options.key] = options.value
    instance.setVariabilityInputs(inputs, time)

    /**
     * Analyze: nil
     */

    /**
     * Plan: Resolve variability
     */
    // TODO: also handle variability preset
    await resolve({instance: instance.getName(), inputs: instance.getVariabilityInputs(), time})

    /**
     * Execute: Update deployment
     */
    await update({
        instance: instance.getName(),
        inputs: instance.hasServiceInputs() ? instance.getServiceInputs() : undefined,
        time,
    })
}
