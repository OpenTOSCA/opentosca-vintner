import * as assert from '#assert'
import {ACTIONS, STATES} from '#machines/instance'
import {Instance} from '#repositories/instances'
import {Template} from '#repositories/templates'
import * as utils from '#utils'

export type InstancesCreateOptions = {
    instance: string
    template: string
    force?: boolean
    lock?: boolean
    machine?: boolean
}

export default async function (options: InstancesCreateOptions) {
    /**
     * Validation
     */
    assert.isString(options.instance)
    assert.isString(options.template)

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
    const template = new Template(options.template)

    /**
     * Action
     */
    async function action() {
        assert.isName(instance.getName())
        if (instance.exists()) throw new Error(`Instance ${options.instance} already exists`)
        if (!template.exists()) throw new Error(`Template ${options.instance} does not exist`)
        instance.create(template, utils.now())
    }

    /**
     * Execution
     */
    await instance.machine.try(ACTIONS.INIT, action, {
        state: STATES.START,
        lock: options.lock,
        machine: options.machine,
        assert: false,
    })
}
