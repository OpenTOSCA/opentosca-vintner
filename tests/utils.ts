import {getDefaultInputs, getDefaultVariableServiceTemplate, loadConfig} from '#controller/template/test'
import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'
import {expect} from 'chai'
import path from 'path'
import Controller from '../src/controller'
import {VariabilityTestGroup, loadDefaultExpect} from '../src/controller/template/test'
import {toList} from '../src/utils/utils'

export async function expectAsyncThrow(fn: () => Promise<unknown>, error: string) {
    try {
        await fn()
    } catch (e) {
        return expect(e.message).to.equal(error)
    }
    throw new Error(`Expected that error "${error}" is thrown`)
}

export function runGroups(groups: VariabilityTestGroup[]) {
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
}

export function getDefaultTest(dir: string, vstdir?: string) {
    return async function () {
        files.assertDirectory(dir)
        const config = loadConfig(dir)
        const output = files.temporary()

        async function fn() {
            await Controller.template.resolve({
                template: getDefaultVariableServiceTemplate(vstdir || dir),
                inputs: getDefaultInputs(dir),
                output,
                presets: toList(config.presets),
            })
        }

        if (config.error) {
            await expectAsyncThrow(fn, config.error)
        } else {
            await fn()
            const result = files.loadYAML<ServiceTemplate>(output)
            const expected = config.expected
                ? files.loadYAML<ServiceTemplate>(path.resolve(dir, config.expected))
                : loadDefaultExpect(dir)
            expect(result).to.deep.equal(expected)
        }
    }
}
