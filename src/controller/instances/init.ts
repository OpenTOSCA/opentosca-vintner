import * as assert from '#assert'
import Controller from '#controller'
import {ACTIONS, STATES} from '#machines/instance'
import {Instance} from '#repositories/instances'
import {Template} from '#repositories/templates'
import {TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
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
    options.lock = options.force ? false : options.lock ?? true
    options.machine = options.force ? false : options.machine ?? true

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

        const loaded = template.loadVariableServiceTemplate()
        if (loaded.tosca_definitions_version === TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3) {
            await Controller.instances.resolve({
                instance: instance.getName(),
                enrich: false,
                lock: false,
            })
        }
    }

    /**
     * Execution
     */
    await instance.machine.try(ACTIONS.INIT, action, {
        state: STATES.START,
        lock: options.lock,
        machine: options.machine,
        assert: false,
        write: false,
    })
}
