import * as path from 'path'
import * as files from '../src/utils/files'
import {ServiceTemplate} from '../src/specification/service-template'
import {expect} from 'chai'
import Controller from '../src/controller'

export function getDefaultTest({preset}: {preset?: string}) {
    return async function () {
        const dir = path.join(__dirname, this.test.title)
        const outputPath = files.temporaryFile()
        await Controller.template.resolve({
            template: getDefaultVariableServiceTemplate(dir),
            output: outputPath,
            preset,
        })
        const result = files.loadFile<ServiceTemplate>(outputPath)
        const expected = readDefaultExpect(dir)
        expect(result).to.deep.equal(expected)
    }
}

export function getDefaultVariableServiceTemplate(dir: string) {
    return path.join(dir, 'variable-service-template.yaml')
}

export function readDefaultExpect(dir: string) {
    return files.loadFile<ServiceTemplate>(path.join(dir, 'expected-service-template.yaml'))
}
