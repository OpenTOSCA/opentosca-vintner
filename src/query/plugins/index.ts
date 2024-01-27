import {ServiceTemplate} from '#spec/service-template'
import {FileTemplateRepository} from './file'
import {VintnerTemplatesRepository} from './vintner'
import {WineryTemplatesRepository} from './winery'

type NamedServiceTemplate = {name: string; template: ServiceTemplate}

export interface TemplatesRepository {
    getTemplate: (path: string) => Promise<NamedServiceTemplate>
    getTemplates: () => Promise<NamedServiceTemplate[]>
}

// TODO: this never used
export interface InstancesRepositoryPlugin {
    getInstance: (path: string) => Promise<NamedServiceTemplate>
    getInstances: () => Promise<NamedServiceTemplate[]>
}

function getTemplateRepository(name: string) {
    switch (name) {
        case 'file':
            return new FileTemplateRepository()

        case 'vintner':
            return new VintnerTemplatesRepository()

        case 'winery':
            return new WineryTemplatesRepository()

        default:
            throw new Error(`Unknown templates plugin "${name}"`)
    }
}

export default {
    get: getTemplateRepository,
}
