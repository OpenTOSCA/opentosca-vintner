import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'
import std from '#std'
import * as utils from '#utils'

export type InstancesDeployOptions = {
    instance: string
    inputs?: string
    verbose?: boolean
    retry?: boolean
    force?: boolean
    lock?: boolean
    machine?: boolean
}

export default async function (options: InstancesDeployOptions) {
    /**
     * Validation
     */
    assert.isString(options.instance)

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

    /**
     * Action
     */
    async function action() {
        instance.setServiceInputs(utils.now(), options.inputs)

        const orchestrator = orchestrators.get()
        try {
            await orchestrator.deploy(instance, {verbose: options.verbose})
        } catch (e) {
            if (!options.retry) throw e
            std.log(e)
            await utils.sleep(10 * 1000)
            await orchestrator.continue(instance, {verbose: options.verbose})
        }
    }

    /**
     * Execution
     */
    await instance.machine.try(ACTIONS.DEPLOY, action, {lock: options.lock, machine: options.machine})
}
