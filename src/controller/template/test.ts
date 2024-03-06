import * as check from '#check'
import Controller from '#controller'
import * as files from '#files'
import Loader from '#graph/loader'
import std from '#std'
import * as utils from '#utils'
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

/**
 * Used in
 * - docs command
 * - jest test
 * - controller test
 */
export type VariabilityTestConfig = {
    name?: string
    description?: string
    presets?: string | string[]
    error?: string
    template?: string
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
        std.log(`Running test "${test.name}"`)
        await runTest(test.dir, options.path)
    }
}

async function runTest(dir: string, vstdir: string) {
    files.assertDirectory(dir)

    const config = loadConfig(dir)
    const output = files.temporary()

    async function fn() {
        await Controller.template.resolve({
            template: getVariableServiceTemplate({dir: vstdir, file: config.template}),
            inputs: getDefaultInputs(dir),
            output,
            presets: utils.toList(config.presets),
        })
    }

    if (check.isDefined(config.error)) {
        try {
            await fn()
        } catch (e) {
            if (e.message !== config.error) throw new Error(`Expected error "${config.error}" but got "${e.message}"`)
            return
        }
        throw new Error(`Expected to throw error "${config.error}"`)
    } else {
        await fn()
        const result = new Loader(output).raw()
        const expected = loadExpected({dir, file: config.expected})

        const diff = jsonDiff.diffString(expected, result)
        if (diff) {
            std.log('Resolving failed')
            std.log(diff)
        }
    }
}

export function getVariableServiceTemplate(data: {dir: string; file?: string}) {
    if (check.isDefined(data.file)) return path.join(data.dir, data.file)

    for (const name of ['vst.yaml', 'variable-service-template.yaml', 'service-template.yaml', 'template.yaml']) {
        const file = path.join(data.dir, name)
        if (files.isFile(file)) return file
    }

    throw new Error(`Did not find variable service template in directory "${data.dir}"`)
}

export function getDefaultInputs(dir: string) {
    for (const name of ['inputs.yaml', 'inputs.xml']) {
        const file = path.join(dir, name)
        if (files.isFile(file)) return file
    }
}

export function loadExpected(data: {dir: string; file?: string}) {
    if (check.isDefined(data.file)) return new Loader(path.join(data.dir, data.file)).raw()

    for (const name of ['est.yaml', 'expected.yaml']) {
        const file = path.join(data.dir, name)
        if (files.isFile(file)) return new Loader(file).raw()
    }

    throw new Error(`Did not find expected service template in directory "${data.dir}"`)
}

export function loadConfig(dir: string) {
    const config = path.join(dir, 'test.yaml')
    if (files.isFile(config)) return files.loadYAML<VariabilityTestConfig>(config)
    return {}
}
