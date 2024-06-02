import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import {Instance} from '#repositories/instances'
import {ServiceTemplate} from '#spec/service-template'

export type InstancesInspectOptions = {instance: string; force?: boolean; lock?: boolean; machine?: boolean}

export default async function (options: InstancesInspectOptions) {
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
    let output: ServiceTemplate | undefined
    async function action() {
        output = instance.loadServiceTemplate()
    }

    /**
     * Execution
     */
    await instance.machine.noop(ACTIONS.INSPECT, action, {lock: options.lock, machine: options.machine})

    /**
     * Output
     */
    assert.isDefined(output)
    return output
}
