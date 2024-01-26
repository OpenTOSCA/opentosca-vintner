import {ServiceTemplate} from '#spec/service-template'
import {FilePlugin} from './file'
import {VintnerPlugin} from './vintner'
import {WineryPlugin} from './winery'

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

function getTemplateRepository(name: string) {
    switch (name) {
        case 'file':
            return new FilePlugin()

        case 'vintner':
            return new VintnerPlugin()

        case 'winery':
            return new WineryPlugin()

        default:
            throw new Error(`Unknown templates plugin "${name}"`)
    }
}

export default {
    get: getTemplateRepository,
}
