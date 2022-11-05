import syncDirectory from 'sync-directory'
import {Shell} from '../utils/shell'
import * as files from '../utils/files'
import path from 'path'
// TODO: fix recursive import?
import {DependencyFile} from './dependency-file'
import config from "../utils/config";

export class Dependency {
    id: string
    name: string
    path: string[]
    libDir: string
    checkout: string
    repo: string
    cloneDir: string
    sourceDir: string
    dependenciesFile: string

    constructor(name: string, checkout: string, repo: string) {
        this.id = [name, checkout].join('@')
        this.name = name
        this.path = name.split('.')
        this.libDir = path.join(config.libDir, this.id)
        this.checkout = checkout
        this.repo = repo
        this.cloneDir = path.join(config.packageCacheDir, this.id)
        this.sourceDir = path.join(this.cloneDir, ...this.path)
        this.dependenciesFile = path.join(this.libDir, config.dependencyFile)
        // TODO: path.resolve?!
    }

    async install() {
        console.log('Installing', this)

        files.createDirectory(config.libDir)
        files.createDirectory(config.packageCacheDir)

        await this.clone()
        await this.update()
        await this.sync()
    }

    isInstalled() {
        return files.exists(this.libDir)
    }

    async remove() {
        files.removeDirectory(this.libDir)
    }

    /**
     * Sync the repo and the lib directory of a dependency
     */
    async sync() {
        return new Promise(resolve => {
            console.log('Syncing', this)
            files.assertDirectory(this.sourceDir)
            files.assertDirectory(this.libDir)

            syncDirectory(this.sourceDir, this.libDir, {
                deleteOrphaned: true,
            })
            resolve(null)
        })
    }

    async clone() {
        console.log('Cloning', this)
        if (files.exists(this.cloneDir)) console.log(this, 'is already cloned')
        await new Shell().execute(['git', 'clone', '--depth', '1', '--branch', this.checkout, this.repo, this.cloneDir])
    }

    async update() {
        // TODO: handle changed checkout?
        console.log('Updating', this)
        // TODO: crashes on tag and commit
        await new Shell().execute(['git', '-C', this.cloneDir, 'pull'])
    }

    async upgrade() {
        console.log('Upgrading', this)
        await this.update()
        await this.sync()
    }

    async getDependencies(): Promise<Dependencies> {
        if (!this.isInstalled()) throw new Error(`Dependency ${this} is not installed`)

        if (files.exists(this.dependenciesFile)) {
            return new DependencyFile(this.dependenciesFile).read()
        }
        return []
    }

    // TODO: this is not working
    toString() {
        return this.id
    }
}

export type Dependencies = Dependency[]
