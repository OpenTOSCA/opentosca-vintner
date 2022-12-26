import {TemplatesPlugin} from '#plugins/types'
import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'

export class File implements TemplatesPlugin {
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
