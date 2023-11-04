import * as check from '#check'
import config from '#config'
import Controller from '#controller'
import * as crypto from '#crypto'
import * as files from '#files'
import * as git from '#git'
import {Key} from '#repository/keystore'
import {ServiceTemplate} from '#spec/service-template'
import * as utils from '#utils'
import path from 'path'

export class Templates {
    static all() {
        return files.listDirectories(Templates.getTemplatesDirectory()).map(name => new Template(name))
    }

    static getTemplatesDirectory() {
        return path.join(config.home, 'templates')
    }

    static isEmpty() {
        return utils.isEmpty(files.listDirectories(Templates.getTemplatesDirectory()))
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

    getLockKey() {
        return 'templates:' + this.getName()
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

    async importTemplate(options: {
        path: string
        gitRepository?: string
        gitCheckout?: string
        signature?: string
        key?: string
    }) {
        if (check.isDefined(options.gitRepository)) {
            const repoDir = files.temporary()

            await git.clone(options.gitRepository, repoDir)
            if (check.isDefined(options.gitCheckout)) {
                await git.checkout(options.gitCheckout, repoDir)
            }

            options.path = path.join(repoDir, options.path)
        }

        if (files.isFile(options.path)) {
            if (check.isDefined(options.key)) {
                options.signature = options.signature ?? crypto.signatureFile(options.path)
                await Controller.template.verify({
                    template: options.path,
                    signature: options.signature,
                    key: new Key(options.key).getFile(),
                })
            }
            await files.extractArchive(options.path, this.getTemplateDirectory())
            return this
        }

        if (files.isDirectory(options.path)) {
            files.copy(options.path, this.getTemplateDirectory())
            return this
        }

        if (files.isLink(options.path)) {
            const file = await files.download(options.path)
            await files.extractArchive(file, this.getTemplateDirectory())
            return this
        }

        throw new Error(`Path ${options.path} is neither a file, a directory nor a HTTP(S) link`)
    }

    getVariableServiceTemplatePath() {
        return path.join(this.getTemplateDirectory(), 'variable-service-template.yaml')
    }

    loadVariableServiceTemplate() {
        return files.loadYAML<ServiceTemplate>(this.getVariableServiceTemplatePath())
    }

    delete() {
        files.deleteDirectory(this.getTemplateDirectory())
        return this
    }
}
