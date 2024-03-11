import * as check from '#check'
import Controller from '#controller'
import * as crypto from '#crypto'
import * as files from '#files'
import * as git from '#git'
import Loader from '#graph/loader'
import {Asset} from '#repositories/assets'
import * as utils from '#utils'
import env from '#utils/env'
import path from 'path'

export class Templates {
    static all() {
        return files.listDirectories(Templates.getTemplatesDirectory()).map(name => new Template(name))
    }

    static getTemplatesDirectory() {
        return path.join(env.home, 'templates')
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

    async importTemplate(options: {path: string; gitRepository?: string; gitCheckout?: string; signature?: string; key?: string}) {
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
                const key = new Asset(options.key)
                if (!key.exists()) throw new Error(`Key "${key.getName()}" does not exist`)

                await Controller.template.verify({
                    template: options.path,
                    signature: options.signature,
                    key: key.getFile(),
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
        return new Loader(this.getVariableServiceTemplatePath()).raw()
    }

    delete() {
        files.removeDirectory(this.getTemplateDirectory())
        return this
    }
}
