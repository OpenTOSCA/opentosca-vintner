import path from 'path'
import {LIB_DIRECTORY, TMP_DIRECTORY} from './utils'
import syncDirectory from 'sync-directory'

export class Dependency {
    id: string
    name: string
    path: string[]
    target: string
    checkout: string
    repo: string
    clone: string
    source: string

    constructor(name: string, repo: string, checkout: string) {
        this.id = [name, checkout].join('@')
        this.name = name
        this.path = name.split('.')
        this.target = path.join(LIB_DIRECTORY, this.id)
        this.checkout = checkout
        this.repo = repo
        this.clone = path.join(TMP_DIRECTORY, this.id)
        this.source = path.join(this.clone, ...this.path)
    }

    /**
     * Sync the repo and the lib directory of a dependency
     */
    async sync() {
        return new Promise(resolve => {
            syncDirectory(this.source, this.target, {
                deleteOrphaned: true,
            })
            resolve(null)
        })
    }
}

export type Dependencies = Dependency[]
