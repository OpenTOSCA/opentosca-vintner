import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'
import lock from '#utils/lock'

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
    assert.isString(options.instance)

    options.force = options.force ?? false
    options.lock = options.lock ?? !options.force
    options.machine = options.machine ?? !options.force

    const instance = new Instance(options.instance)
    await lock.try(
        instance.getLockKey(),
        async () => {
            instance.assert()
            instance.machine.noop(ACTIONS.VALIDATE)

            await orchestrators
                .get()
                .validate(instance, {verbose: options.verbose, inputs: options.inputs, dry: options.dry})
        },
        options.lock
    )
}
