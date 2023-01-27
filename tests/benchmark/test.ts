import {expect} from 'chai'
import benchmark, {generateBenchmarkServiceTemplate} from '#controller/setup/benchmark'
import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'
import * as path from 'path'

describe('benchmark', () => {
    it('run', () => {
        benchmark({seeds: [2], runs: 1})
    })

    it('generate service template', () => {
        const result = generateBenchmarkServiceTemplate(2)
        expect(result).to.deep.equal(files.loadYAML<ServiceTemplate>(path.join(__dirname, 'expected.yaml')))
    })
})
