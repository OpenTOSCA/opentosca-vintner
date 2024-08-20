import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import {Instance, InstanceInfo} from '#repositories/instances'

export type InstancesInfoOptions = {instance: string; force?: boolean; lock?: boolean; machine?: boolean}

export default async function (options: InstancesInfoOptions) {
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
    let output: InstanceInfo | undefined
    async function action() {
        output = instance.loadInfo()
    }

    /**
     * Execution
     */
    await instance.machine.noop(ACTIONS.INFO, action, {lock: options.lock, machine: options.machine})

    /**
     * Output
     */
    assert.isDefined(output)
    return output
}
