import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'
import lock from '#utils/lock'

export type InstancesContinueOptions = {
    instance: string
    verbose?: boolean
    force?: boolean
    lock?: boolean
    machine?: boolean
}

export default async function (options: InstancesContinueOptions) {
    assert.isString(options.instance)

    options.force = options.force ?? false
    options.lock = options.lock ?? !options.force
    options.machine = options.machine ?? !options.force

    const instance = new Instance(options.instance)
    await lock.try(
        instance.getLockKey(),
        async () => {
            instance.assert()

            await instance.machine.try(
                ACTIONS.CONTINUE,
                async () => {
                    await orchestrators.get().continue(instance, {verbose: options.verbose})
                },
                options.machine
            )
        },
        options.lock
    )
}
