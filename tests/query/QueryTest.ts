import * as assert from '#assert'
import * as check from '#check'
import runQuery from '#controller/query/run'
import resolveQueries from '#controller/template/query'
import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'
import {UnexpectedError} from '#utils/error'
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
        assert.isName(name)

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
        if (!this.ofTypeDefault() && !this.ofTypeTemplate()) throw new Error(`Test "${this.id}" has no template"`)

        // Set default path to template
        if (check.isUndefined(config.template)) {
            if (this.ofTypeDefault()) this.config.template = path.join(__dirname, 'template.yaml')
            if (this.ofTypeTemplate()) this.config.template = path.join(this.dir, 'template.yaml')
        }
        assert.isDefined(this.config.template, `Test "${this.id}" has no template path"`)

        // Load template
        this.template = files.loadYAML(this.config.template)

        // Load result
        this.expected = check.isUndefined(config.error)
            ? files.loadYAML(path.join(this.dir, 'expected.yaml'))
            : undefined
    }

    ofTypeDefault() {
        return this.config.type === 'default'
    }

    ofTypeTemplate() {
        return this.config.type === 'template'
    }

    toTest() {
        if (this.ofTypeDefault()) return this.toDefaultTest()
        if (this.ofTypeTemplate()) return this.toTemplateTest()
        throw new UnexpectedError()
    }

    toDefaultTest() {
        const query = this.config.query
        assert.isString(query)
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

            if (check.isDefined(test.config.error)) {
                await expectAsyncThrow(fn, test.config.error)
            } else {
                const output = await fn()
                expect(files.loadYAML(output)).to.deep.equal(test.expected)
            }
        }
    }

    toDocFile() {
        return 'test-' + this.id + '.md'
    }

    toFileTitle() {
        if (this.ofTypeDefault()) return 'tests/query/template.yaml'
        if (this.ofTypeTemplate()) return `tests/query/` + this.id + `/template.yaml`
        throw new UnexpectedError()
    }
}

export function loadAllTests() {
    return files
        .listDirectories(path.join(__dirname))
        .filter(it => !it.startsWith('.'))
        .map(it => new QueryTest(it))
}
