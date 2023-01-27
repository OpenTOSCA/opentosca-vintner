import {ServiceTemplate} from '#spec/service-template'
import {AttributeAssignmentMap} from '#spec/node-template'
import {Instance} from '#repository/instances'
import {OperaNativeConfig, OperaWLSConfig} from '#plugins/opera'
import {UnfurlNativeConfig, UnfurlWSLConfig} from '#plugins/unfurl'

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

export interface OrchestratorPlugin {
    deploy: (instance: Instance) => Promise<void>
    update: (instance: Instance) => Promise<void>
    undeploy: (instance: Instance) => Promise<void>
    getAttributes: (instance: Instance) => Promise<NodeTemplateAttributesMap>
}

export type OrchestratorsConfig = {
    enabled?: string
    opera?: OperaNativeConfig
    operaWSL?: OperaWLSConfig
    unfurl?: UnfurlNativeConfig
    unfurlWSL?: UnfurlWSLConfig
}
