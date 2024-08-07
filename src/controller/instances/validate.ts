import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'

export type InstancesValidateOptions = {
    instance: string
    verbose?: boolean
    inputs?: string
    dry?: boolean
    force?: boolean
    lock?: boolean
    machine?: boolean
}

export default async function (options: InstancesValidateOptions) {
    /**
     * Instance
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
        await orchestrators
            .get()
            .validate(instance, {verbose: options.verbose, inputs: options.inputs, dry: options.dry})
    }

    /**
     * Execution
     */
    await instance.machine.noop(ACTIONS.VALIDATE, action, {lock: options.lock, machine: options.machine})
}
