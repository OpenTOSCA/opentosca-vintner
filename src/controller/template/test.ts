import * as files from '#files'
import path from 'path'
import Controller from '#controller'
import {ServiceTemplate} from '#spec/service-template'
import {ResolvingOptions} from '#controller/template/resolve'
import * as console from 'console'
import jsonDiff from 'json-diff'
import * as validator from '#validator'

export type TemplateTestArguments = {path: string}

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
    preset?: string
    error?: string
    resolver?: ResolvingOptions
}

export default async function (options: TemplateTestArguments) {
    const testsPath = path.join(options.path, 'tests')

    const tests: VariabilityTest[] = files
        .listDirectories(testsPath)
        .map(test => ({name: test, dir: path.join(testsPath, test)}))

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
    const config = readConfig(dir)
    const output = files.temporaryFile()

    async function fn() {
        await Controller.template.resolve({
            template: getDefaultVariableServiceTemplate(vstdir),
            inputs: getDefaultInputs(dir),
            output,
            preset: config.preset,
            ...config.resolver,
        })
    }

    if (config.error) {
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
        const expected = readDefaultExpect(dir)

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

export function readDefaultExpect(dir: string) {
    for (const name of ['est.yaml', 'expected.yaml']) {
        const file = path.join(dir, name)
        if (files.isFile(file)) return files.loadYAML<ServiceTemplate>(file)
    }
    throw new Error(`Did not find expected service template in directory "${dir}"`)
}

export function readConfig(dir: string) {
    const config = path.join(dir, 'test.yaml')
    if (files.isFile(config)) {
        const data = files.loadYAML<VariabilityTestConfig>(config)
        if (validator.isDefined(data.resolver)) data.resolver = data.resolver
        return data
    }

    return {}
}
