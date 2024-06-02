import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import {Instance} from '#repositories/instances'

export type InstancesDeleteOptions = {instance: string; force?: boolean; lock?: boolean; machine?: boolean}

export default async function (options: InstancesDeleteOptions) {
    /**
     * Validation
     */
    assert.isString(options.instance)

    /**
     * Defaults
     */
    options.force = options.force ?? false
    options.lock = options.lock ?? !options.force
    options.machine = options.machine ?? !options.force

    /**
     * Instance
     */
    const instance = new Instance(options.instance)

    /**
     * Action
     */
    async function action() {
        instance.delete()
    }

    /**
     * Execution
     */
    await instance.machine.try(ACTIONS.DELETE, action, {lock: options.lock, machine: options.machine})
}
