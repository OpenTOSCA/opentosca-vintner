import {Instance, Instances} from '#repositories/instances'
import {TemplatesRepository} from './index'

// TODO: should this operate on Templates, on Instances or on both?
export class VintnerTemplatesRepository implements TemplatesRepository {
    async getTemplate(name: string) {
        return {
            name,
            template: new Instance(name).loadServiceTemplate(),
        }
    }

    async getTemplates() {
        return Instances.all().map(it => ({
            name: it.getName(),
            template: it.loadServiceTemplate(),
        }))
    }
}
