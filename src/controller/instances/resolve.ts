import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import {Instance} from '#repositories/instances'
import * as Resolver from '#resolver'
import * as utils from '#utils'

export type InstanceResolveOptions = {
    instance: string
    presets?: string[]
    inputs?: string
    force?: boolean
    lock?: boolean
    machine?: boolean
}

export default async function (options: InstanceResolveOptions) {
    /**
     * Validation
     */
    assert.isString(options.instance)

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

    /**
     * Action
     */
    async function action() {
        // Time
        const time = utils.now()

        // Resolve variability
        const result = await Resolver.run({
            template: instance.getVariableServiceTemplate(),
            inputs: options.inputs,
            presets: options.presets,
        })

        // Store used variability inputs
        // Required later for self-adaptation
        // Note, used presets are resolved to respective variability inputs
        await instance.setVariabilityInputs(result.inputs, time)

        // Store variability resolved service template
        instance.setServiceTemplate(result.template, time)
        instance.setResolvedTimestamp(time)
    }

    /**
     * Execution
     */
    await instance.machine.try(ACTIONS.RESOLVE, action, {lock: options.lock, machine: options.machine})
}
