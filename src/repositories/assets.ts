import * as files from '#files'
import * as utils from '#utils'
import env from '#utils/env'
import path from 'path'

export class Assets {
    static all() {
        return files.listDirectories(Assets.getDirectory()).map(name => new Asset(name))
    }

    static getDirectory() {
        return path.join(env.home, 'assets')
    }

    static isEmpty() {
        return utils.isEmpty(files.listDirectories(Assets.getDirectory()))
    }
}

export class Asset {
    private readonly _name: string

    constructor(name: string) {
        this._name = name
    }

    getName() {
        return this._name
    }

    getFile() {
        return path.join(Assets.getDirectory(), this.getName())
    }

    exists() {
        return files.exists(this.getFile())
    }

    import(options: {file: string}) {
        files.copy(options.file, this.getFile())
    }

    store(content: string) {
        files.storeFile(this.getFile(), content)
    }

    load() {
        return files.loadFile(this.getFile())
    }

    async delete() {
        files.removeFile(this.getFile())
        return this
    }
}
