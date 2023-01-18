import {TemplatesRepositoryPlugin} from '#plugins/types'
import {Instance, Instances} from '#repository/instances'

// TODO: should this operate on Templates, on Instances or on both?
export class VintnerPlugin implements TemplatesRepositoryPlugin {
    async getTemplate(name: string) {
        return {
            name,
            template: new Instance(name).getServiceTemplate(),
        }
    }

    async getTemplates() {
        return Instances.all().map(it => ({
            name: it.getName(),
            template: it.getServiceTemplate(),
        }))
    }
}
