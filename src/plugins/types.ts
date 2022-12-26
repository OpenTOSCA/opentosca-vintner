import {ServiceTemplate} from '#spec/service-template'

export interface TemplatesPlugin {
    getTemplate: (path: string) => Promise<{name: string; template: ServiceTemplate}>
    // TODO: this should accept a glob
    getTemplates: () => Promise<{name: string; template: ServiceTemplate}[]>
}

export interface InstancesPlugin {
    getInstance: (path: string) => Promise<{name: string; template: ServiceTemplate}>
    // TODO: this should accept a glob
    getInstances: () => Promise<{name: string; template: ServiceTemplate}[]>
}
