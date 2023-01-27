import * as path from 'path'
import * as files from '#files'
import {renderFile} from '../utils'
import {
    getDefaultInputs,
    getDefaultVariableServiceTemplate,
    readConfig,
    readDefaultExpect,
    VariabilityTestConfig,
} from '../../../src/controller/template/test'
import {ServiceTemplate} from '../../../src/specification/service-template'
import {InputAssignmentMap} from '../../../src/specification/topology-template'
import {snakeCase} from 'snake-case'

type Test = {
    id: string
    config?: VariabilityTestConfig
    inputs?: InputAssignmentMap
    template: ServiceTemplate
    expected?: ServiceTemplate
    file: string
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
            const template = files.loadYAML<ServiceTemplate>(getDefaultVariableServiceTemplate(dir))
            const inputs = getDefaultInputs(dir)
                ? files.loadYAML<InputAssignmentMap>(getDefaultInputs(dir)!)
                : undefined
            tests.push({
                id,
                config,
                inputs,
                template,
                expected: !config.error ? readDefaultExpect(dir) : undefined,
                file: `test-${id}.md`,
            })
        })
    }

    await renderFile(
        path.join(__dirname, 'introduction.template.ejs'),
        tests,
        path.join(documentationDirectory, 'introduction.md')
    )

    for (const test of tests) {
        await renderFile(
            path.join(__dirname, 'test.template.ejs'),
            {test, utils: {toYAML: files.toYAML, toSnakeCase: snakeCase}},
            path.join(documentationDirectory, test.file)
        )
    }
}

main()
