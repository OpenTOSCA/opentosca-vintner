import {Instance} from '#repositories/instances'
import * as utils from '#utils'
import lock from '#utils/lock'
import {StateMachine} from '#utils/state'

export enum STATES {
    START = 'START',

    INITIATING = 'INITIATING',
    INITIATING_ERROR = 'INITIATING_ERROR',
    INITIATED = 'INITIATED',

    RESOLVING = 'RESOLVING',
    RESOLVING_ERROR = 'RESOLVING_ERROR',
    RESOLVED = 'RESOLVED',

    DEPLOYING = 'DEPLOYING',
    DEPLOY_ERROR = 'DEPLOY_ERROR',
    DEPLOYED = 'DEPLOYED',

    UNDEPLOYING = 'UNDEPLOY',
    UNDEPLOY_ERROR = 'UNDEPLOY_ERROR',

    SWAPPING = 'SWAPPING',
    SWAPPING_ERROR = 'SWAPPING_ERROR',
    SWAPPED = 'SWAPPED',

    RESOLVING_DEPLOYED = 'RESOLVING_DEPLOYED',
    RESOLVING_DEPLOYED_ERROR = 'RESOLVING_DEPLOYED_ERROR',
    RESOLVED_DEPLOYED = 'RESOLVED_DEPLOYED',

    UPDATING = 'UPDATING',
    UPDATING_ERROR = 'UPDATING_ERROR',

    DELETING = 'DELETING',
    DELETING_ERROR = 'DELETING_ERROR',
    DELETED = 'DELETED',
}

export enum ACTIONS {
    INIT = 'INIT',
    RESOLVE = 'RESOLVE',
    DEPLOY = 'DEPLOY',
    CONTINUE = 'CONTINUE',
    UNDEPLOY = 'UNDEPLOY',
    SWAP = 'SWAP',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',

    // NOOPs
    INFO = 'INFO',
    DEBUG = 'DEBUG',
    STATE = 'STATE',
    INSPECT = 'INSPECT',
    OUTPUTS = 'OUTPUTS',
    VALIDATE = 'VALIDATE',
}

const TRANSITIONS = [
    // START
    {from: STATES.START, via: ACTIONS.INIT, to: STATES.INITIATING},

    // INITIATING
    {from: STATES.INITIATING, via: ACTIONS.SUCCESS, to: STATES.INITIATED},
    {from: STATES.INITIATING, via: ACTIONS.ERROR, to: STATES.INITIATING_ERROR},

    // INITIATING_ERROR
    {from: STATES.INITIATING_ERROR, via: ACTIONS.DELETE, to: STATES.DELETING},

    // INITIATED
    {from: STATES.INITIATED, via: ACTIONS.RESOLVE, to: STATES.RESOLVING},
    {from: STATES.INITIATED, via: ACTIONS.DELETE, to: STATES.DELETING},

    // RESOLVING
    {from: STATES.RESOLVING, via: ACTIONS.SUCCESS, to: STATES.RESOLVED},
    {from: STATES.RESOLVING, via: ACTIONS.ERROR, to: STATES.RESOLVING_ERROR},

    // RESOLVING_ERROR
    {from: STATES.RESOLVING_ERROR, via: ACTIONS.RESOLVE, to: STATES.RESOLVING},
    {from: STATES.RESOLVING_ERROR, via: ACTIONS.DELETE, to: STATES.DELETING},

    // RESOLVED
    {from: STATES.RESOLVED, via: ACTIONS.DEPLOY, to: STATES.DEPLOYING},
    {from: STATES.RESOLVED, via: ACTIONS.DELETE, to: STATES.DELETING},
    {from: STATES.RESOLVED, via: ACTIONS.VALIDATE, to: STATES.RESOLVED},
    {from: STATES.RESOLVED, via: ACTIONS.INSPECT, to: STATES.RESOLVED},

    // DELETING
    {from: STATES.DELETING, via: ACTIONS.SUCCESS, to: STATES.DELETED},
    {from: STATES.DELETING, via: ACTIONS.ERROR, to: STATES.DELETING_ERROR},

    // DELETING_ERROR
    {from: STATES.DELETING_ERROR, via: ACTIONS.DELETE, to: STATES.DELETING},

    // DEPLOYING
    {from: STATES.DEPLOYING, via: ACTIONS.ERROR, to: STATES.DEPLOY_ERROR},
    {from: STATES.DEPLOYING, via: ACTIONS.SUCCESS, to: STATES.DEPLOYED},

    // DEPLOYED
    {from: STATES.DEPLOYED, via: ACTIONS.SWAP, to: STATES.SWAPPING},
    {from: STATES.DEPLOYED, via: ACTIONS.UNDEPLOY, to: STATES.UNDEPLOYING},
    {from: STATES.DEPLOYED, via: ACTIONS.OUTPUTS, to: STATES.DEPLOYED},
    {from: STATES.DEPLOYED, via: ACTIONS.INSPECT, to: STATES.DEPLOYED},

    // DEPLOY_ERROR
    {from: STATES.DEPLOY_ERROR, via: ACTIONS.CONTINUE, to: STATES.DEPLOYING},
    {from: STATES.DEPLOY_ERROR, via: ACTIONS.UNDEPLOY, to: STATES.UNDEPLOYING},

    // UNDEPLOYING
    {from: STATES.UNDEPLOYING, via: ACTIONS.SUCCESS, to: STATES.RESOLVED},
    {from: STATES.UNDEPLOYING, via: ACTIONS.ERROR, to: STATES.UNDEPLOY_ERROR},

    // UNDEPLOY_ERROR
    {from: STATES.UNDEPLOY_ERROR, via: ACTIONS.UNDEPLOY, to: STATES.UNDEPLOYING},

    // SWAPPING
    {from: STATES.SWAPPING, via: ACTIONS.SUCCESS, to: STATES.SWAPPED},
    {from: STATES.SWAPPING, via: ACTIONS.ERROR, to: STATES.SWAPPING_ERROR},

    // SWAPPING_ERROR
    {from: STATES.SWAPPING_ERROR, via: ACTIONS.RESOLVE, to: STATES.RESOLVING_DEPLOYED},
    {from: STATES.SWAPPING_ERROR, via: ACTIONS.UNDEPLOY, to: STATES.UNDEPLOYING},

    // SWAPPED
    {from: STATES.SWAPPED, via: ACTIONS.RESOLVE, to: STATES.RESOLVING_DEPLOYED},
    {from: STATES.SWAPPED, via: ACTIONS.UNDEPLOY, to: STATES.UNDEPLOYING},
    {from: STATES.SWAPPED, via: ACTIONS.SWAP, to: STATES.SWAPPING},

    // RESOLVING_DEPLOYED
    {from: STATES.RESOLVING_DEPLOYED, via: ACTIONS.SUCCESS, to: STATES.RESOLVED_DEPLOYED},
    {from: STATES.RESOLVING_DEPLOYED, via: ACTIONS.ERROR, to: STATES.RESOLVING_DEPLOYED_ERROR},

    // RESOLVING_DEPLOYED_ERROR
    {from: STATES.RESOLVING_DEPLOYED_ERROR, via: ACTIONS.RESOLVE, to: STATES.RESOLVING_DEPLOYED},
    {from: STATES.RESOLVING_DEPLOYED_ERROR, via: ACTIONS.UNDEPLOY, to: STATES.UNDEPLOYING},

    // RESOLVED_DEPLOYED
    {from: STATES.RESOLVED_DEPLOYED, via: ACTIONS.UPDATE, to: STATES.UPDATING},
    {from: STATES.RESOLVED_DEPLOYED, via: ACTIONS.UNDEPLOY, to: STATES.UNDEPLOYING},
    {from: STATES.RESOLVED_DEPLOYED, via: ACTIONS.VALIDATE, to: STATES.RESOLVED_DEPLOYED},

    // UPDATING
    {from: STATES.UPDATING, via: ACTIONS.SUCCESS, to: STATES.DEPLOYED},
    {from: STATES.UPDATING, via: ACTIONS.ERROR, to: STATES.UPDATING_ERROR},

    // UPDATING_ERROR
    {from: STATES.UPDATING_ERROR, via: ACTIONS.CONTINUE, to: STATES.UPDATING},
    {from: STATES.UPDATING_ERROR, via: ACTIONS.UNDEPLOY, to: STATES.UNDEPLOYING},
]

