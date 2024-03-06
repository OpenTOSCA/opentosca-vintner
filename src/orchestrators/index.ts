import * as assert from '#assert'
import config from '#config'
import {Unfurl, UnfurlNativeConfig, UnfurlWSLConfig} from '#orchestrators/unfurl'
import {xOpera, xOperaNativeConfig, xOperaWSLConfig} from '#orchestrators/xopera'
import {Instance} from '#repositories/instances'
import {AttributeAssignmentMap} from '#spec/node-template'

export default {
    get: getOrchestrator,
}

function getOrchestrator(orchestrator?: string) {
    const data = config.load()

    switch (orchestrator ?? data.enabled) {
        case 'xopera':
            assert.isDefined(data.xOpera, 'xOpera is enabled but no config was found')
            return new xOpera({...data.xOpera, wsl: false})

        case 'xopera-wsl':
            assert.isDefined(data.xOperaWSL, 'xOperaWSL is enabled but no config was found')
            return new xOpera({...data.xOperaWSL, wsl: true})

        case 'unfurl':
            assert.isDefined(data.unfurl, 'Unfurl is enabled but no config was found')
            return new Unfurl({...data.unfurl, wsl: false})

        case 'unfurl-wsl':
            assert.isDefined(data.unfurlWSL, 'UnfurlWSL is enabled but no config was found')
            return new Unfurl({...data.unfurlWSL, wsl: true})

        case undefined:
            throw new Error('No orchestrator is enabled')

        default:
            throw new Error(`Orchestrator "${data.enabled}" is not supported`)
    }
}

export type NodeTemplateAttributes = {
    attributes: AttributeAssignmentMap
}

export type NodeTemplateAttributesMap = {[key: string]: NodeTemplateAttributes}

export type OrchestratorOperationOptions = {
    verbose?: boolean
    time?: number
}

export type OrchestratorValidateOptions = {inputs?: string; dry?: boolean} & OrchestratorOperationOptions

export interface Orchestrator {
    attest: () => Promise<void>
    validate: (instance: Instance, options?: OrchestratorValidateOptions) => Promise<void>
    deploy: (instance: Instance, options?: OrchestratorOperationOptions) => Promise<void>
    outputs: (instance: Instance, options?: OrchestratorOperationOptions) => Promise<void>
    continue: (instance: Instance, options?: OrchestratorOperationOptions) => Promise<void>
    update: (instance: Instance, options?: OrchestratorOperationOptions) => Promise<void>
    undeploy: (instance: Instance, options?: OrchestratorOperationOptions) => Promise<void>
    getAttributes: (instance: Instance) => Promise<NodeTemplateAttributesMap>
}

export type OrchestratorsConfig = {
    enabled?: string
    xOpera?: xOperaNativeConfig
    xOperaWSL?: xOperaWSLConfig
    unfurl?: UnfurlNativeConfig
    unfurlWSL?: UnfurlWSLConfig
}
