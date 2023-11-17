import config from '#config'
import * as files from '#files'
import * as utils from '#utils'
import path from 'path'

export class Store {
    static all() {
        return files.listDirectories(Store.getDirectory()).map(name => new Entry(name))
    }

    static getDirectory() {
        return path.join(config.home, 'store')
    }

    static isEmpty() {
        return utils.isEmpty(files.listDirectories(Store.getDirectory()))
    }
}

export class Entry {
    private readonly _name: string

    constructor(name: string) {
        this._name = name
    }

    getName() {
        return this._name
    }

    getFile() {
        return path.join(Store.getDirectory(), this.getName())
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
        await files.deleteFile(this.getFile())
        return this
    }
}
