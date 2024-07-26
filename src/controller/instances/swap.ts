import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import {Instance} from '#repositories/instances'
import {Template} from '#repositories/templates'
import * as utils from '#utils'

export type InstancesSwapOptions = {
    instance: string
    template: string
    force?: boolean
    lock?: boolean
    machine?: boolean
}

export default async function (options: InstancesSwapOptions) {
    /**
     * Validation
     */
    assert.isString(options.instance)
    assert.isString(options.template)

    /**
     * Defaults
     */
    options.force = options.force ?? false
    options.lock = options.force ? true : options.lock ?? true
    options.machine = options.force ? true : options.machine ?? true

    /**
     * Instance
     */
    const instance = new Instance(options.instance)
    const template = new Template(options.template)

    /**
     * Action
     */
    async function action() {
        if (!template.exists()) throw new Error(`Template ${options.instance} does not exist`)
        instance.setTemplate(options.template, utils.now())
    }

    /**
     * Execution
     */
    await instance.machine.try(ACTIONS.SWAP, action, {lock: options.lock, machine: options.machine})
}
