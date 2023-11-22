import {Instance} from '#repositories/instances'
import {Template} from '#repositories/templates'
import * as assert from '#assert'
import * as utils from '#utils'
import lock from '#utils/lock'

export type InstancesCreateOptions = {instance: string; template: string}

export default async function (options: InstancesCreateOptions) {
    const instance = new Instance(options.instance)
    const template = new Template(options.template)

    await lock.try(instance.getLockKey(), async () => {
        await lock.try(template.getLockKey(), async () => {
            assert.isName(instance.getName())
            if (instance.exists()) throw new Error(`Instance ${options.instance} already exists`)
            if (!template.exists()) throw new Error(`Template ${options.instance} does not exist`)
            instance.create(template, utils.now())
        })
    })
}
