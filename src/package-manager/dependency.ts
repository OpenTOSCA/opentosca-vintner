import {Shell} from '../utils/shell'
import * as files from '../utils/files'
import path from 'path'
import config from '../utils/config'

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

    async install() {
        console.log('Installing', this.id)

        await this.clone()
        await this.update()
        await this.sync()
    }

    async clone() {
        console.log('Cloning', this.id)
        files.createDirectory(config.packageCacheDir)

        if (!files.exists(this.cloneDir)) {
            console.log('Cloning repo', this.repo, 'into', this.cloneDir)
            await this.shell.execute(['git', 'clone', this.repo, this.cloneDir])
        } else {
            console.log(this.repo, 'already cloned')
        }

        if (!files.exists(this.worktreeDir)) {
            console.log('Adding worktree for', this.checkout, 'at', this.worktreeDir)
            await this.shell.execute(
                ['git', 'worktree', 'add', '--force', '--checkout', this.worktreeDir, this.checkout],
                {
                    cwd: this.cloneDir,
                }
            )
            return true
        }

        console.log(this.id, 'already added')
        return false
    }

    async update() {
        console.log('Updating', this.id)
        files.assertDirectory(this.cloneDir)
        files.assertDirectory(this.worktreeDir)

        console.log('Checking status of', this.id)
        const status = await this.shell.execute(['git', 'status'], {cwd: this.worktreeDir})
        if (status.output.startsWith('On branch')) {
            console.log('Pulling', this.id)
            const pull = await this.shell.execute(['git', '-C', this.worktreeDir, 'pull'])
            if (pull.output.startsWith('Already up to date.')) {
                console.log(this.id, 'already up to date')
            } else {
                console.log('Updated', this.id)
            }
        } else {
            console.log('Not updating since', this.id, 'is not a branch')
        }
    }

    async sync() {
        console.log('Syncing', this.id)
        files.syncDirectory(this.sourceDir, this.targetDir)
    }

    async upgrade() {
        console.log('Upgrading', this.id)
        await this.update()
        await this.sync()
    }

    async remove() {
        files.removeDirectory(this.targetDir)
    }

    toString() {
        return this.id
    }
}

export type Dependencies = Dependency[]
