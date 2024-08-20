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
    retries?: number
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
    options.lock = options.force ? false : options.lock ?? true
    options.machine = options.force ? false : options.machine ?? true
    options.retries = options.retries ? Number(options.retries) : 1

    /**
     * Instance
     */
    const instance = new Instance(options.instance)

    /**
     * Action
     */
    async function action() {
        instance.setServiceInputs(utils.now(), options.inputs)
        assert.isDefined(options.retries)

        const orchestrator = orchestrators.get()

        const total = options.retries + 1
        let remaining = total
        while (remaining > 0) {
            try {
                std.log(`run ${total - remaining + 1} of ${total}`)
                await orchestrator.deploy(instance, {verbose: options.verbose})
            } catch (e) {
                // Throw in final run
                if (remaining === 1) throw e

                // Log and retry
                std.log(e)
                await utils.sleep(10 * 1000)
                await orchestrator.continue(instance, {verbose: options.verbose})
            } finally {
                remaining--
            }
        }
    }

    /**
     * Execution
     */
    await instance.machine.try(ACTIONS.DEPLOY, action, {lock: options.lock, machine: options.machine})
}
