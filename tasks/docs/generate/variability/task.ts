import * as check from '#check'
import {
    getInputs,
    getVariableServiceTemplate,
    loadConfig,
    loadExpected,
    VariabilityTestConfig,
} from '#controller/template/test'
import * as files from '#files'
import Loader from '#graph/loader'
import {ServiceTemplate} from '#spec/service-template'
import {InputAssignmentMap} from '#spec/topology-template'
import _ from 'lodash'
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
            const template = new Loader(getVariableServiceTemplate({dir, file: config.template})).raw()
            const inputs = loadInputs(dir, config.inputs)

            let expected
            if (!check.isDefined(config.error)) {
                expected = loadExpected({dir, file: config.expected})
                if (check.isDefined(config.merge)) {
                    expected = _.merge(expected, config.merge)
                }
            }

            tests.push({
                id,
                config,
                inputs,
                template,
                expected,
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

function loadInputs(dir: string, override?: string) {
    const file = getInputs(dir, override)
    if (check.isDefined(file)) return files.loadYAML<InputAssignmentMap>(file)
    return {}
}

main()
