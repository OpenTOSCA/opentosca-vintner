import {
    getDefaultInputs,
    getDefaultVariableServiceTemplate,
    loadConfig,
    loadDefaultExpect,
    VariabilityTestConfig,
} from '#controller/template/test'
import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'
import {InputAssignmentMap} from '#spec/topology-template'
import * as validator from '#validator'
import * as path from 'path'

type Test = {
    id: string
    config?: VariabilityTestConfig
    inputs?: InputAssignmentMap
    template: ServiceTemplate
    expected?: ServiceTemplate
    file: string
}

async function main() {
    const documentationDirectory = path.join('docs', 'docs', 'variability4tosca', 'tests')
    files.removeDirectory(documentationDirectory)
    files.createDirectory(documentationDirectory)

    const testsDirectory = path.join('tests', 'conformance')

    const tests: Test[] = []

    for (const group of files.listDirectories(path.join(testsDirectory))) {
        const groupDir = path.join(testsDirectory, group)
        files.listDirectories(groupDir).forEach(test => {
            const dir = path.join(groupDir, test)
            const id = `${group}-${test}`
            const config = loadConfig(dir)
            const template = files.loadYAML<ServiceTemplate>(getDefaultVariableServiceTemplate(dir))
            const inputs = getDefaultInputs(dir)
                ? files.loadYAML<InputAssignmentMap>(getDefaultInputs(dir)!)
                : undefined
            tests.push({
                id,
                config,
                inputs,
                template,
                expected: validator.isUndefined(config.error) ? loadDefaultExpect(dir) : undefined,
                file: `test-${id}.md`,
            })
        })
    }

    await files.renderFile(
        path.join(__dirname, 'introduction.template.ejs'),
        {tests},
        path.join(documentationDirectory, 'introduction.md')
    )

    for (const test of tests) {
        await files.renderFile(
            path.join(__dirname, 'test.template.ejs'),
            {test, utils: {toYAML: files.toYAML}},
            path.join(documentationDirectory, test.file)
        )
    }
}

main()
