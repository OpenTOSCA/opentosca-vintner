import * as path from 'path'
import * as files from '../src/utils/files'
import {ServiceTemplate} from '../src/specification/service-template'
import {expect} from 'chai'
import Controller from '../src/controller'
import {VariabilityResolver} from '../src/controller/template/resolve'

export function getDefaultTest({
    preset,
    error,
    example,
    pruneRelations,
    forcePruneRelations,
    disableConsistencyCheck,
}: {
    preset?: string
    error?: string
    example?: string
    pruneRelations?: boolean
    forcePruneRelations?: boolean
    disableConsistencyCheck?: boolean
}) {
    return async function () {
        const dir = path.join(__dirname, this.test.title)
        files.assertDirectory(dir)

        const output = files.temporaryFile()
        function fn() {
            Controller.template.resolve({
                template: getDefaultVariableServiceTemplate({dir, example}),
                inputs: getDefaultInputs(dir),
                output,
                preset,
                pruneRelations,
                forcePruneRelations,
                disableConsistencyCheck,
            })
        }

        if (error) {
            expect(fn).to.throw(error)
        } else {
            await fn()
            const result = files.loadFile<ServiceTemplate>(output)
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
    const file = path.join(dir, 'inputs.yaml')
    if (files.isFile(file)) return file
}

export function readDefaultExpect(dir: string) {
    return files.loadFile<ServiceTemplate>(path.join(dir, 'expected-service-template.yaml'))
}

export function getDefaultVariabilityResolver() {
    return new VariabilityResolver({} as any)
}
