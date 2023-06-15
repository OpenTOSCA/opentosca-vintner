import runQuery from '#controller/query/run'
import resolveQueries from '#controller/template/query'
import {ServiceTemplate} from '#spec/service-template'
import * as files from '#utils/files'
import * as validator from '#utils/validator'
import {expect} from 'chai'
import path from 'path'
import {expectAsyncThrow} from '../utils'

export type QueryTestConfig = {
    name?: string
    description?: string
    error?: string
    query?: string
    type: 'default' | 'template'
    template: string
}

export class QueryTest {
    id: string
    dir: string

    config: QueryTestConfig
    template: ServiceTemplate
    expected: any

    constructor(name: string) {
        validator.ensureName(name)

        this.id = name
        this.dir = path.join(__dirname, name)

        // Load config
        const config = files.loadYAML<QueryTestConfig>(path.join(this.dir, 'test.yaml'))

        // Set default type
        config.type = config.type ?? 'default'
        this.config = config

        // Set default name
        this.config.name = this.config.name ?? this.id

        // Validate type
        if (config.type !== 'default' && config.type !== 'template')
            throw new Error(`Test "${this.id}" has no template"`)

        // Set default path to template
        if (validator.isUndefined(config.template)) {
            if (config.type === 'default') this.config.template = path.join(__dirname, 'template.yaml')
            if (config.type === 'template') this.config.template = path.join(this.dir, 'template.yaml')
        }
        validator.ensureDefined(this.config.template, `Test "${this.id}" has no template path"`)

        // Load template
        this.template = files.loadYAML(this.config.template)

        // Load result
        this.expected = validator.isUndefined(config.error)
            ? files.loadYAML(path.join(this.dir, 'expected.yaml'))
            : undefined
    }

    toTest() {
        if (this.config.type === 'default') return this.toDefaultTest()
        if (this.config.type === 'template') return this.toTemplateTest()
    }

    toDefaultTest() {
        const query = this.config.query
        validator.ensureString(query)
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const test = this

        return async function () {
            //@ts-ignore
            const title = this.test.title

            const result = await runQuery({query, source: 'file'})
            expect(result).to.deep.equal(test.expected)
        }
    }

    toTemplateTest() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const test = this

        return async function () {
            //@ts-ignore
            const title = this.test.title

            async function fn() {
                const output = files.temporary()
                await resolveQueries({
                    output,
                    template: test.config.template,
                })
                return output
            }

            if (validator.isDefined(test.config.error)) {
                await expectAsyncThrow(fn, test.config.error)
            } else {
                const output = await fn()
                expect(files.loadYAML(output)).to.deep.equal(test.expected)
            }
        }
    }
}

export function loadAllTests() {
    return files
        .listDirectories(path.join(__dirname))
        .filter(it => !it.startsWith('.'))
        .map(it => new QueryTest(it))
}

describe('queries', async () => {
    try {
        for (const test of loadAllTests()) {
            it(test.id, test.toTest())
        }
    } catch (e) {
        console.log(e)
        process.exit(1)
    }
})
