import * as assert from '#assert'
import {Instance} from '#repositories/instances'

export type InstanceStateOptions = {
    instance: string
    state: string
    force?: boolean
    lock?: boolean
}

export default async function (options: InstanceStateOptions) {
    /**
     * Validation
     */
    assert.isString(options.instance)

    /**
     * Defaults
     */
    options.force = options.force ?? false
    options.lock = options.force ? true : options.lock ?? true

    /**
     * Instance
     */
    const instance = new Instance(options.instance)

    /**
     * Execution
     */
    await instance.machine.set(options.state, {lock: options.lock})
}
