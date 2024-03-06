import Loader from '#graph/loader'
import {TemplatesRepository} from './index'

export class FileTemplateRepository implements TemplatesRepository {
    async getTemplate(name: string) {
        return {
            name,
            template: new Loader(name).raw(),
        }
    }

    async getTemplates() {
        // TODO: implement search in directory
        return Promise.reject('Not Implemented')
    }
}
