import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'

export type InstancesDebugOptions = {
    instance: string
    command: string
    force?: boolean
    lock?: boolean
    machine?: boolean
}

export default async function (options: InstancesDebugOptions) {
    /**
     * Validation
     */
    assert.isString(options.instance)
    assert.isString(options.command)

    /**
     * Defaults
     */
    options.force = options.force ?? false
    options.lock = options.force ? true : options.lock ?? true
    options.machine = options.force ? true : options.machine ?? true

    /**
     * Instance
     */
    const instance = new Instance(options.instance)

    /**
     * Action
     */
    async function action() {
        await orchestrators.get().debug(instance, {command: options.command})
    }

    /**
     * Execution
     */
    await instance.machine.noop(ACTIONS.DEBUG, action, {lock: options.lock, machine: options.machine})
}
