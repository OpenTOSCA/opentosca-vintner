import {UnfurlNativeConfig, UnfurlWSLConfig} from '#plugins/unfurl'
import {xOperaNativeConfig, xOperaWLSConfig} from '#plugins/xopera'
import {Instance} from '#repository/instances'
import {AttributeAssignmentMap} from '#spec/node-template'
import {ServiceTemplate} from '#spec/service-template'

type NamedServiceTemplate = {name: string; template: ServiceTemplate}

export interface TemplatesRepositoryPlugin {
    getTemplate: (path: string) => Promise<NamedServiceTemplate>
    getTemplates: () => Promise<NamedServiceTemplate[]>
}

// TODO: this never used
export interface InstancesRepositoryPlugin {
    getInstance: (path: string) => Promise<NamedServiceTemplate>
    getInstances: () => Promise<NamedServiceTemplate[]>
}

export type NodeTemplateAttributes = {
    attributes: AttributeAssignmentMap
}

export type NodeTemplateAttributesMap = {[key: string]: NodeTemplateAttributes}

export type OrchestratorOperationOptions = {
    verbose?: boolean
    time?: number
}

export interface OrchestratorPlugin {
    attest: () => Promise<void>
    validate: (instance: Instance, options?: OrchestratorOperationOptions) => Promise<void>
    deploy: (instance: Instance, options?: OrchestratorOperationOptions) => Promise<void>
    continue: (instance: Instance, options?: OrchestratorOperationOptions) => Promise<void>
    update: (instance: Instance, options?: OrchestratorOperationOptions) => Promise<void>
    undeploy: (instance: Instance, options?: OrchestratorOperationOptions) => Promise<void>
    getAttributes: (instance: Instance) => Promise<NodeTemplateAttributesMap>
}

export type OrchestratorsConfig = {
    enabled?: string
    xOpera?: xOperaNativeConfig
    xOperaWSL?: xOperaWLSConfig
    unfurl?: UnfurlNativeConfig
    unfurlWSL?: UnfurlWSLConfig
}
