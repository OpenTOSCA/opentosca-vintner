import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'

export type InstancesOutputsOptions = {
    instance: string
    inputs?: string
    verbose?: boolean
    force?: boolean
    lock?: boolean
    machine?: boolean
}

export default async function (options: InstancesOutputsOptions) {
    assert.isString(options.instance)

    options.force = options.force ?? false
    options.lock = options.force ? true : options.lock ?? true
    options.machine = options.force ? true : options.machine ?? true

    const instance = new Instance(options.instance)

    async function action() {
        await orchestrators.get().outputs(instance, {verbose: options.verbose})
    }

    await instance.machine.noop(ACTIONS.OUTPUTS, action, {lock: options.lock, machine: options.machine})
}
