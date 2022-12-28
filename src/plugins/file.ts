import {TemplatesRepositoryPlugin} from '#plugins/types'
import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'

export class FilePlugin implements TemplatesRepositoryPlugin {
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
