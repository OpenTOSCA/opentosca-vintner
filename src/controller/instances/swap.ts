import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import {Instance} from '#repositories/instances'
import {Template} from '#repositories/templates'
import * as utils from '#utils'
import lock from '#utils/lock'

export type InstancesSwapOptions = {
    instance: string
    template: string
    force?: boolean
    lock?: boolean
    machine?: boolean
}

export default async function (options: InstancesSwapOptions) {
    assert.isString(options.instance)
    assert.isString(options.template)

    options.force = options.force ?? false
    options.lock = options.lock ?? !options.force
    options.machine = options.machine ?? !options.force

    const instance = new Instance(options.instance)
    const template = new Template(options.template)

    await lock.try(
        instance.getLockKey(),
        async () => {
            await lock.try(template.getLockKey(), async () => {
                instance.assert()

                await instance.machine.try(
                    ACTIONS.SWAP,
                    async () => {
                        if (!instance.exists()) throw new Error(`Instance ${options.instance} does not exists`)
                        if (!template.exists()) throw new Error(`Template ${options.instance} does not exist`)
                        instance.setTemplate(options.template, utils.now())
                    },
                    options.machine
                )
            })
        },
        options.lock
    )
}
