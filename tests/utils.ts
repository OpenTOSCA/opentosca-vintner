import * as path from 'path'
import * as files from '../src/utils/files'
import {ServiceTemplate} from '../src/specification/service-template'
import {expect} from 'chai'
import Controller from '../src/controller'
import {ResolvingOptions, VariabilityResolver} from '../src/controller/template/resolve'

export function getDefaultTest({
    preset,
    error,
    example,
    ...remainingOptions
}: {
    preset?: string
    error?: string
    example?: string
} & ResolvingOptions) {
    return async function () {
        //@ts-ignore
        const title = this.test.title
        const dir = path.join(__dirname, title)
        files.assertDirectory(dir)

        const output = files.temporaryPath()
        function fn() {
            Controller.template.resolve({
                template: getDefaultVariableServiceTemplate({dir, example}),
                inputs: getDefaultInputs(dir),
                output,
                preset,
                ...remainingOptions,
            })
        }

        if (error) {
            expect(fn).to.throw(error)
        } else {
            await fn()
            const result = files.loadYAML<ServiceTemplate>(output)
            const expected = readDefaultExpect(dir)
            expect(result).to.deep.equal(expected)
        }
    }
}

export function getDefaultVariableServiceTemplate({dir, example}: {dir: string; example?: string}) {
    const base = example ? ['examples', example] : [dir]
    const file = path.join(...base, 'variable-service-template.yaml')
    files.assertFile(file)
    return file
}

export function getDefaultInputs(dir: string) {
    const yml = path.join(dir, 'inputs.yaml')
    if (files.isFile(yml)) return yml

    const xml = path.join(dir, 'inputs.xml')
    if (files.isFile(xml)) return xml
}

export function readDefaultExpect(dir: string) {
    return files.loadYAML<ServiceTemplate>(path.join(dir, 'expected-service-template.yaml'))
}

export function getDefaultVariabilityResolver() {
    return new VariabilityResolver({} as any)
}
