import {expect} from 'chai'
import benchmark, {generateBenchmarkServiceTemplate} from '#controller/setup/benchmark'
import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'
import * as path from 'path'
import {getDefaultTest} from '../utils'

it('benchmark: run', () => {
    benchmark({seeds: [2], runs: 1})
})

it('benchmark: generate service template', () => {
    const result = generateBenchmarkServiceTemplate(2)
    expect(result).to.deep.equal(
        files.loadYAML<ServiceTemplate>(path.join(__dirname, 'variable-service-template.yaml'))
    )
})

it('benchmark: resolve', getDefaultTest({dir: 'benchmark'}))
