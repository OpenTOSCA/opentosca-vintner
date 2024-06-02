import * as assert from '#assert'
import {Instance} from '#repositories/instances'
import {Template} from '#repositories/templates'
import * as utils from '#utils'
import lock from '#utils/lock'

export type InstancesCreateOptions = {
    instance: string
    template: string
    force?: boolean
    lock?: boolean
}

export default async function (options: InstancesCreateOptions) {
    assert.isString(options.instance)
    assert.isString(options.template)

    options.force = options.force ?? false
    options.lock = options.lock ?? !options.force

    const instance = new Instance(options.instance)
    const template = new Template(options.template)

    await lock.try(
        instance.getLockKey(),
        async () => {
            await lock.try(template.getLockKey(), async () => {
                assert.isName(instance.getName())
                if (instance.exists()) throw new Error(`Instance ${options.instance} already exists`)
                if (!template.exists()) throw new Error(`Template ${options.instance} does not exist`)
                instance.create(template, utils.now())
            })
        },
        options.lock
    )
}
