import {TemplatesPlugin} from '#plugins/types'
import {Instance, Instances} from '#repository/instances'

// TODO: this should use Templates and not Instances and should filter for correct definitions version?
export class Vintner implements TemplatesPlugin {
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
