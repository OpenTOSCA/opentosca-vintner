import {Instance} from '#repositories/instances'
import * as utils from '#utils'
import {StateMachine} from '#utils/state'

export enum STATES {
    VOID = 'VOID',

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
    // VOID
    {from: STATES.VOID, via: ACTIONS.INIT, to: STATES.INITIATED},

    // INITIATED
    {from: STATES.INITIATED, via: ACTIONS.RESOLVE, to: STATES.RESOLVING},
    {from: STATES.INITIATED, via: ACTIONS.DELETE, to: STATES.DELETED},

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
    {from: STATES.UNDEPLOYING, via: ACTIONS.SUCCESS, to: STATES.INITIATED},
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

export class InstanceStateMachine {
    private readonly instance: Instance

    constructor(instance: Instance) {
        this.instance = instance
    }

    async try(action: `${ACTIONS}`, fn: () => Promise<void> | void, enabled = true) {
        if (enabled) {
            const machine = new StateMachine(this.instance.loadState(), TRANSITIONS)
            machine.do(action)
            this.instance.setState(machine.state)

            try {
                await fn()
                machine.do(ACTIONS.SUCCESS)
                this.instance.setState(machine.state)
            } catch (e) {
                machine.do(ACTIONS.ERROR)
                this.instance.setState(machine.state)
                throw e
            }
        } else {
            await fn()
        }
    }

    noop(noop: `${ACTIONS}`, enabled = true) {
        if (!enabled) return

        // TODO: make this a transition somehow (could be generated for each state)
        if (noop === ACTIONS.INFO) return
        if (noop === ACTIONS.DEBUG) return
        if (noop === ACTIONS.STATE) return

        const machine = new StateMachine(this.instance.loadState(), TRANSITIONS)

        const from = machine.state
        const to = machine.do(noop)

        if (from !== to) throw new Error(`Action "${noop}" in state ${from} is not a noop and results in "${to}"`)
    }

    assert(states: `${STATES}`[], enabled = true) {
        if (!enabled) return

        const machine = new StateMachine(this.instance.loadState(), TRANSITIONS)
        if (states.includes(machine.state as `${STATES}`)) return

        throw new Error(`State "${machine.state}" not in  "${utils.pretty(states)}"`)
    }
}
