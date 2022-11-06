import {Shell} from '../utils/shell'
import * as files from '../utils/files'
import path from 'path'
// TODO: fix recursive import?
import {DependencyFile} from './dependency-file'
import config from '../utils/config'

// TODO: fix paths for wsl integration?

export class Dependency {
    // Dependency name
    name: string

    // Commit, branch or tag to checkout
    checkout: string

    // Repository to clone
    repo: string

    // name@checkout
    id: string

    // Directory to which dependency is installed
    targetDir: string

    // Directory to which repository is cloned
    cloneDir: string

    // Directory of worktree of cloned repository
    worktreeDir: string

    // Directory of dependency inside worktree
    sourceDir: string

    // Dependency file of recursive dependencies
    dependencyFile: string

    // Shell for git commands
    shell = new Shell()

    constructor(name: string, checkout: string, repo: string) {
        this.name = name
        this.checkout = checkout
        this.repo = repo
        this.id = [name, checkout].join('@')
        this.targetDir = path.join(config.libDir, this.id)
        this.cloneDir = path.join(config.packageCacheDir, files.sanitize(this.repo))
        this.worktreeDir = path.join(config.packageCacheDir, this.id)
        this.sourceDir = path.join(this.worktreeDir, ...name.split('.'))
        this.dependencyFile = path.join(this.targetDir, config.dependencyFile)
    }

    isInstalled() {
        return files.exists(this.targetDir)
    }

    async install() {
        console.log('Installing', this)
        await this.clone()
        await this.update()
        await this.sync()
    }

    async clone() {
        console.log('Cloning', this)
        files.createDirectory(config.packageCacheDir)

        if (!files.exists(this.cloneDir)) {
            console.log('Cloning repo', this.repo, 'into', this.cloneDir)
            await this.shell.execute(['git', 'clone', this.repo, this.cloneDir])
        } else {
            console.log('Repo is already cloned')
        }

        if (!files.exists(this.worktreeDir)) {
            console.log('Adding worktree for', this.checkout, 'at', this.worktreeDir)
            await this.shell.execute(
                ['git', 'worktree', 'add', '--force', '--checkout', this.worktreeDir, this.checkout],
                {
                    cwd: this.cloneDir,
                }
            )
        } else {
            console.log(this, 'already added')
        }
    }

    async update() {
        console.log('Updating', this)
        files.assertDirectory(this.cloneDir)
        files.assertDirectory(this.worktreeDir)

        console.log('Checking status of', this)
        const status = await this.shell.execute(['git', 'status'], {cwd: this.worktreeDir})
        if (status.output.startsWith('On branch')) {
            console.log('Pulling', this)
            const pull = await this.shell.execute(['git', '-C', this.worktreeDir, 'pull'])
            if (pull.output.startsWith('Already up to date.')) {
                console.log('Already up to date')
            } else {
                console.log('Updated', this)
            }
        } else {
            console.log('Not updating since', this, 'is not a branch')
        }
    }

    async sync() {
        console.log('Syncing', this)
        files.syncDirectory(this.sourceDir, this.targetDir)
    }

    async upgrade() {
        console.log('Upgrading', this)
        await this.update()
        await this.sync()
    }

    async remove() {
        files.removeDirectory(this.targetDir)
    }

    async getDependencies(): Promise<Dependencies> {
        if (!this.isInstalled()) throw new Error(`Dependency ${this} is not installed`)

        if (files.exists(this.dependencyFile)) {
            return new DependencyFile(this.dependencyFile).read()
        }
        return []
    }

    // TODO: this is not working
    toString() {
        return this.id
    }
}

export type Dependencies = Dependency[]
