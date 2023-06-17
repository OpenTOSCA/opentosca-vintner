import Controller from '#controller'
import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'
import {toList} from '#utils'
import * as validator from '#validator'
import * as console from 'console'
import jsonDiff from 'json-diff'
import path from 'path'

export type TemplateTestOptions = {path: string}

export type VariabilityTestGroup = {
    name: string
    tests: VariabilityTest[]
}

export type VariabilityTest = {
    name: string
    dir: string
    vstdir?: string
}

export type VariabilityTestConfig = {
    name?: string
    description?: string
    presets?: string | string[]
    error?: string
    expected?: string
}

export default async function (options: TemplateTestOptions) {
    const testsDir = path.join(options.path, 'tests')

    const tests: VariabilityTest[] = files
        .listDirectories(testsDir)
        .filter(it => !it.startsWith('.'))
        .map(test => ({name: test, dir: path.join(testsDir, test)}))

    const onlyTests = tests.filter(test => test.name.endsWith('---only'))
    const nonDisabledTests = tests.filter(test => !test.name.endsWith('---disabled'))
    const effectiveTests = onlyTests.length ? onlyTests : nonDisabledTests

    for (const test of effectiveTests) {
        console.log(`Running test "${test.name}"`)
        await runTest(test.dir, options.path)
    }

    console.log('Tests run successful')
}

async function runTest(dir: string, vstdir: string) {
    files.assertDirectory(dir)
    const config = loadConfig(dir)
    const output = files.temporary()

    async function fn() {
        await Controller.template.resolve({
            template: getDefaultVariableServiceTemplate(vstdir),
            inputs: getDefaultInputs(dir),
            output,
            presets: toList(config.presets),
        })
    }

    if (validator.isDefined(config.error)) {
        try {
            await fn()
        } catch (e) {
            if (e.message !== config.error) throw new Error(`Expected error "${config.error}" but got "${e.message}"`)
            return
        }
        throw new Error(`Expected to throw error "${config.error}"`)
    } else {
        await fn()
        const result = files.loadYAML<ServiceTemplate>(output)
        const expected = loadDefaultExpect(dir)

        const diff = jsonDiff.diffString(expected, result)
        if (diff) {
            console.log('Resolving failed')
            console.log(diff)
        }
    }
}

export function getDefaultVariableServiceTemplate(dir: string) {
    for (const name of ['vst.yaml', 'variable-service-template.yaml', 'service-template.yaml', 'template.yaml']) {
        const file = path.join(dir, name)
        if (files.isFile(file)) return file
    }
    throw new Error(`Did not find variable service template in directory "${dir}"`)
}

export function getDefaultInputs(dir: string) {
    for (const name of ['inputs.yaml', 'inputs.xml']) {
        const file = path.join(dir, name)
        if (files.isFile(file)) return file
    }
}

export function loadDefaultExpect(dir: string) {
    for (const name of ['est.yaml', 'expected.yaml']) {
        const file = path.join(dir, name)
        if (files.isFile(file)) return files.loadYAML<ServiceTemplate>(file)
    }
    throw new Error(`Did not find expected service template in directory "${dir}"`)
}

export function loadConfig(dir: string) {
    const config = path.join(dir, 'test.yaml')
    if (files.isFile(config)) return files.loadYAML<VariabilityTestConfig>(config)
    return {}
}
