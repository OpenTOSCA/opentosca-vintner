import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'

export type InstancesContinueOptions = {
    instance: string
    verbose?: boolean
    force?: boolean
    lock?: boolean
    machine?: boolean
}

export default async function (options: InstancesContinueOptions) {
    /**
     * Validation
     */
    assert.isString(options.instance)

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
        await orchestrators.get().continue(instance, {verbose: options.verbose})
    }

    /**
     * Execution
     */
    await instance.machine.try(ACTIONS.CONTINUE, action, {lock: options.lock, machine: options.machine})
}
