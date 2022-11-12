import * as files from '#files'
import path from 'path'
import config from '#config'
import {ServiceTemplate} from '#spec/service-template'

export class Templates {
    static all() {
        return files.listDirectories(Templates.getTemplatesDirectory()).map(name => new Template(name))
    }

    static getTemplatesDirectory() {
        return path.join(config.home, 'templates')
    }
}

export class Template {
    private readonly _name: string

    constructor(name: string) {
        this._name = name
    }

    getName() {
        return this._name
    }

    create() {
        files.createDirectory(this.getTemplateDirectory())
        return this
    }

    exists() {
        return files.exists(this.getTemplateDirectory())
    }

    getTemplateDirectory() {
        return path.join(Templates.getTemplatesDirectory(), this._name)
    }

    async importTemplate(path: string) {
        if (files.isFile(path)) {
            await files.extractArchive(path, this.getTemplateDirectory())
            return this
        }

        if (files.isDirectory(path)) {
            files.copy(path, this.getTemplateDirectory())
            return this
        }

        if (files.isLink(path)) {
            const file = await files.download(path)
            await files.extractArchive(file, this.getTemplateDirectory())
            return this
        }

        throw new Error(`Path ${path} is neither a file, a directory nor a HTTP(S) link`)
    }

    getVariableServiceTemplatePath() {
        return path.join(this.getTemplateDirectory(), 'variable-service-template.yaml')
    }

    getVariableServiceTemplate() {
        return files.loadYAML<ServiceTemplate>(this.getVariableServiceTemplatePath())
    }

    delete() {
        files.removeDirectory(this.getTemplateDirectory())
        return this
    }
}
