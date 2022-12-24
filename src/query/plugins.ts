import {ServiceTemplate} from '#spec/service-template'

export interface TemplatesPlugin {
    getTemplate: (path: string) => {name: string; template: ServiceTemplate}
    // TODO: this should accept a glob
    getTemplates: () => {name: string; template: ServiceTemplate}[]
}
