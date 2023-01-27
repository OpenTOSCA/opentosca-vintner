import * as path from 'path'
import * as files from '#files'
import {renderFile} from '../utils'
import {
    getDefaultInputs,
    getDefaultVariableServiceTemplate,
    readConfig,
    readDefaultExpect,
} from '../../../src/controller/template/test'
import {ServiceTemplate} from '../../../src/specification/service-template'

type Test = {
    id: string
    name: string
    description?: string
    preset?: string
    error?: string
    inputs?: string
    template?: string
    expected?: string
    resolver?: string
}

async function main() {
    const documentationDirectory = path.join('docs', 'docs', 'variability4tosca', 'conformance-tests')
    files.removeDirectory(documentationDirectory)
    files.createDirectory(documentationDirectory)

    const testsDirectory = path.join('tests', 'conformance')

    const tests: Test[] = []

    for (const group of files.listDirectories(path.join(testsDirectory))) {
        const groupDir = path.join(testsDirectory, group)
        files.listDirectories(groupDir).forEach(test => {
            const dir = path.join(groupDir, test)
            const id = `${group}-${test}`
            const config = readConfig(dir)
            const template = getDefaultVariableServiceTemplate(dir)
                ? files.toYAML(files.loadYAML(getDefaultVariableServiceTemplate(dir)))
                : undefined
            const inputs = getDefaultInputs(dir) ? files.toYAML(files.loadYAML(getDefaultInputs(dir)!)) : undefined
            tests.push({
                id,
                name: config?.name || id,
                description: config.description,
                preset: config.preset,
                error: config.error,
                resolver: files.toYAML(config.resolver),
                inputs,
                template,
                expected: !config.error ? files.toYAML(readDefaultExpect(dir)) : undefined,
            })
        })
    }

    await renderFile(
        path.join(__dirname, 'introduction.ejs'),
        tests,
        path.join(documentationDirectory, 'introduction.md')
    )

    for (const test of tests) {
        await renderFile(
            path.join(__dirname, 'test.ejs'),
            test,
            path.join(documentationDirectory, `test-${test.id}.md`)
        )
    }
}

main()
