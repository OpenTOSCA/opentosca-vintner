import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'
import {emitter, events} from '#utils/emitter'

export type InstancesUndeployOptions = {
    instance: string
    verbose?: boolean
    force?: boolean
    lock?: boolean
    machine?: boolean
}

export default async function (options: InstancesUndeployOptions) {
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
        emitter.emit(events.stop_adaptation, instance)
        await orchestrators.get().undeploy(instance, {verbose: options.verbose})
    }

    /**
     * Execution
     */
    await instance.machine.try(ACTIONS.UNDEPLOY, action, {lock: options.lock, machine: options.machine})
}
