import runQuery from '#controller/query/run'
import resolveQueries from '#controller/template/query'
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
}

describe('queries', async () => {
    try {
        for (const test of files.listDirectories(path.join(__dirname)).filter(it => !it.startsWith('.'))) {
            const dir = path.join(__dirname, test)

            const config = files.loadYAML<QueryTestConfig>(path.join(dir, 'test.yaml'))

            config.type = config.type || 'default'

            if (config.type === 'default') {
                const query = config.query
                validator.isString(query)
                it(test, getDefaultQueryTest(query!))
                continue
            }

            if (config.type === 'template') {
                it(test, getDefaultTemplateTest(test + '/template.yaml', config))
                continue
            }

            throw new Error(`Test "${test}" has unknown type "${config.type}"`)
        }
    } catch (e) {
        console.log(e)
        process.exit(1)
    }
})

function getDefaultQueryTest(query: string) {
    return async function () {
        //@ts-ignore
        const title = this.test.title

        const result = await runQuery({query, source: 'file'})
        expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, title, 'expected.yaml')))
    }
}

function getDefaultTemplateTest(template: string, config?: QueryTestConfig) {
    return async function () {
        //@ts-ignore
        const title = this.test.title

        async function fn() {
            return await resolveTemplate(template)
        }

        if (config?.error) {
            await expectAsyncThrow(fn, config.error)
        } else {
            const output = await fn()
            expect(files.loadYAML(output)).to.deep.equal(files.loadYAML(path.join(__dirname, title, 'expected.yaml')))
        }
    }
}

async function resolveTemplate(templatePath: string) {
    const output = files.temporary()
    await resolveQueries({
        output,
        template: path.join(__dirname, templatePath),
    })
    return output
}
