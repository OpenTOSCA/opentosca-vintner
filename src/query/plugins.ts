import {ServiceTemplate} from '../specification/service-template'
import {Instance} from '../repository/instances'

export type NodeTemplateAttributes = {
    attributes: {[key: string]: string}
}

export type NodeTemplateAttributesMap = {[key: string]: NodeTemplateAttributes}

export interface RepoPlugin {
    getTemplate: (path: string) => {name: string; template: ServiceTemplate}
    getAllTemplates: () => {name: string; template: ServiceTemplate}[]
}

export interface OrchestratorPlugin {
    getAttributes: (instance: Instance) => NodeTemplateAttributesMap
}
