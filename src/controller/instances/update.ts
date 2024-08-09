import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'
import * as utils from '#utils'

export type InstancesUpdateOptions = {
    instance: string
    inputs?: string
    time?: number
    verbose?: boolean
    force?: boolean
    lock?: boolean
    machine?: boolean
}

export default async function (options: InstancesUpdateOptions) {
    /**
     * Validation
     */
    assert.isString(options.instance)

    /**
     * Defaults
     */
    options.force = options.force ?? false
    options.lock = options.force ? false : options.lock ?? true
    options.machine = options.force ? false : options.machine ?? true

    /**
     * Instance
     */
    const instance = new Instance(options.instance)

    /**
     * Action
     */
    async function action() {
        instance.setServiceInputs(options.time ?? utils.now(), options.inputs)
        await orchestrators.get().update(instance, {time: options.time, verbose: options.verbose})
    }

    /**
     * Execution
     */
    await instance.machine.try(ACTIONS.UPDATE, action, {lock: options.lock, machine: options.machine})
}
