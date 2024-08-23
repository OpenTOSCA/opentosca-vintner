import * as assert from '#assert'
import * as files from '#files'
import path from 'path'

export type RawConfig = {
    dependencies?: RawDependency[]
}

export type RawDependency = {
    source: string
    target?: string
}

export type Options = {
    link?: boolean
}

export class Config {
    private raw?: RawConfig

    readonly dir: string
    readonly file: string
    readonly options: Options

    dependencies: Dependency[] = []

    constructor(dir: string, options?: Options) {
        this.dir = dir
        this.file = path.join(this.dir, 'config.yaml')
        this.options = options ?? {}
    }

    load() {
        if (!files.exists(this.file)) return (this.raw = {})

        const data = files.loadYAML<RawConfig>(path.join(this.dir, 'config.yaml'))
        this.raw = data

        assert.isArray(data.dependencies)
        this.dependencies = data.dependencies.map(it => new Dependency(this, it))

        return this
    }

    async pull() {
        return Promise.all(this.dependencies.map(it => it.pull()))
    }

    async unpull() {
        return Promise.all(this.dependencies.map(it => it.unpull()))
    }
}

export class Dependency {
    private config: Config
    private raw: RawDependency

    constructor(config: Config, raw: RawDependency) {
        this.config = config
        this.raw = raw
    }

    get source() {
        return path.isAbsolute(this.raw.source) ? this.raw.source : path.join(this.config.dir, this.raw.source)
    }

    get target() {
        if (this.config.options.link) {
            return path.join(this.config.dir, this.raw.target || '.')
        }
        return path.join(this.config.dir, this.raw.target || files.getBase(this.source))
    }

    async pull() {
        if (this.config.options.link) {
            await files.linkDirent(this.source, this.target)
        } else {
            await files.syncDirent(this.source, this.target)
        }
    }

    async unpull() {
        // We assume that link is false. Otherwise, target is missing the base.
        await files.removeDirent(this.target)
    }
}
