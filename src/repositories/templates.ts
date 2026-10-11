import * as assert from '#assert'
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
        return files
            .listDirectories(Templates.getTemplatesDirectory())
            .filter(name => check.isName(name))
            .map(name => new Template(name))
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
        assert.isName(name)
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
            const repoDir = files.temporaryDirent()

            await git.clone(options.gitRepository, repoDir)
            if (check.isDefined(options.gitCheckout)) {
                await git.checkout(options.gitCheckout, repoDir)
            }

            options.path = path.join(repoDir, options.path)
        }

        if (files.isFile(options.path)) {
            if (check.isDefined(options.key)) {
                await this.verify({
                    template: options.path,
                    signature: options.signature ?? crypto.signatureFile(options.path),
                    key: options.key,
                })
            }
            await files.extractArchive(options.path, this.getTemplateDirectory())
            return this
        }

        if (files.isDirectory(options.path)) {
            if (check.isDefined(options.key)) throw new Error(`Signature verification is only supported for archives`)
            files.copy(options.path, this.getTemplateDirectory())
            return this
        }

        if (files.isLink(options.path)) {
            const file = await files.download(options.path)
            if (check.isDefined(options.key)) {
                await this.verify({
                    template: file,
                    signature: options.signature ?? crypto.signatureFile(options.path),
                    key: options.key,
                })
            }
            await files.extractArchive(file, this.getTemplateDirectory())
            return this
        }

        throw new Error(`Path ${options.path} is neither a file, a directory nor a HTTP(S) link`)
    }

    /**
     * Verifies the signature of the template archive.
     * The signature might be a local file or a HTTP(S) link.
     */
    private async verify(options: {template: string; signature: string; key: string}) {
        const key = new Asset(options.key)
        if (!key.exists()) throw new Error(`Key "${key.getName()}" does not exist`)

        await Controller.template.verify({
            template: options.template,
            signature: files.isLink(options.signature) ? await files.download(options.signature) : options.signature,
            key: key.getFile(),
        })
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
