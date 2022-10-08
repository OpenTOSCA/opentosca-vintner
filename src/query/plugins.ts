import {ServiceTemplate} from '../specification/service-template';

export interface RepoPlugin {
    getTemplate: (path: string) => {name: string, template: ServiceTemplate}
    getAllTemplates: () => {name: string, template: ServiceTemplate}[]
}

type InstancePlugin = {
    getServiceTemplate: Function
}
