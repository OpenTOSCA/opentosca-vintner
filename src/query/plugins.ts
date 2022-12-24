import {ServiceTemplate} from '#spec/service-template'
import {Instance} from '#repository/instances'
import {InputAssignmentMap} from '#spec/topology-template'
import {AttributeAssignmentMap} from '#spec/node-template'

export type NodeTemplateAttributes = {
    attributes: AttributeAssignmentMap
}

export type NodeTemplateAttributesMap = {[key: string]: NodeTemplateAttributes}

export interface QueryTemplatesPlugin {
    getTemplate: (path: string) => {name: string; template: ServiceTemplate}
    // TODO: this should accept a glob
    getTemplates: () => {name: string; template: ServiceTemplate}[]
}

// TODO: merge this into into OrchestratorPlugin?
export interface QueryInstancesPlugin {
    // TODO: there should be something like getInstanceTemplate
    getAttributes: (instance: Instance) => NodeTemplateAttributesMap
    // TODO: why not use Instance.getInputs()
    getInputs: (instance: Instance) => InputAssignmentMap
}
