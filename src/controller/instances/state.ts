import {STATE, StateMachine} from '#utils/state'

enum STATES {
    VOID = 'VOID',
    INITIATED = 'INITIATED',
    RESOLVED = 'RESOLVED',
    DEPLOYING = 'DEPLOYING',
    DEPLOY_ERROR = 'DEPLOY_ERROR',
    DEPLOYED = 'DEPLOYED',
    UNDEPLOYING = 'UNDEPLOY',
    UNDEPLOY_ERROR = 'UNDEPLOY_ERROR',
    SWAPPED = 'SWAPPED',
    RESOLVED_DEPLOYED = 'RESOLVED_DEPLOYED',
    UPDATING = 'UPDATING',
    UPDATING_ERROR = 'UPDATING_ERROR',
    DELETED = 'DELETED',
}

enum ACTIONS {
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
}

function createStateMachine(state: STATE) {
    return new StateMachine(state, [
        // VOID
        {from: STATES.VOID, via: ACTIONS.INIT, to: STATES.INITIATED},

        // INITIATED
        {from: STATES.INITIATED, via: ACTIONS.RESOLVE, to: STATES.RESOLVED},
        {from: STATES.INITIATED, via: ACTIONS.DELETE, to: STATES.DELETED},

        // RESOLVED
        {from: STATES.RESOLVED, via: ACTIONS.DEPLOY, to: STATES.DEPLOYING},
        {from: STATES.RESOLVED, via: ACTIONS.DELETE, to: STATES.DELETED},

        // DEPLOYING
        {from: STATES.DEPLOYING, via: ACTIONS.ERROR, to: STATES.DEPLOY_ERROR},
        {from: STATES.DEPLOYING, via: ACTIONS.SUCCESS, to: STATES.DEPLOYED},

        // DEPLOY
        {from: STATES.DEPLOYED, via: ACTIONS.SWAP, to: STATES.SWAPPED},
        {from: STATES.DEPLOYED, via: ACTIONS.UNDEPLOY, to: STATES.UNDEPLOYING},

        // DEPLOY_ERROR
        {from: STATES.DEPLOY_ERROR, via: ACTIONS.CONTINUE, to: STATES.DEPLOYING},
        {from: STATES.DEPLOY_ERROR, via: ACTIONS.UNDEPLOY, to: STATES.UNDEPLOYING},

        // UNDEPLOYING
        {from: STATES.UNDEPLOYING, via: ACTIONS.SUCCESS, to: STATES.INITIATED},
        {from: STATES.UNDEPLOYING, via: ACTIONS.ERROR, to: STATES.UNDEPLOY_ERROR},

        // UNDEPLOY_ERROR
        {from: STATES.UNDEPLOY_ERROR, via: ACTIONS.UNDEPLOY, to: STATES.UNDEPLOYING},

        // SWAPPED
        {from: STATES.SWAPPED, via: ACTIONS.RESOLVE, to: STATES.RESOLVED_DEPLOYED},
        {from: STATES.SWAPPED, via: ACTIONS.UNDEPLOY, to: STATES.UNDEPLOYING},

        // RESOLVED_DEPLOYED
        {from: STATES.RESOLVED_DEPLOYED, via: ACTIONS.UPDATE, to: STATES.UPDATING},
        {from: STATES.RESOLVED_DEPLOYED, via: ACTIONS.UNDEPLOY, to: STATES.UNDEPLOYING},

        // UPDATING
        {from: STATES.UPDATING, via: ACTIONS.SUCCESS, to: STATES.DEPLOYED},
        {from: STATES.UPDATING, via: ACTIONS.ERROR, to: STATES.UPDATING_ERROR},

        // UPDATING_ERROR
        {from: STATES.UPDATING_ERROR, via: ACTIONS.CONTINUE, to: STATES.UPDATING},
        {from: STATES.UPDATING_ERROR, via: ACTIONS.UNDEPLOY, to: STATES.UNDEPLOYING},
    ])
}
