import * as check from '#check'
import Controller from '#controller'
import {
    VariabilityTestGroup,
    getInputs,
    getVariableServiceTemplate,
    loadConfig,
    loadExpected,
} from '#controller/template/test'
import * as files from '#files'
import {loadFile, storeFile} from '#files'
import Loader from '#graph/loader'
import std from '#std'
import * as utils from '#utils/utils'
import {expect} from 'chai'
import _ from 'lodash'
import path from 'path'

export async function expectAsyncThrow(fn: () => Promise<unknown>, error: string) {
    try {
        await fn()
    } catch (e) {
        return expect(e.message).to.equal(error)
    }
    throw new Error(`Expected that error "${error}" is thrown`)
}

export function VariabilityTestGroups(dir: string) {
    try {
        const groups: VariabilityTestGroup[] = []

        for (const group of files.listDirectories(path.join(dir)).filter(it => !it.startsWith('.'))) {
            const groupDir = path.join(dir, group)
            groups.push({
                name: group,
                tests: files.listDirectories(groupDir).map(test => ({name: test, dir: path.join(groupDir, test)})),
            })
        }

        runGroups(groups)
    } catch (e) {
        std.log(e)
        process.exit(1)
    }
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
                template: getVariableServiceTemplate({dir: vstdir ?? dir, file: config.template}),
                inputs: getInputs(dir, config.inputs),
                output,
                presets: utils.toList(config.presets),
            })
        }

        if (config.error) {
            await expectAsyncThrow(fn, config.error)
        } else {
            await fn()

            /**
             * Search and replace string in result, e.g., to align node template names restricted in case studies
             */
            if (check.isDefined(config.replace)) {
                let data = loadFile(output)
                data = utils.replace(data, config.replace)
                storeFile(output, data, {onlyIfChanged: true})
            }

            const result = new Loader(output).raw()
            const expected = loadExpected({dir, file: config.expected})

            /**
             * Adapt output by merging with custom JSON, e.g., for patching additional properties in case studies
             */
            if (check.isDefined(config.merge)) {
                _.merge(expected, config.merge)
            }

            expect(result).to.deep.equal(expected)
        }
    }
}
