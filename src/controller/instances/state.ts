import * as assert from '#assert'
import {ACTIONS, STATES} from '#machines/instance'
import {Instance} from '#repositories/instances'

export type InstanceStateOptions = {
    instance: string
    state: string
    force?: boolean
    lock?: boolean
    machine?: boolean
}

export default async function (options: InstanceStateOptions) {
    /**
     * Validation
     */
    assert.isString(options.instance)

    /**
     * Defaults
     */
    options.force = options.force ?? false
    options.lock = options.lock ?? !options.force

    /**
     * Instance
     */
    const instance = new Instance(options.instance)

    /**
     * Action
     */
    async function action() {
        instance.setState(options.state as `${STATES}`)
    }

    /**
     * Execution
     */
    await instance.machine.noop(ACTIONS.STATE, action, {lock: options.lock, machine: options.machine})
}