/**
 * NOOPS allowed in any state
 */
for (const action of [ACTIONS.INFO, ACTIONS.DEBUG, ACTIONS.STATE]) {
    for (const state of Object.values(STATES)) {
        TRANSITIONS.push({
            from: state,
            via: action,
            to: state,
        })
    }
}

export class InstanceStateMachine {
    private readonly instance: Instance

    constructor(instance: Instance) {
        this.instance = instance
    }

    async try(
        action: `${ACTIONS}`,
        fn: () => Promise<void> | void,
        options: {lock?: boolean; machine?: boolean; assert?: boolean; write?: boolean; state?: `${STATES}`}
    ) {
        options.lock = options.lock ?? true
        options.machine = options.machine ?? true
        options.assert = options.assert ?? true
        options.write = options.write ?? true

        await lock.try(
            this.instance.getLockKey(),
            async () => {
                if (options.assert) this.instance.assert()

                if (options.machine) {
                    const machine = new StateMachine(options.state ?? this.instance.loadState(), TRANSITIONS)
                    machine.do(action)
                    if (options.write) this.instance.setState(machine.state)

                    try {
                        await fn()
                        machine.do(ACTIONS.SUCCESS)
                        if (options.write) this.instance.setState(machine.state)
                    } catch (e) {
                        machine.do(ACTIONS.ERROR)
                        if (options.write) this.instance.setState(machine.state)
                        throw e
                    }
                } else {
                    await fn()
                }
            },
            options.lock
        )
    }

    /**
     * Execute NOOP Action.
     * In contrast to other actions, a NOOP action does not change the state and also does not have an SUCCESS or ERROR.
     */
    async noop(noop: `${ACTIONS}`, fn: () => Promise<void> | void, options: {lock?: boolean; machine?: boolean}) {
        options.lock = options.lock ?? true
        options.machine = options.machine ?? true

        await lock.try(
            this.instance.getLockKey(),
            async () => {
                if (!options.lock) return
                const machine = new StateMachine(this.instance.loadState(), TRANSITIONS)

                const from = machine.state
                const to = machine.do(noop)

                if (from !== to)
                    throw new Error(`Action "${noop}" in state ${from} is not a noop and results in "${to}"`)

                await fn()
            },
            options.lock
        )
    }

    assert(states: `${STATES}`[], enabled = true) {
        if (!enabled) return

        const machine = new StateMachine(this.instance.loadState(), TRANSITIONS)
        if (states.includes(machine.state as `${STATES}`)) return

        throw new Error(`State "${machine.state}" not in  "${utils.pretty(states)}"`)
    }
}
