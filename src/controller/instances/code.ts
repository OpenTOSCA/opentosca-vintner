import * as assert from '#assert'
import {Instance} from '#repositories/instances'
import open from '#utils/open'

export type InstancesOpenOptions = {instance: string}

export default async function (options: InstancesOpenOptions) {
    assert.isString(options.instance)

    const instance = new Instance(options.instance)
    instance.assert()
    await open.code(instance.getInstanceDirectory())
}
