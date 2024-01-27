import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'
import {TemplatesRepository} from './index'

export class FileTemplateRepository implements TemplatesRepository {
    async getTemplate(name: string) {
        return {
            name,
            template: files.loadYAML<ServiceTemplate>(name),
        }
    }

    async getTemplates() {
        // TODO: implement search in directory
        return Promise.reject('Not Implemented')
    }
}
