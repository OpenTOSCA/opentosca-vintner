import config from '#config'
import * as files from '#files'
import * as utils from '#utils'
import path from 'path'

export class Keystore {
    static all() {
        return files.listDirectories(Keystore.getKeystoreDirectory()).map(name => new Key(name))
    }

    static getKeystoreDirectory() {
        return path.join(config.home, 'keystore')
    }

    static isEmpty() {
        return utils.isEmpty(files.listDirectories(Keystore.getKeystoreDirectory()))
    }
}

export class Key {
    private readonly _name: string

    constructor(name: string) {
        this._name = name
    }

    getName() {
        return this._name
    }

    getFile() {
        return path.join(Keystore.getKeystoreDirectory(), this.getName())
    }

    exists() {
        return files.exists(this.getFile())
    }

    import(options: {path: string}) {
        files.copy(options.path, this.getFile())
    }

    load() {
        return files.loadFile(this.getFile())
    }

    async delete() {
        await files.deleteFile(this.getFile())
        return this
    }

    generate() {
        // TODO: generate
    }
}
