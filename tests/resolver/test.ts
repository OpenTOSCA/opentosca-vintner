import * as files from '#files'
import path from 'path'
import Controller from '../../src/controller'
import {ServiceTemplate} from '#spec/service-template'
import {expect} from 'chai'
import {expectAsyncThrow} from '../utils'
import {
    getDefaultInputs,
    getDefaultVariableServiceTemplate,
    readConfig,
    readDefaultExpect,
    VariabilityTest,
} from '#controller/template/test'

type Group = {
    name: string
    tests: VariabilityTest[]
}

describe('resolver', async () => {
    const groups: Group[] = []

    for (const group of files.listDirectories(path.join(__dirname))) {
        const groupDir = path.join(__dirname, group)
        groups.push({
            name: group,
            tests: files.listDirectories(groupDir).map(test => ({name: test, dir: path.join(groupDir, test)})),
        })
    }

    const examplesDir = path.join(__dirname, '..', '..', 'examples')
    const examples = files.listDirectories(examplesDir)
    for (const example of examples) {
        const exampleDir = path.join(examplesDir, example)
        const testsPath = path.join(exampleDir, 'tests')

        groups.push({
            name: `example-${example}`,
            tests: files
                .listDirectories(testsPath)
                .map(test => ({name: test, dir: path.join(testsPath, test), vstdir: exampleDir})),
        })
    }

    const onlyGroups = groups.filter(group => group.name.endsWith('---only'))
    const nonDisabledGroups = groups.filter(group => !group.name.endsWith('---disabled'))
    const effectiveGroups = onlyGroups.length ? onlyGroups : nonDisabledGroups

    for (const group of effectiveGroups) {
        describe(group.name, async () => {
            const onlyTests = group.tests.filter(test => test.name.endsWith('---only'))
            const nonDisabledTests = group.tests.filter(test => !test.name.endsWith('---disabled'))
            const effectiveTests = onlyTests.length ? onlyTests : nonDisabledTests

            effectiveTests.forEach(test => {
                it(test.name, getDefaultTest(test.dir, test.vstdir))
            })
        })
    }
})

export function getDefaultTest(dir: string, vstdir?: string) {
    return async function () {
        files.assertDirectory(dir)
        const config = readConfig(dir)
        const output = files.temporaryFile()

        async function fn() {
            await Controller.template.resolve({
                template: getDefaultVariableServiceTemplate(vstdir || dir),
                inputs: getDefaultInputs(dir),
                output,
                preset: config.preset,
                ...config.resolver,
            })
        }

        if (config.error) {
            await expectAsyncThrow(fn, config.error)
        } else {
            await fn()
            const result = files.loadYAML<ServiceTemplate>(output)
            const expected = readDefaultExpect(dir)
            expect(result).to.deep.equal(expected)
        }
    }
}
