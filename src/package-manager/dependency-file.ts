import * as files from '../utils/files'
import {Dependencies, Dependency} from './dependency'
import config from "../utils/config";

export type DependencyFileData = {[id: string]: DependencyShortNotation}
export type DependencyShortNotation = string
// TODO: DependencyExtendedNotation

export class DependencyFile {
    path: string

    constructor(path: string = config.dependencyFile) {
        this.path = path
    }

    read() {
        return Object.entries(files.loadYAML<DependencyFileData>(this.path)).map(([id, repo]) => {
            const data = id.split('@')
            return new Dependency(data[0], data[1], repo)
        })
    }

    get(name: string, checkout: string) {
        return this.read().find(it => it.id === `${name}@${checkout}`)
    }

    add(dependency: Dependency) {
        this.ensureExists()
        const dependencies = this.read()
        console.log(dependencies, dependency)
        if (dependencies.find(it => it.id === dependency.id)) {
            console.log(`${dependency} is already added`)
            return this
        }

        dependencies.push(dependency)
        this.store(dependencies)

        return this
    }

    remove(dependency: Dependency) {
        const dependencies = this.read().filter(it => it.id !== dependency.id)
        this.store(dependencies)
    }

    store(dependencies: Dependencies) {
        const sorted = dependencies.sort((a, b) => a.id.localeCompare(b.id))
        files.storeYAML<DependencyFileData>(
            this.path,
            sorted.reduce<DependencyFileData>((output, dependency) => {
                output[dependency.id] = dependency.repo
                return output
            }, {})
        )
        return this
    }

    exists() {
        return files.exists(this.path)
    }

    ensureExists() {
        files.createFile(this.path)
    }
}
