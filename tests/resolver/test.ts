import * as files from '#files'
import path from 'path'
import {ResolvingOptions} from '../../src/controller/template/resolve'
import Controller from '../../src/controller'
import {ServiceTemplate} from '../../src/specification/service-template'
import {expect} from 'chai'
import {expectAsyncThrow} from '../utils'

describe('resolver', async () => {
    const groups = files.listDirectories(path.join(__dirname))
    for (const group of groups) {
        const groupDir = path.join(__dirname, group)
        describe(group, async () => {
            const tests = files.listDirectories(groupDir)
            tests.forEach(test => {
                it(test, getDefaultTest(path.join(groupDir, test)))
            })
        })
    }

    const examplesDir = path.join(__dirname, '..', '..', 'examples')
    const examples = files.listDirectories(examplesDir)
    for (const example of examples) {
        const exampleDir = path.join(examplesDir, example)
        const testsPath = path.join(exampleDir, 'tests')

        describe(example, async () => {
            const tests = files.listDirectories(testsPath)
            tests.forEach(test => {
                it(test, getDefaultTest(path.join(testsPath, test), exampleDir))
            })
        })
    }
})

type Config = {
    preset?: string
    error?: string
    dir?: string
    resolver?: ResolvingOptions
}

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

function getDefaultVariableServiceTemplate(dir: string) {
    const first = path.join(dir, 'vst.yaml')
    if (files.isFile(first)) return first

    const second = path.join(dir, 'variable-service-template.yaml')
    if (files.isFile(second)) return second

    throw new Error(`Did not find variable service template in directory "${dir}"`)
}

function getDefaultInputs(dir: string) {
    const yaml = path.join(dir, 'inputs.yaml')
    if (files.isFile(yaml)) return yaml

    const xml = path.join(dir, 'inputs.xml')
    if (files.isFile(xml)) return xml
}

function readDefaultExpect(dir: string) {
    return files.loadYAML<ServiceTemplate>(path.join(dir, 'est.yaml'))
}

function readConfig(dir: string) {
    const config = path.join(dir, 'test.yaml')
    if (files.isFile(config)) return files.loadYAML<Config>(config)

    return {}
}
